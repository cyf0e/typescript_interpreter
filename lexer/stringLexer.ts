import { Lexer } from "../lexer";
import { tokens } from "../token";
export function tokenizeString(this:Lexer){
	if(this.consumeCharacter()=='"') {
		let stringy:string=''
		while(this.getCharacter()!='"'){
			stringy=stringy.concat(this.getCharacter())
			this.incrementPosition()
		}
		return this.createToken(tokens.STRING,stringy)
	}
	if(this.consumeCharacter()=="'") {
		let stringy:string=''
		while(this.getCharacter()!="'"){
			stringy=stringy.concat(this.getCharacter())
			this.incrementPosition()
		}
		return this.createToken(tokens.STRING,stringy)
	}
}
