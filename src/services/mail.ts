const send = async () => {
	const res = await fetch('http://o4d9z.mocklab.io/notify');

	return await res.json();
};

const mailService = { send };

export default mailService;
