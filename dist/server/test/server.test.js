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
            .send({ text })
            .expect(200)
            .expect((res) => {
            expect(res.body).toInclude({ text: text, completed: false, completedAt: null });
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
            .expect(200)
            .expect((res) => {
            expect(res.body.todos.length)
                .toBe(2);
        })
            .end(done);
    });
});
mocha_1.describe('GET /todos/:id', () => {
    mocha_1.it('should fetch a todo by ID from the server', done => {
        request(server_1.app)
            .get('/todos/' + firstId)
            .expect(200)
            .expect((res) => {
            expect(res.body.todo).toInclude({ text: 'First test todo', completed: false, completedAt: null });
        })
            .end(done);
    });
    mocha_1.it('should get a 400 if ID is invalid', done => {
        const id = '5b360ad6d527ca1d80da031dx';
        request(server_1.app)
            .get('/todos/' + id)
            .expect(400)
            .end(done);
    });
    mocha_1.it('should get a 404 if id is not found', done => {
        const id = new mongodb_1.ObjectId();
        request(server_1.app)
            .get('/todos/' + id)
            .expect(404)
            .end(done);
    });
});
mocha_1.describe('DELETE /todos/:id', () => {
    mocha_1.it('delete a todo by ID from the server', done => {
        request(server_1.app)
            .delete('/todos/' + firstId)
            .expect(200)
            .expect((res) => {
            expect(res.body.todo).toInclude({ text: 'First test todo', completed: false, completedAt: null });
        })
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            todo_model_1.Todo.findById(firstId).then(todo => {
                expect(todo).toNotExist();
                done();
            }).catch(err => done(err));
        });
    });
    mocha_1.it('should get a 400 if ID is invalid', done => {
        const id = '5b360ad6d527ca1d80da031dx';
        request(server_1.app)
            .delete('/todos/' + id)
            .expect(400)
            .end(done);
    });
    mocha_1.it('should get a 404 if id is not found', done => {
        const id = new mongodb_1.ObjectId();
        request(server_1.app)
            .delete('/todos/' + id)
            .expect(404)
            .end(done);
    });
});
mocha_1.describe('PATCH /todos/:id', () => {
    mocha_1.it('update a todo by ID when set to completed', done => {
        request(server_1.app)
            .patch('/todos/' + firstId)
            .send({ 'completed': true, 'text': 'The new text' })
            .expect(200)
            .expect((res) => {
            expect(res.body.todo).toInclude({ text: 'The new text', completed: true });
            expect(res.body.todo.completedAt).toBeA('number');
        })
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            todo_model_1.Todo.findById(firstId).then(todo => {
                expect(todo).toInclude({ text: 'The new text', completed: true });
                expect(todo.completedAt).toBeA('number');
                done();
            }).catch(err => done(err));
        });
    });
    mocha_1.it('update a todo by ID when set to completed', done => {
        request(server_1.app)
            .patch('/todos/' + secondId)
            .send({ 'completed': false })
            .expect(200)
            .expect((res) => {
            expect(res.body.todo).toInclude({ text: 'Second test todo', completed: false });
            expect(res.body.todo.completedAt).toBeFalsy();
        })
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            todo_model_1.Todo.findById(secondId).then(todo => {
                expect(todo).toInclude({ text: 'Second test todo', completed: false });
                expect(todo.completedAt).toBeFalsy();
                done();
            }).catch(err => done(err));
        });
    });
    mocha_1.it('should throw a 400 if empty text is sent', done => {
        request(server_1.app)
            .patch('/todos/' + secondId)
            .send({ 'text': '' })
            .expect(400)
            .end((err, res) => {
            if (err) {
                return done(err);
            }
            todo_model_1.Todo.findById(secondId).then(todo => {
                expect(todo).toInclude({ text: 'Second test todo', completed: true });
                expect(todo.completedAt).toBeA('number');
                done();
            }).catch(err => done(err));
        });
    });
});
//# sourceMappingURL=server.test.js.map