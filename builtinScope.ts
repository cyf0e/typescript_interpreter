import { BuiltInFunction, Scope } from "./evaluator";

export const buildtinScope = new Scope();
buildtinScope.setNewValueInScope(
  "print",
  new BuiltInFunction("print", function (element: any[]) {
    let stringToPrint = "";
    for (let word of element) {
      stringToPrint = stringToPrint.concat(word);
    }

    console.log(stringToPrint);
    return undefined;
  })
);
