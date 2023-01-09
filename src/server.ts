import app from '.';

const { PORT, NODE_ENV } = process.env;

app.listen(PORT ?? 3000, () => {
	console.log(`server running on port ${PORT ?? 3000} on ${NODE_ENV} mode`);
});
