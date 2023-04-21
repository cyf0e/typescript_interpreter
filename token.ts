export class Token{

	type:tokenType|undefined	
	value:string|number|undefined
	constructor(type:tokenType|undefined,value:string|number|undefined){
		this.type=type
		this.value=value
	}
}
const keywords={
	LET:'let',
	FUNCTION:'function',
	RETURN:'return'
}
export const tokens={
	//special tokens
	ILLEGAL:'ILLEGAL',
	EOF:'EOF',
	
	//identifiers
	IDENTIFIER:'IDENTIFIER',

	//literals
	NUMBER:'NUMBER',

	//operators
	PLUS:'+',
	ASSIGN:'=',
	MINUS:'-',
	ASTERISK:'*',
	FRONT_SLASH:'/',
	EXCLAMATION_MARK:'!',
	GREATER_THAN:'>',
	LESS_THAN:'<',
	//delimiters
	COMMA:',',
	SEMICOLON:';',
	LPAREN:'(',
	RPAREN:')',
	LBRACE:'{',
	RBRACE:'}',
	LSQUARE:'[',
	RSQUARE:']',
	...keywords
}
export const keywordMap=new Map(Object.entries(keywords).map(kv=>{return [kv[1],kv[0]]}))
export type tokenType=typeof tokens[keyof typeof tokens]
