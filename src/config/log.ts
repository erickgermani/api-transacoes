import Winston from 'winston';

export default Winston.createLogger({
	level: 'debug',
	transports: [
		new Winston.transports.Console({ format: Winston.format.json({ space: 1 }) }),
		new Winston.transports.File({
			filename: 'logs/error.log',
			level: 'warn',
			format: Winston.format.combine(
				Winston.format.timestamp(),
				Winston.format.json({ space: 1 })
			),
		}),
	],
});
