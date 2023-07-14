import assert from "node:assert";
import { Lexer } from "../lexer";
import { tokens, Token } from "../token";
const lexer = new Lexer();

describe("Lexer", function () {
  it("should lex valid programs without error", function () {
    const program = `
		let a=12;
		let b=2;
		let c=a+b;
		function foo(a,b){
			return a+b;
		}
		let e=1+2*(8+2);
		`;
    assert.ok(lexer.loadString(program).lex());
  });

  it("should lex let statements", function () {
    const real = lexer.loadString("let").lex()[0];
    assert.deepEqual(real, new Token("LET", tokens.LET));
  });
  it("should lex boolean expressions", function () {
    const real = lexer.loadString("||").lex()[0];
    assert.deepEqual(real, new Token("||", tokens.LOG_OR));
  });
  it("should lex function statements", function () {
    const real = lexer.loadString("function").lex()[0];
    assert.deepEqual(real, new Token("FUNCTION", tokens.FUNCTION));
  });
  it("should lex identifier statements", function () {
    const real = lexer.loadString("name").lex()[0];
    assert.deepEqual(real, new Token(tokens.IDENTIFIER, "name"));
  });
  it("should lex string literals with single and double quotes", function () {
    const real = lexer.loadString('"house"').lex()[0];
    const realDouble = lexer.loadString("'house'").lex()[0];

    assert.deepEqual(real, new Token(tokens.STRING, "house"));
    assert.deepEqual(realDouble, new Token(tokens.STRING, "house"));
  });
  it("should lex number literals", function () {
    const real = lexer.loadString("3.14").lex()[0];
    assert.deepEqual(real, new Token(tokens.NUMBER, "3.14"));
  });
  it("should lex complex programs", function () {
    const program = `
		let a=12;
		let c=a+2;
		function foo(a,b){
			return a+b;
		}
		let e=1+2*(8+2);
    a=22;
    `;

    assert.ok(lexer.loadString(program).lex());
  });
});
