import { Parser } from "./parser.js";
import { Lexer } from "./lexer.js";
import readline from "node:readline";
import { BuiltInFunction, Evaluator, Scope } from "./evaluator.js";
import { Expression } from "./parsers/parserUtils.js";
import { buildtinScope } from "./builtinScope.js";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("close", function () {
  process.exit(0);
});

const lexer = new Lexer();
const parser = new Parser();
console.log(
  "Welcome. This is a WIP interpreter program written in typescript. Currently it only spits out the AST code you put in."
);
console.log(
  "Try defining a function as function name(args){body} or declaring a variable with let name=expression"
);
console.log("Exit with CTRL+C");
const evaluator = new Evaluator();

function pollUser() {
  rl.question(">>", function (answer) {
    try {
      /* console.log(lexer.loadString(answer).lex());
      console.log(parser.loadTokens(lexer.loadString(answer).lex()).parse()); */
      const parsedAnswer = parser
        .loadTokens(lexer.loadString(answer).lex())
        .parse();
      const res = evaluator.evaluateProgram(parsedAnswer, buildtinScope);
      console.log(res);
    } catch (e) {
      console.error(e);
    }
    pollUser();
  });
}
pollUser();
