import { Token } from "../token";

export const Precedance: { [key: string]: number } = {
  LOWEST: 1,
  "||": 2,
  "&&": 2,
  "<": 3,
  ">": 3,
  "==": 3,
  "<=": 3,
  ">=": 3,
  "!=": 3,
  "!": 3,
  "+": 3,
  "-": 3,
  "/": 5,
  "*": 5,
  PREFIX: 8,
  SUFFIX: 9,
  CALL: 10,
};
export class Expression {
  type: string;
  value: number | string | boolean | undefined | null;
  constructor(
    type: string,
    value: number | string | boolean | undefined | null
  ) {
    this.type = type;
    this.value = value;
  }
}
export class NumberLiteral extends Expression {
  constructor(value: number | string) {
    super("NumberLiteral", value);
  }
}
export class BooleanLiteral extends Expression {
  constructor(value: boolean) {
    super("BooleanLiteral", value);
  }
}
export class StringLiteral extends Expression {
  constructor(value: string) {
    super("StringLiteral", value);
  }
}
type StatementType =
  | "LET_STATEMENT"
  | "RETURN_STATEMENT"
  | "IF_STATEMENT"
  | "ELSE_STATEMENT"
  | "ELIF_STATEMENT"
  | "FUNCTION_STATEMENT"
  | "STATEMENT_BLOCK"
  | "VARIABLE_ASSIGNMENT_STATEMENT";
export class Statement {
  type: StatementType;
  constructor(type: StatementType) {
    this.type = type;
  }
}
export class InfixExpression extends Expression {
  left: Expression;
  right: Expression;
  constructor(
    type: string,
    value: string,
    left: Expression,
    right: Expression
  ) {
    super(`${type}InfixExpression`, value);
    this.left = left;
    this.right = right;
  }
}
export class PrefixExpression extends Expression {
  right: Expression;
  constructor(type: string, left: string, right: Expression) {
    super(`${type}PrefixExpression`, left);
    this.right = right;
  }
}
export class ReturnValueExpression extends Expression {
  value: number | string | boolean | undefined | null;
  constructor(value: number | string | boolean | undefined | null) {
    super("RETURN_VALUE", value);
    this.value = value;
  }
}
export class StatementBlock extends Statement {
  statements: Array<Statement | Expression>;
  constructor(statements: Array<Statement | Expression>) {
    super("STATEMENT_BLOCK");
    this.statements = statements;
  }
}
export class LetStatement extends Statement {
  identifier: Token;
  value: Expression;
  constructor(identifier: Token, value: Expression) {
    super("LET_STATEMENT");
    this.value = value;
    this.identifier = identifier;
  }
}
export class IfStatement extends Statement {
  condition: Expression;
  body: StatementBlock;
  constructor(condition: Expression, body: StatementBlock) {
    super("IF_STATEMENT");
    this.condition = condition;
    this.body = body;
  }
}
export class ElifStatement extends Statement {
  condition: Expression;
  body: StatementBlock;
  constructor(condition: Expression, body: StatementBlock) {
    super("ELIF_STATEMENT");
    this.condition = condition;
    this.body = body;
  }
}
export class ElseStatement extends Statement {
  body: StatementBlock;
  constructor(body: StatementBlock) {
    super("ELSE_STATEMENT");
    this.body = body;
  }
}
export class VariableAssignmentStatement extends Statement {
  identifier: Token;
  value: Expression;
  constructor(identifier: Token, value: Expression) {
    super("VARIABLE_ASSIGNMENT_STATEMENT");
    this.identifier = identifier;
    this.value = value;
  }
}
export class FunctionStatement extends Statement {
  identifier: Token;
  args: Expression[];
  body: StatementBlock;
  constructor(identifier: Token, args: Expression[], body: StatementBlock) {
    super("FUNCTION_STATEMENT");
    this.identifier = identifier;
    this.args = args;
    this.body = body;
  }
}
export class FunctionCallExpression extends Expression {
  identifier: Token;
  args: Expression[];
  constructor(identifier: Token, args: Expression[]) {
    super("FUNCTION_CALL", identifier.value);
    this.identifier = identifier;
    this.args = args;
  }
}
export class ReturnStatement extends Statement {
  value: Expression;
  constructor(value: Expression) {
    super("RETURN_STATEMENT");
    this.value = value;
  }
}
