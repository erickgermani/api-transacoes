import express, { Request, Response, NextFunction } from 'express';

import { ITransaction } from '../interfaces';
import AuthorizationError from '../errors/AuthorizationError';
import userService from '../services/user';
import mailService from '../services/mail';
import shopkeeperService from '../services/shopkeeper';
import transactionService from '../services/transaction';

const router = express.Router();

const validate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// @ts-expect-error will be fixed
		await transactionService.validate({ ...req.body, payer: req.user.id }); // FIXME type error
		next();
	} catch (err) {
		next(err);
	}
};

router.post('/', validate, async (req: Request, res: Response, next: NextFunction) => {
	try {
		// @ts-expect-error will be fixed
		const t: ITransaction = { ...req.body, payer: req.user.id }; // FIXME type error

		const auth = await transactionService.authorizeTransaction();

		if (auth.message !== 'Autorizado') throw new AuthorizationError('Transação não autorizada');

		await userService.updateBalance(t.payer, t.amount * -1);
		await shopkeeperService.updateBalance(t.shopkeeper, t.amount);

		const result = await transactionService.save(t);

		const emailHasBeenSent = await mailService.send();

		if (!emailHasBeenSent) mailService.addTransactionInCrontab(t.id);

		return res.status(201).json(result[0]);
	} catch (err) {
		return next(err);
	}
});

export default router;
