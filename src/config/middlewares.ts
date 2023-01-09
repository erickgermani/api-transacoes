import express from 'express';
import cors from 'cors';

const middlewares = () => {
	const router = express.Router();

	router.use(express.json());
	router.use(cors({ origin: '*' }));

	return router;
};

export default middlewares;
