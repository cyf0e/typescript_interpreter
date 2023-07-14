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
  "Welcome. This is a small interpreter program written in typescript."
);
console.log(
  `Try defining a function as function name(args){body}
   or declaring a variable with let name=expression.
   Statements need to be terminated with a semicolon ;
   Currently only if,let,return,function statements are supported.
   If you want to print something you can use the print() built in function.`
);
console.log("Exit with CTRL+C");
const evaluator = new Evaluator();

function pollUser() {
  rl.question(">>", function (answer) {
    try {
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
