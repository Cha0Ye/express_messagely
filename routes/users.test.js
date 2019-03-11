process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let user;


beforeEach(async () => {
    await db.query(`DELETE FROM users`);
    await db.query(`DELETE FROM messages`);


    let userResult = await db.query(
        `INSERT INTO
        users(username, password, first_name, last_name, phone, email, join_at)
        VALUES('test', 'plaintext', 'tester', 'whiskey', '415-123-4567', 'tester@test.com', current_timestamp)
        RETURNING username, password, first_name, last_name, phone, email, join_at, last_login_at`);

    user = userResult.rows[0];


    


});

afterAll( async () => {
    await db.end();
});




describe("GET/users/username", function() {
    test("Gets a user with its information", async function(){
        const resp = await request(app).get(`/users/${user.username}`);
        expect (resp.statusCode).toBe(200);
        expect (resp.body.username).toEqual(user.username);
    });

    test("Get a user that does not exist", async function(){
        const resp = await request(app).get('/users/John');
        expect (resp.statusCode).toBe(404);
    });
});