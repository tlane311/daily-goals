
import app from '../backend/server.js';

import request from 'supertest';


describe("POST /api/lists/new", () => {
    it("requires a token", async () => {
        const response = await request(app)
            .post('/api/lists/new')
            .send({
                listName: 'new-list',
                orderNumber: 1,
            });

        expect(response.body).toHaveProperty('auth');
        expect(response.body).toHaveProperty('message');

        expect(response.body.auth).toBe(false);
        expect(response.body.message).toBe("No token provided.");
        expect(response.statusCode).toBe(400);
    });
})