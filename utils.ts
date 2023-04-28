import { tokens } from './token'
export function isValidIdentifier(char: any) {
	if (!char) return false
	return isLetter(char) || char === '_'
}
export function isLetter(char: any) {
	if (!char) return false
	return new RegExp('^[a-zA-Z]$').test(char)
}
export function isNumber(char: any) {
	if (!char) return false
	return new RegExp('^[0-9]$').test(char)
}
export function isBooleanSymbol(char: any) {
	if (!char) return false
	return char == tokens.EXCLAMATION_MARK || char == '|' || char == tokens.LESS_THAN || char == tokens.GREATER_THAN || char == tokens.ASSIGN
}
