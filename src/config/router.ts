import express from 'express';
import authRoutes from '../routes/auth';

const router = () => {
	const router = express.Router();

	router.get('/', (req, res) => {
		res.status(200).json({ message: 'Hello World ' });
	});

	router.use('/', authRoutes());

	return router;
};

export default router;
