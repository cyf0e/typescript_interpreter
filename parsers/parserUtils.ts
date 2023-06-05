import { Token } from "../token"

export const Precedance: { [key: string]: number } = {
	LOWEST: 1,
	'<': 2,
	'>': 2,
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
export class StatementBlock extends Statement {
	statements: Statement[]
	constructor(statements: Statement[]) {
		super('STATEMENT_BLOCK')
		this.statements = statements
	}
}
export class LetStatement extends Statement {
	identifier: Token
	value: Expression
	constructor(identifier: Token, value: Expression) {
		super('LET_STATEMENT')
		this.value = value
		this.identifier = identifier
	}

}
export class IfStatement extends Statement {
	condition: Expression
	body: StatementBlock
	constructor(condition: Expression, body: StatementBlock) {
		super('IF_STATEMENT')
		this.condition = condition
		this.body = body
	}
}
export class ElifStatement extends Statement {
	condition: Expression
	body: StatementBlock
	constructor(condition: Expression, body: StatementBlock) {
		super('ELIF_STATEMENT')
		this.condition = condition
		this.body = body
	}
}
export class ElseStatement extends Statement {
	body: StatementBlock
	constructor(body: StatementBlock) {
		super('ELSE_STATEMENT')
		this.body = body
	}
}
export class FunctionStatement extends Statement {
	identifier: Token
	args: Expression[]
	body: StatementBlock
	constructor(identifier: Token, args: Expression[], body: StatementBlock) {
		super('FUNCTION_STATEMENT')
		this.identifier = identifier
		this.args = args
		this.body = body;
	}

}
export class FunctionCallExpression extends Expression {
	identifier: Token
	args: Expression[]
	constructor(identifier: Token, args: Expression[]) {
		super('FUNCTION_CALL', identifier.value)
		this.identifier = identifier
		this.args = args
	}
}
export class ReturnStatement extends Statement {
	value: Expression
	constructor(value: Expression) {
		super('RETURN_STATEMENT')
		this.value = value
	}
}
