import assert from "node:assert";
import { tokens, Token } from "../token";

import {
  ElseStatement,
  IfStatement,
  LetStatement,
  StatementBlock,
  Expression,
  FunctionStatement,
  StringLiteral,
  ReturnStatement,
  FunctionCallExpression,
  VariableAssignmentStatement,
} from "../parsers/parserUtils";
import { describe } from "node:test";
import {
  IE,
  NL,
  SL,
  lexer,
  parseCodeExpression,
  parseCodeStatement,
  parseProgram,
  parser,
} from "./testUtils";

describe("Parser", function () {
  describe("Parse expression", function () {
    it("should parse number literals", function () {
      const parsed = parseCodeExpression("12");
      assert.deepEqual(NL(12), parsed);
    });
    it("should parse sum infix operator", function () {
      const parsed = parseCodeExpression("1+2");
      assert.deepEqual(IE("+", NL(1), NL(2)), parsed);
    });
    it("should parse string literals", function () {
      const parsed = parseCodeExpression('"Hello world!"');

      assert.deepEqual(parsed, new StringLiteral("Hello world!"));
    });
    it("should respect operator precedance", function () {
      const parsed = parseCodeExpression("1+2*3");
      assert.deepEqual(parsed, IE("+", NL(1), IE("*", NL(2), NL(3))));
    });
    it("should parse complex expressions", function () {
      const parsed = parseCodeExpression("1+(2*3)+(2*2)");
      const expect = IE(
        "+",
        IE("+", NL(1), IE("*", NL(2), NL(3))),
        IE("*", NL(2), NL(2))
      );
      assert.deepEqual(parsed, expect);
    });
    it("should parse infix operators with identifiers as operands", function () {
      const parsed = parseCodeExpression("a+b");
      const expect = IE(
        "+",
        new Expression(tokens.IDENTIFIER, "a"),
        new Expression(tokens.IDENTIFIER, "b")
      );
      assert.deepEqual(parsed, expect);
    });
    it("should parse infix operators with booleans as operands", function () {
      const parsed = parseCodeExpression("a==1 || b==2");
      const expect = IE(
        "||",
        IE("==", new Token(tokens.IDENTIFIER, "a"), NL(1)),
        IE("==", new Token(tokens.IDENTIFIER, "b"), NL(2))
      );
      assert.deepEqual(parsed, expect);
    });
  });
  describe("LET STATEMENT", function () {
    it("should parse let statement", function () {
      const parsedCode = parseCodeStatement("let a=12;");
      const expect = new LetStatement(
        new Token(tokens.IDENTIFIER, "a"),
        NL(12)
      );
      assert.deepEqual(parsedCode, expect);
      assert(parser.getToken() == undefined);
    });
    it("should parse let statement with string literal", function () {
      const parsedCode = parseCodeStatement("let a='red';");
      console.log(parsedCode);
      const expect = new LetStatement(
        new Token(tokens.IDENTIFIER, "a"),
        SL("red")
      );
      assert.deepEqual(parsedCode, expect);
      assert(parser.getToken() == undefined);
    });
    it("should parse let statement with expression assignment", function () {
      const parsed = parseCodeStatement("let a=1+2;");
      const expect = new LetStatement(
        new Token(tokens.IDENTIFIER, "a"),
        IE("+", NL(1), NL(2))
      );
      assert.deepEqual(parsed, expect);
    });
    it("should parse let statement with identifier literal assignment", function () {
      const parsed = parseCodeStatement("let a=b;");
      const expect = new LetStatement(
        new Token(tokens.IDENTIFIER, "a"),
        new Expression(tokens.IDENTIFIER, "b")
      );
      assert.deepEqual(parsed, expect);
    });
    it("should parse let statement with function call assignment", function () {
      const parsed = parseCodeStatement("let a=sum(1,2);");
      const expect = new LetStatement(
        new Token(tokens.IDENTIFIER, "a"),
        new FunctionCallExpression(new Token(tokens.IDENTIFIER, "sum"), [
          NL(1),
          NL(2),
        ])
      );
      assert.deepEqual(parsed, expect);
    });
  });
  describe("ASSIGNMENT STATEMENT", function () {
    it("should parse string literal assignments", function () {
      const real = parseCodeStatement('a="test";');
      const expect = new VariableAssignmentStatement(
        new Token(tokens.IDENTIFIER, "a"),
        SL("test")
      );
      assert.deepEqual(expect, real);
    });
    it("should parse number literal assignments", function () {
      const real = parseCodeStatement("a=22;");
      const expect = new VariableAssignmentStatement(
        new Token(tokens.IDENTIFIER, "a"),
        NL(22)
      );
      assert.deepEqual(expect, real);
    });
    it("should parse complex expression assignments", function () {
      const real = parseCodeStatement("a=2+2*3;");
      const expect = new VariableAssignmentStatement(
        new Token(tokens.IDENTIFIER, "a"),
        IE("+", NL(2), IE("*", NL(2), NL(3)))
      );

      //this test depends on parseCodeStatement working as intended which is not optimal but still servers some purpose
      const real2 = parseCodeStatement("random=2*3+(4*22)-21+7/2");
      const expect2 = new VariableAssignmentStatement(
        new Token(tokens.IDENTIFIER, "random"),
        parseCodeExpression("2*3+(4*22)-21+7/2")
      );
      assert.deepEqual(expect, real);
      assert.deepEqual(expect2, real2);
    });
  });
  describe("IF STATEMENT", function () {
    it("should return if statement", function () {
      const parsedCode = parseCodeStatement("if(1==2){let b=2;}");
      const condition = IE("==", NL(1), NL(2));
      const expected = new IfStatement(
        condition,
        new StatementBlock([
          new LetStatement(new Token(tokens.IDENTIFIER, "b"), NL(2)),
        ])
      );
      assert.deepEqual(parsedCode, expected);
    });
  });
  describe("ELSE STATEMENT", function () {
    it("should return else statement", function () {
      const parsedCode = parseCodeStatement("else{let a=1;}");
      const expected = new ElseStatement(
        new StatementBlock([
          new LetStatement(new Token(tokens.IDENTIFIER, "a"), NL(1)),
        ])
      );
      assert.deepEqual(parsedCode, expected);
    });
  });

  describe("RETURN STATEMENT", function () {
    it("should parse return statements", function () {
      const expected = new ReturnStatement(IE("+", NL(1), NL(2)));
      const real = parseCodeStatement("return 1+2;");
      assert.deepEqual(real, expected);
    });
    it("should parse return statements with identifiers", function () {
      const parsed = parseCodeStatement("return a;");
      const expect = new ReturnStatement(
        new Expression(tokens.IDENTIFIER, "a")
      );
      assert.deepEqual(parsed, expect);
    });
  });
  describe("FUNCTION STATEMENT", function () {
    it("should return a function statement", function () {
      const args: Expression[] = [NL(1), NL(2)];
      const body: StatementBlock = new StatementBlock([
        new LetStatement(new Token(tokens.IDENTIFIER, "a"), NL(12)),
      ]);
      const identifier: Token = new Token(tokens.IDENTIFIER, "foo");
      const xpect = [new FunctionStatement(identifier, args, body)];
      const real = parser
        .loadTokens(lexer.loadString("function foo(1,2){let a=12;}").lex())
        .parse();
      assert.deepEqual(xpect, real);
    });

    it("should parse function definition with return statement", function () {
      const parsed = parseCodeStatement("function add(a,b){return a+b;}");
      const ident = new Token(tokens.IDENTIFIER, "add");
      const args = [
        new Expression(tokens.IDENTIFIER, "a"),
        new Expression(tokens.IDENTIFIER, "b"),
      ];
      const body = new StatementBlock([
        new ReturnStatement(IE("+", args[0], args[1])),
      ]);

      assert.deepEqual(parsed, new FunctionStatement(ident, args, body));
    });
    it("should parse string literal arguments", function () {
      const args: Expression[] = [new StringLiteral("Hello. Its me")];
      const body: StatementBlock = new StatementBlock([
        new LetStatement(new Token(tokens.IDENTIFIER, "a"), NL(12)),
      ]);
      const identifier: Token = new Token(tokens.IDENTIFIER, "foo");
      const xpect = [new FunctionStatement(identifier, args, body)];
      const real = parser
        .loadTokens(
          lexer.loadString('function foo("Hello. Its me"){let a=12;}').lex()
        )
        .parse();
      assert.deepEqual(xpect, real);
    });
    it("should parse function call arguments", function () {
      const parsed = parseCodeExpression("add(1,2);");
      const identifier = new Token(tokens.IDENTIFIER, "add");
      const fCall = new FunctionCallExpression(identifier, [NL(1), NL(2)]);
      assert.deepEqual(parsed, fCall);
    });
    it("should parse empty function call", function () {
      const parsed = parseCodeExpression("rand()");
      const ident = new Token(tokens.IDENTIFIER, "rand");
      const fcall = new FunctionCallExpression(ident, []);
      assert.deepEqual(parsed, fcall);
    });
    it("should parse function call arguments inside complex expressions", function () {
      const parsed = parseCodeExpression('1+stoi("1")*2;');
      const ident = new Token(tokens.IDENTIFIER, "stoi");
      const fcall = new FunctionCallExpression(ident, [new StringLiteral("1")]);
      const expect = IE("+", NL(1), IE("*", fcall, NL(2)));
      assert.deepEqual(parsed, expect);
    });
    it("should parse a regular statement block", function () {
      const parsed = parseCodeStatement("{return 1;}");
      const retStatement = new ReturnStatement(NL(1));
      const expect = new StatementBlock([retStatement]);
      assert.deepEqual(parsed, expect);
    });
    it("should parse a nested statement block", function () {
      const parsed = parseCodeStatement("{{let a=3;}return 1;}");
      const retStatement = new ReturnStatement(NL(1));
      const letStatement = new LetStatement(
        new Token(tokens.IDENTIFIER, "a"),
        NL(3)
      );
      const expect = new StatementBlock([
        new StatementBlock([letStatement]),
        retStatement,
      ]);
      assert.deepEqual(parsed, expect);
    });
    it("should parse semi-colons", function () {
      assert.doesNotThrow(() => parseProgram(`let a=2;`));
      assert.doesNotThrow(() => parseProgram("return 2;"));
      assert.doesNotThrow(() => parseProgram("if(1==2){let a=22;}"));
      assert.doesNotThrow(() => parseProgram("function a(b){return c;}"));
    });
    it("should parse entire program", function () {
      assert.doesNotThrow(() =>
        parseProgram(
          `let a=2;if(a==2){let b=3;} function add(a,b){return a*2*b;} add(7,8);`
        )
      );
    });
  });
});
