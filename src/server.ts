import app from '.';

const { PORT, NODE_ENV } = process.env;

app.listen(PORT, () => {
	console.log(`server running on port ${PORT} on ${NODE_ENV} mode`);
});
