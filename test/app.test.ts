import request from 'supertest';

import app from '../src';

test('Deve responder na raiz', () => {
	return request(app)
		.get('/')
		.then((res) => {
			expect(res.status).toBe(200);
		});
});
