"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const expect = require("expect");
const request = require("supertest");
const server_1 = require("../server");
const seed_1 = require("./seed");
const user_model_1 = require("../models/user.model");
mocha_1.beforeEach(seed_1.populateUsers);
mocha_1.describe('GET /users/me', () => {
    mocha_1.it('should return user if authenticated', done => {
        request(server_1.app)
            .get('/users/me')
            .set('x-auth', seed_1.users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
            expect(res.body._id).toBe(seed_1.users[0]._id.toHexString());
            expect(res.body.email).toBe(seed_1.users[0].email);
        })
            .end(done);
    });
    mocha_1.it('should return 401 if not authenticated', done => {
        request(server_1.app)
            .get('/users/me')
            .expect(401)
            .expect((res) => {
            expect(res.body).toEqual({});
        })
            .end(done);
    });
});
mocha_1.describe('POST /users', () => {
    mocha_1.it('should create a user', done => {
        const email = 'admin@admin.org';
        const password = 'pa$$w0rd';
        request(server_1.app)
            .post('/users')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
            expect(res.headers['x-auth']).toExist();
            expect(res.body._id).toExist();
            expect(res.body.email).toBe(email);
        })
            .end(err => {
            if (err) {
                return done(err);
            }
            user_model_1.User.findOne({ email }).then(user => {
                expect(user).toInclude({ email: email });
                expect(user.password).toNotBe(password);
                done();
            }).catch(err => done(err));
        });
    });
    mocha_1.it('should return validation errors if request invalid', done => {
        const email = 'notavalidemail';
        const password = 'E';
        request(server_1.app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .end(done);
    });
    mocha_1.it('should not create user if email is already in use', done => {
        const email = 'kek@keklord.com';
        const password = 's3cr3t';
        request(server_1.app)
            .post('/users')
            .send({ email, password })
            .expect(400)
            .end(done);
    });
});
mocha_1.describe('POST /users/login', () => {
    mocha_1.it('should login user and return auth token', done => {
        const email = seed_1.users[0].email;
        const password = seed_1.users[0].password;
        request(server_1.app)
            .post('/users/login')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
            expect(res.headers['x-auth']).toExist();
            expect(res.body._id).toExist();
            expect(res.body.email).toBe(email);
        })
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            user_model_1.User.findById(seed_1.users[0]._id).then(user => {
                expect(user.tokens[1]).toInclude({
                    access: 'auth',
                    token: res.header['x-auth']
                });
                done();
            }).catch(err => done(err));
        });
    });
    mocha_1.it('should reject invalid login', done => {
        const email = seed_1.users[0].email;
        const password = 'notmypassword';
        request(server_1.app)
            .post('/users/login')
            .send({ email, password })
            .expect(401)
            .expect((res) => {
            expect(res.headers['x-auth']).toNotExist();
            expect(res.body).toEqual({});
        })
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            user_model_1.User.findById(seed_1.users[0]._id).then(user => {
                expect(user.tokens.length).toBe(1);
                done();
            }).catch(err => done(err));
        });
    });
});
mocha_1.describe('DELETE /users', () => {
    mocha_1.it('should remove auth token on logout', done => {
        request(server_1.app)
            .delete('/users')
            .set('x-auth', seed_1.users[0].tokens[0].token)
            .expect(200)
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            user_model_1.User.findById(seed_1.users[0]._id).then(user => {
                expect(user.tokens.length).toBe(0);
                done();
            }).catch(err => done(err));
        });
    });
});
//# sourceMappingURL=auth.test.js.map