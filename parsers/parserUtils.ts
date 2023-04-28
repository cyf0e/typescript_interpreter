import { Token, TokenType } from "../token"

export const Precedance: { [key: string]: number } = {
	LOWEST: 1,
	'==': 2,
	'<=': 2,
	'>=': 2,
	'!=': 2,
	'+': 3,
	'-': 3,
	'/': 5,
	'*': 5,
	PREFIX: 8,
	SUFFIX: 9,
	CALL: 10
}
export class Expression {
	type: string
	value: Expression | number | string
	constructor(type: string, value: Expression | number | string) {
		this.type = type
		this.value = value
	}
}
export class NumberLiteral extends Expression {
	constructor(value: number | string) {
		super('NumberLiteral', value)
	}
}
export class StringLiteral extends Expression {
	constructor(value: string) {
		super('StringLiteral', value)
	}
}
export class Statement {
	type: string
	constructor(type: string) {

		this.type = type
	}
}
export class InfixExpression extends Expression {
	left: Expression
	right: Expression
	constructor(type: string, value: string, left: Expression, right: Expression) {
		super(`${type}InfixExpression`, value)
		this.left = left
		this.right = right
	}
}
export class PrefixExpression extends Expression {
	right: Expression
	constructor(type: string, left: Expression | string, right: Expression) {
		super(`${type}PrefixExpression`, left)
		this.right = right
	}
}
export class StatementBlock implements Statement {
	type
	statements: Statement[]
	constructor(statements: Statement[]) {
		this.statements = statements
		this.type = 'STATEMENT_BLOCK'
	}
}
export class LetStatement implements Statement {
	identifier: TokenType
	value: Expression
	type
	constructor(identifier: TokenType, value: Expression) {
		this.value = value
		this.identifier = identifier
		this.type = 'LET_STATEMENT'
	}

}
export class IfStatement implements Statement {
	type
	condition: Expression
	body: StatementBlock
	constructor(condition: Expression, body: StatementBlock) {
		this.type = 'IF_STATEMENT'
		this.condition = condition
		this.body = body
	}
}
export class ElifStatement implements Statement {
	type
	condition: Expression
	body: StatementBlock
	constructor(condition: Expression, body: StatementBlock) {
		this.type = 'ELIF_STATEMENT'
		this.condition = condition
		this.body = body
	}
}
export class ElseStatement implements Statement {
	type
	body: StatementBlock
	constructor(body: StatementBlock) {
		this.type = 'ELSE_STATEMENT'
		this.body = body
	}
}
export class FunctionStatement implements Statement {
	type
	identifier: Token
	args: Expression[]
	body: Statement[]
	constructor(identifier: Token, args: Expression[], body: Statement[]) {

		this.identifier = identifier
		this.args = args
		this.body = body;
		this.type = 'FUNCTION_STATEMENT'
	}

}
export class ReturnStatement implements Statement {
	type
	value: Expression
	constructor(value: Expression) {
		this.value = value
		this.type = 'RETURN_STATEMENT'
	}
}
