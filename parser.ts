import { TokenType, tokens } from './token'
import { Statement, Expression, InfixExpression, Precedance } from './parsers/parserUtils'
import { NumberLiteralParser, ParenthesesParser, GenericPrefixParser, StringLiteralParser, IdentifierParser } from './parsers/prefixParsers'
import { GenericInfixParser } from './parsers/infixParsers'
import { parseElseStatement, parseFunctionStatement, parseIfStatement, parseLetStatement, parseReturnStatement } from './parsers/statementParsers'

export class Parser {

	tokenList: TokenType[] | undefined
	currentToken: number;
	afterToken: number
	statements: Statement[]
	prefixParsers: Map<string, () => Expression>
	infixParsers: Map<string, (left: Expression, precedance: number) => InfixExpression>
	constructor(tokenList?: TokenType[]) {
		this.tokenList = tokenList
		this.currentToken = 0
		this.afterToken = 1
		this.statements = new Array<Statement>()
		this.prefixParsers = new Map()
		this.infixParsers = new Map()

		this.addPrefix(tokens.NUMBER, NumberLiteralParser.bind(this))
		this.addPrefix(tokens.MINUS, GenericPrefixParser.bind(this))
		this.addPrefix(tokens.LPAREN, ParenthesesParser.bind(this))
		this.addPrefix(tokens.STRING, StringLiteralParser.bind(this))
		this.addPrefix(tokens.IDENTIFIER, IdentifierParser.bind(this))

		this.addInfix(tokens.PLUS, GenericInfixParser.bind(this))
		this.addInfix(tokens.MINUS, GenericInfixParser.bind(this))
		this.addInfix(tokens.ASTERISK, GenericInfixParser.bind(this))
		this.addInfix(tokens.FRONT_SLASH, GenericInfixParser.bind(this))
		this.addInfix(tokens.EQUALS, GenericInfixParser.bind(this))
		this.addInfix(tokens.NOT_EQUAL, GenericInfixParser.bind(this))
	}
	addPrefix(token: string, parser: () => Expression) {
		this.prefixParsers.set(token, parser)

	}
	addInfix(token: string, parser: (left: Expression, precedance: number) => InfixExpression) {
		this.infixParsers.set(token, parser)
	}
	getPrefixParser(token: TokenType) {
		if (token.type == undefined) throw new Error("Undefined token type in getPrefixParser")
		return this.prefixParsers.get(token.type)

	}
	getInfixParser(token: TokenType) {
		if (token.type == undefined) throw new Error("Undefined token type in getInfixParser")
		return this.infixParsers.get(token.type)

	}
	loadTokens(tokenList: typeof this.tokenList) {
		if (tokenList) this.tokenList = tokenList;
		this.currentToken = 0
		this.afterToken = 1
		return this
	}

	getToken() {
		if (!this.tokenList || this.tokenList.length < this.currentToken) throw new Error("Accessing current token from token list out of bounds.")
		return this.tokenList[this.currentToken]
	}
	getAfterToken() {
		if (!this.tokenList || this.tokenList.length < this.afterToken) throw new Error("Accessing after token from token list out of bounds.")
		return this.tokenList[this.afterToken]
	}
	consumeToken() {
		const token = this.getToken()
		this.incrementToken()
		return token
	}
	consumeAfterToken() {
		const token = this.getAfterToken()
		this.incrementToken()
		this.incrementToken()
		return token
	}
	incrementToken() {
		this.currentToken++
		this.afterToken++
	}
	//default precedance is lowest
	parseExpression(precedance: number = Precedance.LOWEST) {
		let left = this.parsePrefix()
		while (this.getToken() && this.getToken().value != tokens.SEMICOLON && this.getPrecedance(this.getToken()) > precedance && this.getToken().value != tokens.COMMA) {
			left = this.parseInfix(left, this.getPrecedance(this.getToken()))
		}
		return left
	}
	parsePrefix() {
		const token = this.getToken()
		const parser = this.getPrefixParser(token)
		if (!parser) throw new Error("Prefix parser for this token is undefined " + token.type)
		return parser()
	}
	parseInfix(left: Expression, precedance: number) {
		const parser = this.getInfixParser(this.getToken())
		if (!parser) throw new Error("Infix parser for this token does not exist, " + this.getToken().type)
		return parser(left, precedance)
	}
	parseStatement() {
		switch (this.getToken().value) {
			case tokens.LET:
				return parseLetStatement.bind(this)()
			case tokens.ELSEIF:
			case tokens.IF:
				return parseIfStatement.bind(this)()
			case tokens.ELSE:
				return parseElseStatement.bind(this)()
			case tokens.FUNCTION:
				return parseFunctionStatement.bind(this)()
			case tokens.RETURN:
				return parseReturnStatement.bind(this)()

			default:
				throw new Error("Dont know how to parse this statement: " + `'${this.getToken().type}'`);

		}
	}
	parse() {
		const program: any[] = []
		while (this.getToken()) {
			program.push(this.parseStatement())
		}
		return program
	}
	getPrecedance(token: TokenType) {
		if (token.type == undefined) throw new Error("Cannot get precedance for undefined token type")
		return Precedance[token.type] ?? 1
	}
	getAfterPrecedance() {
		return this.getPrecedance(this.getAfterToken())
	}
}

