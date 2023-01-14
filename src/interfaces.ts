interface IAccount {
	id: number;
	name: string;
	mail: string;
	passwd: string;
}

interface IUser extends IAccount {
	cpf: string;
}

interface IShopkeeper extends IAccount {
	cnpj: string;
}

interface ITrade {
	id: number;
	description: string;
	date: string;
	amount: number;
	status: 'ok' | 'under_review' | 'canceled';
	payer: number;
}

interface ITransfer extends ITrade {
	payee: number;
}

interface ITransaction extends ITrade {
	shopkeeper: number;
}

export type { IUser, IShopkeeper, ITransfer, ITransaction };
