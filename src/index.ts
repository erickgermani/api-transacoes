import express, {
	Application,
	Request,
	Response,
	NextFunction,
	ErrorRequestHandler,
} from 'express';
import middlewares from './config/middlewares';

const app: Application = express();

app.use(middlewares());

app.use('/', (req: Request, res: Response) => {
	res.status(200).send();
});

export default app;
