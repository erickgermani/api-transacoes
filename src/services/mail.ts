import { v4 as uuid } from 'uuid';
import MailError from '../errors/MailError';
import logger from '../config/logger';

const addTransferInCrontab = (id: number) => {
	console.log(
		`... O email da transferência ${id} não foi foi efetuada com sucesso.` +
			'Agendada nova tentativa de reenvio.'
	);
};

const send = async () => {
	try {
		// mock service is very slow
		// const res = await (await fetch('http://o4d9z.mocklab.io/notify')).json();
		const res = {
			message: 'Success',
		};

		if (res.message !== 'Success')
			throw new MailError('Ocorreu um erro durante o envio do email');

		return true;
	} catch (err) {
		// @ts-expect-error will be fixed
		const { name, message, stack } = err; // FIXME environment type error
		const id = uuid();
		logger.error({ id, name, message, stack });

		return false;
	}
};

const mailService = { send, addTransferInCrontab };

export default mailService;
