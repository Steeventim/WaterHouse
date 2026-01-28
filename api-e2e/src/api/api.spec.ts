import axios from 'axios';

describe('GET /api', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api`);
    // Debug : log la réponse brute
    // eslint-disable-next-line no-console
    console.log('DEBUG e2e /api response:', res.status, res.headers['content-type'], res.data);
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
});
