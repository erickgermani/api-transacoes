import express from 'express';
import userAuthRoutes from '../routes/auth';
import shopkeeperAuthRoutes from '../routes/shopkeeper/auth';
import transferRoutes from '../routes/transfer';
import authenticate from './passport';

const protectedRouter = express.Router();
protectedRouter.use('/transfer', transferRoutes);

const router = express.Router();

router.get('/', (req, res) => {
	res.status(200).json({ message: 'Hello World sz' });
});

router.use('/', userAuthRoutes);
router.use('/shopkeeper', shopkeeperAuthRoutes);
router.use('/v0', authenticate(), protectedRouter);

export default router;
