interface IUser {
	id: number;
	name: string;
	cpf: string;
	mail: string;
	passwd: string;
}

interface ITransaction {
	id: number;
	description: string;
	date: string;
	amount: number;
	status: 'ok' | 'under_review' | 'canceled';
	payer: number;
	payee: number;
}

export type { IUser, ITransaction };
