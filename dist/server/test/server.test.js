"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expect = require("expect");
const request = require("supertest");
const mocha_1 = require("mocha");
const mongodb_1 = require("mongodb");
const todo_model_1 = require("../models/todo.model");
const server_1 = require("../server");
const seed_1 = require("./seed");
const firstId = seed_1.todos[0]._id.toHexString();
const secondId = seed_1.todos[1]._id.toHexString();
mocha_1.beforeEach(seed_1.populateTodos);
mocha_1.describe('POST /todos', () => {
    mocha_1.it('should create a new todo', done => {
        const text = 'Test todo text';
        request(server_1.app)
            .post('/todos')
            .set('x-auth', seed_1.users[0].tokens[0].token)
            .send({ text })
            .expect(200)
            .expect((res) => {
            expect(res.body).toMatchObject({ text: text, completed: false, completedAt: null });
        })
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            todo_model_1.Todo.find({ text }).then(todos => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch(e => done(e));
        });
    });
    mocha_1.it('should not create a todo with invalid data', done => {
        request(server_1.app)
            .post('/todos')
            .set('x-auth', seed_1.users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            todo_model_1.Todo.find().then(todos => {
                expect(todos.length).toBe(2);
                done();
            }).catch(e => done(e));
        });
    });
});
mocha_1.describe('GET /todos', () => {
    mocha_1.it('should fetch all the todos from the server', done => {
        request(server_1.app)
            .get('/todos')
            .set('x-auth', seed_1.users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
            expect(res.body.todos.length).toBe(1);
        })
            .end(done);
    });
});
mocha_1.describe('GET /todos/:id', () => {
    mocha_1.it('should fetch a todo by ID from the server', done => {
        request(server_1.app)
            .get('/todos/' + firstId)
            .set('x-auth', seed_1.users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
            expect(res.body.todo).toMatchObject({ text: 'First test todo', completed: false, completedAt: null });
        })
            .end(done);
    });
    mocha_1.it('should not fetch a todo item created by another user', done => {
        request(server_1.app)
            .get('/todos/' + secondId)
            .set('x-auth', seed_1.users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
    mocha_1.it('should get a 400 if ID is invalid', done => {
        const id = '5b360ad6d527ca1d80da031dx';
        request(server_1.app)
            .get('/todos/' + id)
            .set('x-auth', seed_1.users[0].tokens[0].token)
            .expect(400)
            .end(done);
    });
    mocha_1.it('should get a 404 if id is not found', done => {
        const id = new mongodb_1.ObjectId();
        request(server_1.app)
            .get('/todos/' + id)
            .set('x-auth', seed_1.users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
});
mocha_1.describe('DELETE /todos/:id', () => {
    mocha_1.it('delete a todo by ID from the server', done => {
        request(server_1.app)
            .delete('/todos/' + firstId)
            .set('x-auth', seed_1.users[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
            expect(res.body.todo).toMatchObject({ text: 'First test todo', completed: false, completedAt: null });
        })
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            todo_model_1.Todo.findById(firstId).then(todo => {
                expect(todo).toBeFalsy();
                done();
            }).catch(err => done(err));
        });
    });
    mocha_1.it('should get a 400 if ID is invalid', done => {
        const id = '5b360ad6d527ca1d80da031dx';
        request(server_1.app)
            .delete('/todos/' + id)
            .set('x-auth', seed_1.users[0].tokens[0].token)
            .expect(400)
            .end(done);
    });
    mocha_1.it('should get a 404 if id is not found', done => {
        const id = new mongodb_1.ObjectId();
        request(server_1.app)
            .delete('/todos/' + id)
            .set('x-auth', seed_1.users[0].tokens[0].token)
            .expect(404)
            .end(done);
    });
    mocha_1.it('should not delete another user\'s todo item', done => {
        request(server_1.app)
            .delete('/todos/' + secondId)
            .set('x-auth', seed_1.users[0].tokens[0].token)
            .expect(404)
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            todo_model_1.Todo.findById(secondId).then(todo => {
                expect(todo).toBeTruthy();
                done();
            }).catch(err => done(err));
        });
    });
});
mocha_1.describe('PATCH /todos/:id', () => {
    mocha_1.it('update a todo by ID when set to completed', done => {
        request(server_1.app)
            .patch('/todos/' + firstId)
            .set('x-auth', seed_1.users[0].tokens[0].token)
            .send({ 'completed': true, 'text': 'The new text' })
            .expect(200)
            .expect((res) => {
            expect(res.body.todo).toMatchObject({ text: 'The new text', completed: true });
            expect(typeof res.body.todo.completedAt).toBe('number');
        })
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            todo_model_1.Todo.findById(firstId).then(todo => {
                expect(todo).toMatchObject({ text: 'The new text', completed: true });
                expect(typeof todo.completedAt).toBe('number');
                done();
            }).catch(err => done(err));
        });
    });
    mocha_1.it('update a todo by ID when set to not completed', done => {
        request(server_1.app)
            .patch('/todos/' + secondId)
            .set('x-auth', seed_1.users[1].tokens[0].token)
            .send({ 'completed': false })
            .expect(200)
            .expect((res) => {
            expect(res.body.todo).toMatchObject({ text: 'Second test todo', completed: false });
            expect(res.body.todo.completedAt).toBeFalsy();
        })
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            todo_model_1.Todo.findById(secondId).then(todo => {
                expect(todo).toMatchObject({ text: 'Second test todo', completed: false });
                expect(todo.completedAt).toBeFalsy();
                done();
            }).catch(err => done(err));
        });
    });
    mocha_1.it('should throw a 400 if empty text is sent', done => {
        request(server_1.app)
            .patch('/todos/' + secondId)
            .set('x-auth', seed_1.users[1].tokens[0].token)
            .send({ 'text': '' })
            .expect(400)
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            todo_model_1.Todo.findById(secondId).then(todo => {
                expect(todo).toMatchObject({ text: 'Second test todo', completed: true });
                expect(typeof todo.completedAt).toBe('number');
                done();
            }).catch(err => done(err));
        });
    });
    mocha_1.it('should not allow to update another user\'s todo item', done => {
        request(server_1.app)
            .patch('/todos/' + firstId)
            .set('x-auth', seed_1.users[1].tokens[0].token)
            .send({ 'completed': true, 'text': 'The new text' })
            .expect(404)
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            todo_model_1.Todo.findById(firstId).then(todo => {
                expect(todo).toMatchObject({ text: 'First test todo', completed: false });
                expect(todo.completedAt).toBeFalsy();
                done();
            }).catch(err => done(err));
        });
    });
});
//# sourceMappingURL=server.test.js.map