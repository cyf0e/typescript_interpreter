import assert from "node:assert";
import { tokens, Token } from "../token";
import { Lexer } from "../lexer";
import { Parser } from "../parser";
import { ElseStatement, IfStatement, LetStatement, Precedance, StatementBlock, Statement, Expression, FunctionStatement, NumberLiteral, InfixExpression, StringLiteral, ReturnStatement, FunctionCallExpression } from "../parsers/parserUtils";
import { describe } from "node:test";

const lexer = new Lexer()
const parser = new Parser()
const parseCodeExpression = (code: string) => { return parser.loadTokens(lexer.loadString(code).lex()).parseExpression() }
const parseCodeStatement = (code: string) => { return parser.loadTokens(lexer.loadString(code).lex()).parseStatement() }
const NL = (number: number) => { return new NumberLiteral(`${number}`) }
const IE = (type: string, left: any, right: any) => { return new InfixExpression(type, type, left, right) }


describe("Parser", function() {
	describe('Parse expression', function() {
		it('should parse number literals', function() {
			const parsed = parseCodeExpression('12')
			assert.deepEqual(NL(12), parsed)
		})
		it('should parse sum infix operator', function() {
			const parsed = parseCodeExpression('1+2')
			assert.deepEqual(IE('+', NL(1), NL(2)), parsed)
		})
		it('should parse string literals', function() {
			const parsed = parseCodeExpression('"Hello world!"')
			assert.deepEqual(parsed, new StringLiteral('Hello world!'))
		})
		it('should respect operator precedance', function() {
			const parsed = parseCodeExpression('1+2*3')
			assert.deepEqual(parsed, IE('+', NL(1), IE('*', NL(2), NL(3))))

		})
	})
	describe('LET STATEMENT', function() {
		it('should parse let statement', function() {
			const parsedCode = parseCodeStatement('let a=12;')
			const expect = new LetStatement(new Token(tokens.IDENTIFIER, 'a'), NL(12))
			assert.deepEqual(parsedCode, expect)
			assert(parser.getToken() == undefined)
		})
		it('should parse let statement with expression assignment', function() {
			const parsed = parseCodeStatement('let a=1+2;')
			const expect = new LetStatement(new Token(tokens.IDENTIFIER, 'a'), IE('+', NL(1), NL(2)))
			assert.deepEqual(parsed, expect)
		})
		it('should parse let statement with identifier literal assignment', function() {
			const parsed = parseCodeStatement('let a=b;')
			const expect = new LetStatement(new Token(tokens.IDENTIFIER, 'a'), new Expression(tokens.IDENTIFIER, 'b'))
			assert.deepEqual(parsed, expect)
		})
		it('should parse let statement with function call assignment', function() {
			const parsed = parseCodeStatement('let a=sum(1,2);')
			const expect = new LetStatement(new Token(tokens.IDENTIFIER, 'a'), new FunctionCallExpression(new Token(tokens.IDENTIFIER, 'sum'), [NL(1), NL(2)]))
			assert.deepEqual(parsed, expect)
		})


	})
	describe('IF STATEMENT', function() {
		it('should return if statement', function() {
			const parsedCode = parseCodeStatement('if(1==2){let b=2;}')
			const condition = IE("==", NL(1), NL(2))
			const expected = new IfStatement(condition, new StatementBlock([new LetStatement(new Token(tokens.IDENTIFIER, 'b'), NL(2))]))
			assert.deepEqual(parsedCode, expected)
		})
	})
	describe('ELSE STATEMENT', function() {
		it('should return else statement', function() {
			const parsedCode = parseCodeStatement('else{let a=1;}')
			const expected = new ElseStatement(new StatementBlock([new LetStatement(new Token(tokens.IDENTIFIER, 'a'), NL(1))]))
			assert.deepEqual(parsedCode, expected)
		})
	})

	describe('RETURN STATEMENT', function() {
		it('should parse return statements', function() {
			const expected = new ReturnStatement(IE('+', NL(1), NL(2)))
			const real = parseCodeStatement('return 1+2;')
			assert.deepEqual(real, expected)
		})
	})
	describe('FUNCTION STATEMENT', function() {
		it('should return a function statement', function() {
			const args: Expression[] = [NL(1), NL(2)]
			const body: Statement[] = [new LetStatement(new Token(tokens.IDENTIFIER, 'a'), NL(12))]
			const identifier: Token = new Token(tokens.IDENTIFIER, 'foo')
			const xpect = [new FunctionStatement(identifier, args, body)]
			const real = parser.loadTokens(lexer.loadString('function foo(1,2){let a=12;}').lex()).parse()
			assert.deepEqual(xpect, real)
		})
		it('should parse string literal arguments', function() {
			const args: Expression[] = [new StringLiteral('Hello. Its me')]
			const body: Statement[] = [new LetStatement(new Token(tokens.IDENTIFIER, 'a'), NL(12))]
			const identifier: Token = new Token(tokens.IDENTIFIER, 'foo')
			const xpect = [new FunctionStatement(identifier, args, body)]
			const real = parser.loadTokens(lexer.loadString('function foo("Hello. Its me"){let a=12;}').lex()).parse()
			assert.deepEqual(xpect, real)
		})
		it('should parse function call arguments', function() {
			const parsed = parseCodeExpression('add(1,2);')
			const identifier = new Token(tokens.IDENTIFIER, 'add')
			const fCall = new FunctionCallExpression(identifier, [NL(1), NL(2)])
			assert.deepEqual(parsed, fCall)
		})
		it('should parse function call arguments inside complex expressions', function() {
			const parsed = parseCodeExpression('1+stoi("1")*2;')
			const ident = new Token(tokens.IDENTIFIER, 'stoi')
			const fcall = new FunctionCallExpression(ident, [new StringLiteral('1')])
			const expect = IE('+', NL(1), IE('*', fcall, NL(2)))
			assert.deepEqual(parsed, expect)
		})

	})
})
