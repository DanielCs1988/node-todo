import {beforeEach, describe, it} from "mocha";
import * as expect from "expect";
import * as request from "supertest";

import {app} from "../server";
import {populateUsers, users} from "./seed";
import {User} from "../models/user.model";

beforeEach(populateUsers);

describe('GET /users/me', () => {

    it('should return user if authenticated', done => {
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens![0].token)
            .expect(200)
            .expect((res: any) => {
                expect(res.body._id).toBe(users[0]._id.toHexString());
                expect(res.body.email).toBe(users[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', done => {
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((res: any) => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });

});

describe('POST /users', () => {

    it('should create a user', done => {
        const email = 'admin@admin.org';
        const password = 'pa$$w0rd';
        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res: any) => {
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toBe(email);
            })
            .end(err => {
                if (err) {
                    return done(err);
                }
                User.findOne({email}).then(user => {
                   expect(user!.toObject()).toMatchObject({email: email});
                   expect(user!.password).not.toBe(password);
                   done();
                }).catch(err => done(err));
            });
    });

    it('should return validation errors if request invalid', done => {
        const email = 'notavalidemail';
        const password = 'E';
        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });

    it('should not create user if email is already in use', done => {
        const email = 'kek@keklord.com';
        const password = 's3cr3t';
        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });

});

describe('POST /users/login', () => {

    it('should login user and return auth token', done => {
        const email = users[0].email;
        const password = users[0].password;
        request(app)
            .post('/users/login')
            .send({email, password})
            .expect(200)
            .expect((res: any) => {
                expect(res.headers['x-auth']).toBeTruthy();
                expect(res.body._id).toBeTruthy();
                expect(res.body.email).toBe(email);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(users[0]._id).then(user => {
                    expect(user!.toObject().tokens[1]).toMatchObject({
                        access: 'auth',
                        token: res.header['x-auth']
                    });
                    done();
                }).catch(err => done(err));
            });
    });

    it('should reject invalid login', done => {
        const email = users[0].email;
        const password = 'notmypassword';
        request(app)
            .post('/users/login')
            .send({email, password})
            .expect(401)
            .expect((res: any) => {
                expect(res.headers['x-auth']).toBeFalsy();
                expect(res.body).toEqual({});
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(users[0]._id).then(user => {
                    expect(user!.tokens.length).toBe(1);
                    done();
                }).catch(err => done(err));
            });
    });

});

describe('DELETE /users', () => {

    it('should remove auth token on logout', done => {
        request(app)
            .delete('/users')
            .set('x-auth', users[0].tokens![0].token)
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                User.findById(users[0]._id).then(user => {
                    expect(user!.tokens.length).toBe(0);
                    done();
                }).catch(err => done(err));
            });
    });

});