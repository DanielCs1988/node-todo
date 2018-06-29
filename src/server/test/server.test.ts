import * as expect from "expect";
import * as request from "supertest";
import {it, describe, beforeEach} from "mocha";
import {ObjectId} from 'mongodb';

import {Todo} from "../models/todo.model";
import {app} from "../server";

const firstId = new ObjectId();
const todos = [{
    _id: firstId,
    text: 'First test todo'
}, {
    text: 'Second test todo'
}];

beforeEach((done: any) => {
    Todo.remove({})
        .then(() => {
            return Todo.insertMany(todos, (err, doc) => {
                if (err) return done(err);
            });
        }).then(() => done())
        .catch(err => done(err));
});

describe('POST /todos', () => {
   it('should create a new todo', done => {
      const text = 'Test todo text';
      request(app)
          .post('/todos')
          .send({text})
          .expect(200)
          .expect((res: any) => {
              expect(res.body).toInclude({text: text, completed: false, completedAt: null})
          })
          .end((err, res) => {
              if (err) {
                  return done(err);
              }
              Todo.find({text}).then(todos => {
                  expect(todos.length).toBe(1);
                  expect(todos[0].text).toBe(text);
                  done();
              }).catch(e => done(e));
          });
   });

   it('should not create a todo with invalid data', done => {
      request(app)
          .post('/todos')
          .send({})
          .expect(400)
          .end((err, res) => {
              if (err) {
                  return done(err);
              }
              Todo.find().then(todos => {
                  expect(todos.length).toBe(2);
                  done();
              }).catch(e => done(e));
          });
   });
});

describe('GET /todos', () => {

    it('should fetch all the todos from the server', done => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res: any) => {
                expect(res.body.todos.length)
                    .toBe(2);
            })
            .end(done);
    });

});

describe('GET /todos/:id', () => {

    it('should fetch a todo by ID from the server', done => {
        request(app)
            .get('/todos/' + firstId)
            .expect(200)
            .expect((res: any) => {
                expect(res.body.todo).toInclude({text: 'First test todo', completed: false, completedAt: null});
            })
            .end(done);
    });

    it('should get a 400 if ID is invalid', done => {
        const id = '5b360ad6d527ca1d80da031dx';
        request(app)
            .get('/todos/' + id)
            .expect(400)
            .end(done);
    });

    it('should get a 404 if id is not found', done => {
        const id = new ObjectId();
        request(app)
            .get('/todos/' + id)
            .expect(404)
            .end(done);
    });

});

describe('DELETE /todos/:id', () => {

    it('delete a todo by ID from the server', done => {
        request(app)
            .delete('/todos/' + firstId)
            .expect(200)
            .expect((res: any) => {
                expect(res.body.todo).toInclude({text: 'First test todo', completed: false, completedAt: null});
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }
                Todo.findById(firstId).then(todo => {
                    expect(todo).toNotExist();
                    done();
                }).catch(err => done(err));
            });
    });

    it('should get a 400 if ID is invalid', done => {
        const id = '5b360ad6d527ca1d80da031dx';
        request(app)
            .delete('/todos/' + id)
            .expect(400)
            .end(done);
    });

    it('should get a 404 if id is not found', done => {
        const id = new ObjectId();
        request(app)
            .delete('/todos/' + id)
            .expect(404)
            .end(done);
    });

});