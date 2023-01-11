import bcrypt from 'bcrypt-nodejs';
import jwt from 'jwt-simple';
import express, { Request, Response, NextFunction } from 'express';

import ValidationError from '../errors/ValidationError';
import userService from '../services/user';

const JWT_SECRET = process.env.JWT_SECRET;

const router = express.Router();

const validate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		await userService.validate(req.body);
		next();
	} catch (err) {
		next(err);
	}
};

router.post('/signup', validate, async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = await userService.save(req.body);

		return res.status(201).json(result[0]);
	} catch (err) {
		return next(err);
	}
});

router.post('/signin', async (req: Request, res: Response, next: NextFunction) => {
	try {
		const user = await userService.findOne({ mail: req.body.mail });

		if (user === undefined) throw new ValidationError('Usuário ou senha inválido');

		if (bcrypt.compareSync(req.body.passwd, user.passwd)) {
			const payload = {
				id: user.id,
				cpf: user.cpf,
				mail: user.mail,
			};

			// @ts-expect-error will be fixed
			const token = jwt.encode(payload, JWT_SECRET); // FIXME environment type error

			return res.status(200).json({ token });
		} else return res.status(400).json({ error: 'Credenciais incorretas' });
	} catch (err) {
		return next(err);
	}
});

export default router;
