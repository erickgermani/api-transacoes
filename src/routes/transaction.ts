import { v4 as uuid } from 'uuid';

import express, { Request, Response, NextFunction } from 'express';
import transactionService from '../../src/services/transaction';
import AuthorizationError from '../errors/AuthorizationError';
import MailError from '../errors/MailError';
import { ITransaction } from '../interfaces';
import mailService from '../services/mail';
import userService from '../services/user';
import logger from '../config/logger';

const router = express.Router();

const validate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// @ts-expect-error will be fixed
		await transactionService.validate({ ...req.body, payer: req.user.id }); // FIXME
		next();
	} catch (err) {
		next(err);
	}
};

router.post('/', validate, async (req: Request, res: Response, next: NextFunction) => {
	try {
		// @ts-expect-error will be fixed
		const transfer: ITransaction = { ...req.body, payer: req.user.id }; // FIXME

		const auth = await transactionService.authorizeTransaction();

		if (auth.message !== 'Autorizado') throw new AuthorizationError('Transação não autorizada');

		await userService.updateBalance(transfer.payer, transfer.amount * -1);
		await userService.updateBalance(transfer.payee, transfer.amount);

		const result = await transactionService.save(transfer);

		try {
			// mock service is very slow
			// const send = await mailService.send();
			const send = {
				message: 'Success',
			};

			if (send.message !== 'Success') throw new MailError('Não conseguimos enviar o email');
		} catch (err) {
			// @ts-expect-error will be fixed
			const { name, message, stack } = err; // FIXME environment type error
			const id = uuid();
			logger.error({ id, name, message, stack });
		}

		return res.status(201).json(result[0]);
	} catch (err) {
		return next(err);
	}
});

export default router;
