import { tokens, Token } from '../token'
export function tokenizeBoolean(current: string, nextChar: string) {
	switch (current) {
		case '=':
			if (nextChar == '=')
				return new Token(tokens.EQUALS, tokens.EQUALS)
		case '!':
			if (nextChar == '=') {
				return new Token(tokens.NOT_EQUAL, tokens.NOT_EQUAL)
			}
		case '<':
			if (nextChar == '=') {
				return new Token(tokens.LESSEQUAL_THAN, tokens.LESSEQUAL_THAN)
			}
		case '>':
			if (nextChar == '=') {
				return new Token(tokens.GREATEREQUAL_THAN, tokens.GREATEREQUAL_THAN)
			}
		case '|':
			if (nextChar == '|') {
				return new Token(tokens.LOG_OR, tokens.LOG_OR)
			}
		case '&':
			if (nextChar == '&') {
				return new Token(tokens.LOG_AND, tokens.LOG_AND)
			}
		default:
			return new Token(current, current)

	}
}

