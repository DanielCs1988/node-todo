import {beforeEach, describe, it} from "mocha";
import * as expect from "expect";
import * as request from "supertest";

import {populateUsers, users} from "./seed";
import {app} from "../server";
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
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end(err => {
                if (err) {
                    return done(err);
                }
                User.findOne({email}).then(user => {
                   expect(user).toInclude({email: email});
                   expect(user!.password).toNotBe(password);
                   done();
                });
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