import {
  Precedance,
  Expression,
  PrefixExpression,
  NumberLiteral,
  StringLiteral,
  FunctionCallExpression,
  BooleanLiteral,
} from "./parserUtils";
import { tokens } from "../token";
import { Parser } from "../parser";
import { parseArgumentList } from "./statementParsers";
export function NumberLiteralParser(this: Parser) {
  const token = this.consumeToken();
  const literal: Expression = new NumberLiteral(token.value);
  return literal;
}
export function StringLiteralParser(this: Parser) {
  const sl = new StringLiteral(this.consumeToken().value);
  return sl;
}
export function BooleanLiteralParser(this: Parser, value: boolean) {
  const bl = new BooleanLiteral(value);
  this.incrementToken();
  return bl;
}
export function IdentifierParser(this: Parser) {
  const afterToken = this.getAfterToken();
  if (afterToken && afterToken.value == tokens.LPAREN) {
    return FunctionCallParser.bind(this)();
  }
  return new Expression(tokens.IDENTIFIER, this.consumeToken().value);
}
export function FunctionCallParser(this: Parser) {
  const ident = this.consumeToken();
  const args = parseArgumentList.bind(this)();

  return new FunctionCallExpression(ident, args);
}
export function ParenthesesParser(this: Parser) {
  this.incrementToken();
  const exp = this.parseExpression(Precedance.LOWEST);
  this.incrementToken(); //skip matching )
  return exp;
}
export function GenericPrefixParser(this: Parser) {
  const token = this.consumeToken();
  const rightExp = this.parseExpression(Precedance.PREFIX);
  const PrefixExp: PrefixExpression = new PrefixExpression(
    token.type,
    token.value,
    rightExp
  );
  return PrefixExp;
}
