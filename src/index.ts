import { v4 as uuid } from 'uuid';
import express, {
	Application,
	Request,
	Response,
	NextFunction,
	ErrorRequestHandler,
} from 'express';

import middlewares from './config/middlewares';
import router from './config/router';
import logger from './config/log';

const app: Application = express();

app.use(middlewares());
app.use(router());

app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
	// @ts-expect-error will be fixed
	const { name, message, stack } = err; // FIXME

	if (name === 'ValidationError') res.status(400).json({ error: message });
	else if (name === 'RecursoIndevidoError') res.status(403).json({ error: message });
	else {
		const id = uuid();
		logger.error({ id, name, message, stack });
		res.status(500).json({ id, error: 'Falha interna' });
	}

	next();
});

export default app;
