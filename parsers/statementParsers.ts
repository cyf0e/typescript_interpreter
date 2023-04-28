import { Parser } from "../parser"
import { Precedance, ReturnStatement, } from "./parserUtils"
import { tokens, Token } from "../token"
import { Expression, LetStatement, IfStatement, ElseStatement, ElifStatement, FunctionStatement, Statement, StatementBlock } from "./parserUtils"
export function parseLetStatement(this: Parser) {
	const ident = this.consumeAfterToken()
	this.incrementToken()
	const ls = new LetStatement(ident, this.parseExpression(Precedance.LOWEST))
	this.incrementToken()
	return ls

}
export function parseStatementBlock(this: Parser) {
	this.incrementToken() //skip { token
	const statementBlock: Statement[] = []
	//TODO: This doesnt work with nested statement blocks, fix later
	while (this.getToken().value != '}') {
		statementBlock.push(this.parseStatement())
	}
	this.incrementToken() //skip } token
	return statementBlock

}

export function parseIfStatement(this: Parser) {
	const isIf = this.getToken().value == tokens.IF ? true : false
	this.incrementToken() //skip IF token
	const condition = this.parseExpression(Precedance.LOWEST)
	this.incrementToken() // skip ) token
	const statementBlock: Statement[] = parseStatementBlock.bind(this)()
	const ifSt = isIf ? new IfStatement(condition, new StatementBlock(statementBlock)) : new ElifStatement(condition, new StatementBlock(statementBlock))
	return ifSt


}
export function parseElseStatement(this: Parser) {
	this.incrementToken() // skip else token
	const statementBlock: Statement[] = parseStatementBlock.bind(this)()
	return new ElseStatement(new StatementBlock(statementBlock))
}

export function parseArgumentList(this: Parser) {
	this.incrementToken() //skip ( token
	const argExpressions: Expression[] = []
	let curr: Expression | undefined = undefined
	while (this.getToken().value != ')') {
		if (this.getToken().value == tokens.COMMA) {
			curr && argExpressions.push(curr)
			curr = undefined
			this.incrementToken()
		}
		curr = this.parseExpression()
	}
	curr && argExpressions.push(curr)
	this.incrementToken() // skip ) token
	return argExpressions

}
export function parseFunctionStatement(this: Parser) {
	this.incrementToken() //skip function token
	const identifier = this.consumeToken()
	const args: Expression[] = parseArgumentList.bind(this)()
	const statementBlock: Statement[] = parseStatementBlock.bind(this)()
	return new FunctionStatement(identifier, args, statementBlock)
}
export function parseReturnStatement(this: Parser) {
	this.incrementToken() // skip return token
	const exp = this.parseExpression(Precedance.LOWEST)
	this.incrementToken() //skip ;
	return new ReturnStatement(exp)

}
