import assert from "assert";
import { Evaluator, Scope } from "../evaluator";
import {
  FunctionCallExpression,
  PrefixExpression,
} from "../parsers/parserUtils";

import { NL, SL, ev, parseCodeExpression, parseProgram } from "./testUtils";

describe("Evaluator", () => {
  it("should evaluate number literals", function () {
    assert.equal(4, new Evaluator().evaluateLiteralExpression(NL(4)));
  });
  it("should evaluate string literals", function () {
    assert.equal(
      "teststring",
      new Evaluator().evaluateLiteralExpression(SL("teststring"))
    );
  });
  it("should evaluate prefix expressions", function () {
    assert.equal(
      -7,
      ev.evaluatePrefixExpression(new PrefixExpression("-", "-", NL(7)))
    );
    assert.equal(
      3,
      ev.evaluatePrefixExpression(new PrefixExpression("+", "+", NL(3)))
    );
  });
  it("should evaluate complex expressions", function () {
    assert.equal(
      3,
      ev.evaluateExpression(new Scope(), parseCodeExpression("1+2"))
    );
    assert.equal(
      6,
      ev.evaluateExpression(new Scope(), parseCodeExpression("2*3"))
    );
    assert.equal(
      7,
      ev.evaluateExpression(new Scope(), parseCodeExpression("1+2*3"))
    );
    assert.equal(
      55,
      ev.evaluateExpression(new Scope(), parseCodeExpression("1+(2*3)*(2+7)"))
    );
    assert.equal(
      2 + 2 * 3 + 21 + 99 * 9 * (99 * 9) * 2 + 1 + 1,
      ev.evaluateExpression(
        new Scope(),
        parseCodeExpression("2+2*3+21+99*9*(99*9)*2+1+(1)")
      )
    );
    assert.equal(
      1 + (((2 / 3) * 4) / 5) * 6 + 7 * 8 - 9 - 10 / 2,
      ev.evaluateExpression(
        new Scope(),
        parseCodeExpression("1+2/3*4/5*6+7*8-9-10/2")
      )
    );
  });
  it("should concat two strings", function () {
    assert.equal(
      "test123",
      ev.evaluateExpression(new Scope(), parseCodeExpression('"test"+"123"'))
    );
  });
  it("should evaluate let statements", function () {
    const ret = ev.evaluateProgram(parseProgram("let a=22; return a;"));
    assert.equal(ret, 22);
  });
  it("should evaluate if statements", function () {
    const scope = new Scope();
    const ret1 = ev.evaluateProgram(
      parseProgram("if(1==1){let a=22;} return a;"),
      scope
    );
    assert.deepEqual(ret1, 22);
    /* ev.evaluateStatement(scope, parseCodeStatement("if(1==2){let b=33;}"));
    assert.equal(scope.getFromScopeTree("b"), undefined);
    ev.evaluateStatement(scope, parseCodeStatement("if(2==2){let c=33;}"));
    assert.deepEqual(scope.getFromScopeTree("c"), 33); */
  });
  it("should evaluate function call expressions", function () {
    const res = ev.evaluateProgram(
      parseProgram("function add(a,b){return a+b;} let c=add(1,2); return c;")
    );
    assert.equal(res, 3);
  });
  it("should evaluate infix expressiosn with two function call expressions", function () {
    const res = ev.evaluateProgram(
      parseProgram("function add(a,b){return a+b;} return add(2,2)+add(1,2);")
    );
    assert.equal(res, 7);
  });
  it("should evaluate function call with multiple return statements", function () {
    const res = ev.evaluateProgram(
      parseProgram(
        "function add(a,b){if(a==0){return 10;} return a+b;} return add(0,2)+add(1,2);"
      )
    );
    assert.equal(res, 13);
  });
});
