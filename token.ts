export class Token {
  type: string;
  value: string;
  constructor(type: string, value: string) {
    this.type = type;
    this.value = value;
  }
}
const keywords = {
  LET: "let",
  FUNCTION: "function",
  RETURN: "return",
  IF: "if",
  ELSE: "else",
  ELSEIF: "elif",
  BOOL_TRUE: "true",
  BOOL_FALSE: "false",
};
export const tokens = {
  //special tokens
  ILLEGAL: "ILLEGAL",
  EOF: "EOF",

  //identifiers
  IDENTIFIER: "IDENTIFIER",

  //literals
  NUMBER: "NUMBER",
  STRING: "STRING",

  //operators
  PLUS: "+",
  ASSIGN: "=",
  MINUS: "-",
  ASTERISK: "*",
  FRONT_SLASH: "/",
  EXCLAMATION_MARK: "!",
  GREATER_THAN: ">",
  LESS_THAN: "<",
  LESSEQUAL_THAN: "<=",
  GREATEREQUAL_THAN: ">=",
  EQUALS: "==",
  NOT_EQUAL: "!=",
  LOG_OR: "||",
  LOG_AND: "&&",

  //delimiters
  COMMA: ",",
  SEMICOLON: ";",
  SINGLEQUOTE: "'",
  DOUBLEQUOTE: '"',
  LPAREN: "(",
  RPAREN: ")",
  LBRACE: "{",
  RBRACE: "}",
  LSQUARE: "[",
  RSQUARE: "]",
  ...keywords,
};
export const keywordMap = new Map(
  Object.entries(keywords).map((kv) => {
    return [kv[1], kv[0]];
  })
);
