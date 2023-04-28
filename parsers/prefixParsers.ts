import { Precedance, Expression, PrefixExpression, NumberLiteral, StringLiteral } from "./parserUtils"
import { tokens } from "../token"
import { Parser } from "../parser"
export function NumberLiteralParser(this: Parser) {
	const token = this.consumeToken()
	const literal: Expression = new NumberLiteral(token.value)
	return literal
}
export function StringLiteralParser(this: Parser) {
	return new StringLiteral(this.consumeToken().value)
}
export function ParenthesesParser(this: Parser) {
	this.incrementToken()
	const exp = this.parseExpression(Precedance.LOWEST)
	//	if (this.getAfterToken().type == tokens.RPAREN) { throw new Error("Didnt close parentheses.") }
	return exp
}
export function GenericPrefixParser(this: Parser) {

	const token = this.consumeToken()
	const rightExp = this.parseExpression(Precedance.PREFIX)
	const PrefixExp: PrefixExpression = new PrefixExpression(token.type, token.value, rightExp)
	return PrefixExp

}
