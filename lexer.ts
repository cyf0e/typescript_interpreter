import { Token, tokens, keywordMap } from './token'
import { tokenizeString } from './lexer/stringLexer'
import { tokenizeBoolean } from './lexer/boolean'
import { isNumber, isLetter, isValidIdentifier, isBooleanSymbol } from './utils';
export class Lexer {
	input: string | undefined
	position: number
	afterPosition: number

	constructor(input?: string) {
		this.input = input;
		this.position = 0;
		this.afterPosition = 1;

	}
	loadString(text: string) {
		this.input = text
		this.position = 0
		this.afterPosition = 1
		return this
	}
	lex() {
		const lexed = new Array<Token>()
		let char = this.getCharacter()
		while (char) {
			const token = this.getToken()
			if (!token) break;
			lexed.push(token)
			this.incrementPosition()
			char = this.getCharacter()
		}
		return lexed
	}
	incrementPosition() {
		this.position++;
		this.afterPosition++
		undefined
	}
	getNextCharacter() {
		if (!this.input || this.input.length < this.afterPosition) throw new Error('getNextCharacter is out of bounds.')
		return this.input[this.afterPosition]

	}
	getCharacter() {
		if (!this.input || this.input.length < this.position) throw new Error('Called getCharacter out of bounds')
		return this.input[this.position]
	}
	consumeCharacter() {
		const ch = this.getCharacter();
		this.incrementPosition()
		return ch
	}
	getToken() {
		this.skipWhitespace()
		const char = this.getCharacter()
		if (isValidIdentifier(char)) return this.tokenizeIdentifier()
		if (isNumber(char)) return this.tokenizeNumber()
		if (isBooleanSymbol(char)) return this.tokenizeBoolean()
		if (this.getCharacter() == '"' || this.getCharacter() == "'") return tokenizeString.bind(this)()
		return this.createToken(char, char);
	}

	tokenizeIdentifier() {
		let ch = this.getCharacter()
		let identifier = ch;
		let nextCh = this.getNextCharacter()
		while (isValidIdentifier(nextCh) || isNumber(nextCh)) {
			identifier += nextCh;
			this.incrementPosition()
			nextCh = this.getNextCharacter()
		}
		if (keywordMap.has(identifier)) {
			return this.createToken(keywordMap.get(identifier), identifier)
		}
		return this.createToken(tokens.IDENTIFIER, identifier)
	}
	tokenizeNumber() {
		let ch = this.getCharacter()
		let num = ch;
		let nextCh = this.getNextCharacter()
		while (isNumber(nextCh) || nextCh === '.') {
			num += nextCh
			this.incrementPosition();
			nextCh = this.getNextCharacter()
		}
		return this.createToken(tokens.NUMBER, num)
	}
	tokenizeBoolean() {
		const token = tokenizeBoolean(this.getCharacter(), this.getNextCharacter())
		if (token.value.length > 1) this.incrementPosition()
		return token
	}
	skipWhitespace() {
		let char = this.getCharacter()
		while (char == ' ' || char == '\t' || char == '\n' || char == '\r') {
			this.incrementPosition()
			char = this.getCharacter()
		}
	}

	createToken(type: any, value: string | undefined) {
		if (!type || !value) return undefined
		return new Token(type, value)
	}
	getTypeFromCharValue(char: string | undefined) {
		const keyValue = Object.entries(tokens).filter(kv => { return kv[1] == char })
		return keyValue[0] ? keyValue[0][0] : undefined
	}
}

