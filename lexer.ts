import {Token,tokenType,tokens,keywordMap} from './token'
class Lexer {
	input:string|undefined
	position:number
	afterPosition:number
	
	constructor(input?:string){
		this.input=input;
		this.position=0;
		this.afterPosition=1;

	}
	loadString(text:string){
		this.input=text
		return this
	}
	lex(){
		const lexed=new Array<Token>()
		let char=this.getCharacter()
		while(char){
			const token=this.getToken()	
			if(!token)break;
			lexed.push(token)
			this.incrementPosition()
			char=this.getCharacter()
		}
		return lexed
	}
	incrementPosition(){
		this.position++;
		this.afterPosition++
		}
	getNextCharacter(){
		if(!this.input || this.input.length<this.afterPosition)throw new Error('getNextCharacter is out of bounds.')
		return this.input[this.afterPosition]

	}
	getCharacter(){
		if(!this.input || this.input.length<this.position)throw new Error('Called getCharacter out of bounds')
		return this.input[this.position]
	}
	consumeCharacter(){
		const ch=this.getCharacter();
		this.incrementPosition()
		return ch
	}
	getToken(){
		this.skipWhitespace()
		const char=this.getCharacter()
		if(this.isValidIdentifier(char))return this.tokenizeIdentifier()
		if(this.isNumber(char))return this.tokenizeNumber()
		return this.createToken(this.getTypeFromCharValue(char),char);
	}
	tokenizeIdentifier(){
		let ch=this.getCharacter()
		let identifier=ch;
		let nextCh=this.getNextCharacter()
		while(this.isValidIdentifier(nextCh)||this.isNumber(nextCh)){
			identifier+=nextCh;
			this.incrementPosition()
			nextCh=this.getNextCharacter()
		}
		if(keywordMap.has(identifier)){
			return this.createToken(keywordMap.get(identifier),identifier)
		}
		return this.createToken(tokens.IDENTIFIER,identifier)
	}
	tokenizeNumber(){
		let ch=this.getCharacter()
		let num=ch;
		let nextCh=this.getNextCharacter()
		while(this.isNumber(nextCh)||nextCh==='.'){
			num+=nextCh
			this.incrementPosition();
			nextCh=this.getNextCharacter()
		}
		return this.createToken(tokens.NUMBER,num)
	}
	skipWhitespace(){
		let char=this.getCharacter()
		while(char == ' ' || char == '\t' || char == '\n' || char == '\r'){
			this.incrementPosition()
			char=this.getCharacter()
		}
	}
	isValidIdentifier(char:any){
		if(!char)return false
		return this.isLetter(char) || char==='_' 
	}	
	isLetter(char:any){
		if(!char)return false
		return new RegExp('^[a-zA-Z]$').test(char) 
	}
	isNumber(char:any){
		if(!char)return false
		return new RegExp('^[0-9]$').test(char)
	}
	
	createToken(type:any,character:tokenType|undefined){
		return new Token(type,character)
	}
	getTypeFromCharValue(char:string|undefined){
		const keyValue=Object.entries(tokens).filter(kv=>{return kv[1]==char})
		return keyValue[0]?keyValue[0][0]:undefined
	}
}
const code=`
let a=21;
let _best0=31
let b2=_best0
function rats(a,b){
	return a+b
}
`
const st=Date.now()
const le=new Lexer(code);
console.log(le.lex())
console.log(Date.now()-st)

