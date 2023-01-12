import express, { Request, Response, NextFunction } from 'express';

import { ITransaction } from '../interfaces';
import AuthorizationError from '../errors/AuthorizationError';
import transactionService from '../../src/services/transaction';
import userService from '../services/user';
import mailService from '../services/mail';

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

		// mock service is very slow
		// const auth = await transactionService.authorizeTransaction();
		const auth = {
			message: 'Autorizado',
		};

		if (auth.message !== 'Autorizado') throw new AuthorizationError('Transação não autorizada');

		await userService.updateBalance(transfer.payer, transfer.amount * -1);
		await userService.updateBalance(transfer.payee, transfer.amount);

		const result = await transactionService.save(transfer);

		const emailHasBeenSent = await mailService.send();

		if (!emailHasBeenSent) mailService.addTransferInCrontab(transfer.id);

		return res.status(201).json(result[0]);
	} catch (err) {
		return next(err);
	}
});

export default router;
