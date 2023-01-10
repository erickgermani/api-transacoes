import express, { Request, Response, NextFunction } from 'express';
import transactionService from '../../src/services/transaction';

const router = express.Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = await transactionService.save(req.body);

		return res.status(200).send();
	} catch (err) {
		return next(err);
	}
});

export default router;
