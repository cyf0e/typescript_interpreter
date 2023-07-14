import { Parser } from "../parser";
import { InfixExpression, Expression } from "./parserUtils";

export function GenericInfixParser(
  this: Parser,
  left: Expression,
  precedance: number
) {
  const token = this.consumeToken();
  const infExp: InfixExpression = new InfixExpression(
    token.type,
    token.value,
    left,
    this.parseExpression(precedance)
  );
  return infExp;
}
