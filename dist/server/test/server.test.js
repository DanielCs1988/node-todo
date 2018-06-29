"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const expect = require("expect");
const request = require("supertest");
const mocha_1 = require("mocha");
const mongodb_1 = require("mongodb");
const todo_model_1 = require("../models/todo.model");
const server_1 = require("../server");
const firstId = new mongodb_1.ObjectId();
const todos = [{
        _id: firstId,
        text: 'First test todo'
    }, {
        text: 'Second test todo'
    }];
mocha_1.beforeEach((done) => {
    todo_model_1.Todo.remove({})
        .then(() => {
        return todo_model_1.Todo.insertMany(todos, (err, doc) => {
            if (err)
                return done(err);
        });
    }).then(() => done())
        .catch(err => done(err));
});
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
//# sourceMappingURL=server.test.js.map