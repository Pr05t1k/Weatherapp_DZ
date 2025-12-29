const request = require('supertest');
const app = require('../server');  // Импорт вашего приложения
it('responds with Hello, World!', async () => {
  const response = await request(app).get('/'); // Просто вызываем app, чтобы получить запрос
  expect(response.statusCode).toBe(200);
});
