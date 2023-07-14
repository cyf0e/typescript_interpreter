import { Evaluator } from "../evaluator";
import { Lexer } from "../lexer";
import { Parser } from "../parser";
import {
  InfixExpression,
  NumberLiteral,
  StringLiteral,
} from "../parsers/parserUtils";

export const ev = new Evaluator();
export const lexer = new Lexer();
export const parser = new Parser();
export const parseCodeExpression = (code: string) => {
  return parser.loadTokens(lexer.loadString(code).lex()).parseExpression();
};
export const parseCodeStatement = (code: string) => {
  return parser.loadTokens(lexer.loadString(code).lex()).parseStatement();
};
export const parseProgram = (program: string) => {
  return parser.loadTokens(lexer.loadString(program).lex()).parse();
};
export const NL = (number: number) => {
  return new NumberLiteral(`${number}`);
};
export const SL = (string: string) => {
  return new StringLiteral(string);
};
export const IE = (type: string, left: any, right: any) => {
  return new InfixExpression(type, type, left, right);
};
