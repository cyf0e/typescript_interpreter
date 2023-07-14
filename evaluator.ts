import { assertDefined, assertUndefined } from "./evaluator/evaluatorUtils";
import {
  BooleanLiteral,
  Expression,
  FunctionCallExpression,
  FunctionStatement,
  IfStatement,
  InfixExpression,
  LetStatement,
  NumberLiteral,
  PrefixExpression,
  ReturnStatement,
  ReturnValueExpression,
  Statement,
  StatementBlock,
  StringLiteral,
  VariableAssignmentStatement,
} from "./parsers/parserUtils";
import { tokens } from "./token";
export class BuiltInFunction {
  identifier: string;
  func: Function;
  constructor(identifier: string, func: Function) {
    this.identifier = identifier;
    this.func = func;
  }
  evaluate(...args: any[]) {
    if (args.length !== this.func.length)
      throw new Error(
        `${this.identifier} requires ${this.func.length} arguments, but got ${args.length}`
      );
    return this.func(...args);
  }
}
type VariableValueTypes =
  | string
  | number
  | boolean
  | undefined
  | null
  | FunctionStatement
  | BuiltInFunction;

export class Scope {
  parent: Scope | undefined;
  value: Map<string, VariableValueTypes> = new Map();
  setNewValueInScope(identifier: string, value: VariableValueTypes) {
    this.value.set(identifier, value);
  }
  getFromScopeTree(identifier: string) {
    let currentScope: Scope | undefined = this;
    while (currentScope) {
      const res = currentScope.value.get(identifier);
      if (res !== undefined) return res;
      currentScope = currentScope.parent;
    }
    return undefined;
  }
}
export class Evaluator {
  evaluatePossibleReturnValue(obj: VariableValueTypes | ReturnValueExpression) {
    if (obj instanceof ReturnValueExpression) return obj.value;
    return obj;
  }
  evaluateProgram(code: Statement[], scope?: Scope) {
    const rootScope = scope ?? new Scope();
    for (let statement of code) {
      let retVal = this.evaluateStatement(rootScope, statement);
      if (retVal instanceof ReturnValueExpression) {
        return this.evaluatePossibleReturnValue(retVal);
      }
    }
  }
  evaluateStatement(scope: Scope, statement: Statement) {
    if (statement.type == "LET_STATEMENT") {
      const ls = statement as LetStatement;
      const exists = scope.getFromScopeTree(ls.identifier.value);
      assertUndefined(exists, `Cannot redefine ${ls.identifier.value}.`);
      if (ls.value instanceof FunctionCallExpression) {
        const evaluatedFuncCall = this.evaluateExpression(scope, ls.value);
        scope.setNewValueInScope(
          ls.identifier.value,
          this.evaluatePossibleReturnValue(evaluatedFuncCall)
        );
      } else {
        scope.setNewValueInScope(
          ls.identifier.value,
          this.evaluatePossibleReturnValue(
            this.evaluateExpression(scope, ls.value)
          )
        );
      }

      return ls.value;
    } else if (statement.type == "IF_STATEMENT") {
      const ifs = statement as IfStatement;
      const condition = ifs.condition;
      const res = this.evaluateExpression(scope, condition);
      if (res) {
        const ret = this.evaluateBlockStatement(scope, ifs.body);
        if (ret instanceof ReturnValueExpression) return ret;
      }
    } else if (statement.type == "RETURN_STATEMENT") {
      const rs = statement as ReturnStatement;
      const retVal = this.evaluateExpression(scope, rs.value);
      if (
        retVal instanceof FunctionStatement ||
        retVal instanceof BuiltInFunction
      )
        throw new Error("Cannot return function definitions");
      return new ReturnValueExpression(retVal);
    } else if (statement.type == "FUNCTION_STATEMENT") {
      const fs = statement as FunctionStatement;
      const exists = scope.getFromScopeTree(fs.identifier.value);
      if (!exists) {
        scope.setNewValueInScope(fs.identifier.value, fs);
      }
    } else if (statement instanceof FunctionCallExpression) {
      this.evaluateExpression(scope, statement);
    } else if (statement instanceof VariableAssignmentStatement) {
      scope.setNewValueInScope(
        statement.identifier.value,
        this.evaluateExpression(scope, statement.value)
      );
    }
  }
  evaluateExpression(scope: Scope, exp: Expression | undefined) {
    if (!exp) return undefined;
    else if (exp instanceof InfixExpression)
      return this.evaluateInfixExpression(scope, exp);
    else if (exp instanceof PrefixExpression)
      return this.evaluatePrefixExpression(exp);
    else if (
      exp instanceof NumberLiteral ||
      exp instanceof StringLiteral ||
      exp instanceof BooleanLiteral
    )
      return this.evaluateLiteralExpression(exp);
    else if (exp instanceof FunctionCallExpression) {
      return this.evaluateFunctionCallExpression(scope, exp);
    } else if (exp instanceof ReturnValueExpression) return exp.value;
    else if (exp instanceof Expression && exp.type == "IDENTIFIER")
      return scope.getFromScopeTree(exp.value as string);
    throw new Error(`Dont know how to evaluate ${exp.type} expression.`);
  }
  evaluateFunctionCallExpression(scope: Scope, exp: FunctionCallExpression) {
    const ref = scope.getFromScopeTree(exp.identifier.value);
    if (ref instanceof BuiltInFunction) {
      const args: any = exp.args.map((arg) =>
        this.evaluateExpression(scope, arg)
      );
      return ref.evaluate(args) as VariableValueTypes;
    }
    const funcDef = ref as FunctionStatement;
    const argNames = funcDef.args;
    const argValues = exp.args;
    if (argNames.length != argValues.length)
      throw new Error(
        `Expected ${argNames.length} arguments but got: ${argValues.length}`
      );
    const functionScope = new Scope();
    functionScope.parent = scope;

    for (let i = 0; i < argNames.length; i++) {
      if (typeof argNames[i].value != "string")
        throw new Error(`${argNames[i]} is not a valid argument name.`);
      functionScope.setNewValueInScope(
        argNames[i].value as string,
        this.evaluatePossibleReturnValue(
          this.evaluateExpression(scope, argValues[i])
        )
      );
    }

    const res = this.evaluateBlockStatement(functionScope, funcDef.body);
    return this.evaluatePossibleReturnValue(res);
  }
  evaluateBlockStatement(scope: Scope, block: StatementBlock) {
    for (let statement of block.statements) {
      if (statement instanceof Expression) {
        this.evaluateExpression(scope, statement);
      } else {
        const res: any = this.evaluateStatement(scope, statement);
        if (res instanceof ReturnValueExpression) return res;
      }
    }
    return undefined;
  }
  evaluateNumberLiteral(number: NumberLiteral) {
    if (typeof number.value == "string") {
      return parseFloat(number.value);
    }
    if (typeof number.value == "number") return number;
  }
  evaluateStringLiteral(string: StringLiteral) {
    if (typeof string.value !== "string")
      throw new Error("Strings can only be of type string.");
    return string.value;
  }

  evaluatePrefixExpression(exp: PrefixExpression) {
    if (!exp) throw new Error(`Expression is undefined in PrefixEvaluator.`);
    if (exp.right instanceof NumberLiteral) {
      switch (exp.value) {
        case tokens.PLUS:
          return this.evaluateLiteralExpression(exp.right);
        case tokens.MINUS:
          const value = this.evaluateLiteralExpression(exp.right) as number;
          return value * -1;
        case tokens.EXCLAMATION_MARK:
          return !this.evaluateLiteralExpression(exp.right);
        default:
          throw new Error("Only - and + prefix operators are supported.");
      }
    }
    throw new Error("Cannot have prefix operators on strings.");
  }
  evaluateInfixExpression(
    scope: Scope,
    exp: InfixExpression
  ): number | string | boolean {
    if (!exp) throw new Error("Infix expression cannot be undefined");
    //could check if type==*InfixExpression
    let left = null;
    let right = null;

    if (exp.left instanceof InfixExpression)
      left = this.evaluateInfixExpression(scope, exp.left);
    else if (exp.left instanceof PrefixExpression)
      left = this.evaluatePrefixExpression(exp.left);
    else if (exp.left.type == tokens.IDENTIFIER) {
      const value = scope?.getFromScopeTree(exp.left.value as string);
      if (value === undefined)
        throw new Error(`${exp.left.value} is undefined.`);
      left = value;
    } else if (exp.left instanceof FunctionCallExpression) {
      left = this.evaluateFunctionCallExpression(scope, exp.left);
    } else {
      left = this.evaluateLiteralExpression(exp.left);
    }
    if (exp.right instanceof InfixExpression)
      right = this.evaluateInfixExpression(scope, exp.right);
    else if (exp.right instanceof PrefixExpression)
      right = this.evaluatePrefixExpression(exp.right);
    else if (exp.right.type == tokens.IDENTIFIER) {
      const value = scope?.getFromScopeTree(exp.right.value as string);
      if (value === undefined)
        throw new Error(`${exp.right.value} is undefined.`);
      right = value;
    } else if (exp.right instanceof FunctionCallExpression) {
      right = this.evaluateFunctionCallExpression(scope, exp.right);
    } else {
      right = this.evaluateLiteralExpression(exp.right);
    }
    switch (exp.value) {
      case tokens.PLUS:
        if (
          left === undefined ||
          left === null ||
          right === null ||
          right === undefined
        )
          throw new Error(`Cannot add undefined.`);
        if (typeof left == "string" && typeof right == "string")
          return left + right;
        if (typeof left == "number" && typeof right == "number")
          return left + right;
        const first: string = typeof left == "string" ? left : left.toString();
        const second: string =
          typeof right == "string" ? right : right.toString();
        return first + second;
      case tokens.ASTERISK:
        if (typeof left == "number" && typeof right == "number") {
          return left * right;
        }
        throw new Error(`Cannot multiply ${typeof left} with ${typeof right}`);
      case tokens.FRONT_SLASH:
        if (typeof left == "number" && typeof right == "number") {
          return left / right;
        }
        throw new Error(`Cannot divide ${typeof left} with ${typeof right}`);

      case tokens.MINUS:
        if (typeof left == "number" && typeof right == "number") {
          return left - right;
        }
        throw new Error(`Cannot subtract ${typeof left} with ${typeof right}`);
      case tokens.EQUALS:
        return left == right;
      case tokens.NOT_EQUAL:
        return left !== right;
      case tokens.LESS_THAN:
        if (typeof left == "number" && typeof right == "number") {
          return left < right;
        }
        throw new Error(`Cannot compare ${typeof left} with ${typeof right}`);
      case tokens.GREATER_THAN:
        if (typeof left == "number" && typeof right == "number") {
          return left > right;
        }
        throw new Error(`Cannot compare ${typeof left} with ${typeof right}`);
      case tokens.LOG_OR:
        if (
          (typeof left == "string" ||
            typeof left == "number" ||
            typeof left == "boolean") &&
          (typeof right == "string" ||
            typeof right == "number" ||
            typeof right == "boolean")
        )
          return left || right;
        throw new Error(`Cannot Logically compare ${left} and ${right}`);
      case tokens.LOG_AND:
        if (
          (typeof left == "string" ||
            typeof left == "number" ||
            typeof left == "boolean") &&
          (typeof right == "string" ||
            typeof right == "number" ||
            typeof right == "boolean")
        )
          return left && right;
        throw new Error(`Cannot Logically compare ${left} and ${right}`);
      default:
        throw new Error(`${exp.value} infix evaluator not implemented.`);
    }
  }

  evaluateLiteralExpression(
    expression: NumberLiteral | StringLiteral | BooleanLiteral
  ) {
    if (!expression) throw new Error("Expression cannot be undefined.");
    switch (expression.type) {
      case "NumberLiteral":
        if (typeof expression.value == "string")
          return parseFloat(expression.value);
        return expression.value;
      case "StringLiteral":
        return expression.value
          ? expression.value.toString()
          : expression.value;
      case "BooleanLiteral":
        return expression.value;
      default:
        throw new Error(`${expression.type} not supported`);
    }
  }
  evaluateReturnStatement(scope: Scope, statement: ReturnStatement) {
    const res = this.evaluateExpression(scope, statement.value);
    return { type: "RETURN_VALUE", value: res };
  }
  evaluateLetStatement(
    scope: Map<string, Expression>,
    letStatement: LetStatement
  ) {
    if (!scope) throw new Error("Cannot have undefined scope");
    if (letStatement.identifier.type !== "STRING")
      throw new Error("Variable name must be a string");
    scope.set(letStatement.identifier.value, letStatement.value);
  }
}
