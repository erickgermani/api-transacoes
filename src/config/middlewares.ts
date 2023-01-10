import express from 'express';
import cors from 'cors';

const middlewares = express.Router();

middlewares.use(express.json());
middlewares.use(cors({ origin: '*' }));

export default middlewares;
