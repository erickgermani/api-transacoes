import express from 'express';
import authRoutes from '../routes/auth';
import transactionRoutes from '../routes/transaction';
import authenticate from './passport';

const protectedRouter = express.Router();
protectedRouter.use('/transaction', transactionRoutes);

const router = express.Router();

router.get('/', (req, res) => {
	res.status(200).json({ message: 'Hello World sz' });
});

router.use('/', authRoutes);
router.use('/v0', authenticate(), protectedRouter);

export default router;
