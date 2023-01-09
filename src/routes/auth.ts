import express, { Request, Response, NextFunction } from 'express';
import userService from '../services/user';

const authRouts = () => {
	const router = express.Router();

	router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
		try {
			const result = await userService().save(req.body);

			return res.status(201).json(result[0]);
		} catch (err) {
			return next(err);
		}
	});

	return router;
};

export default authRouts;
