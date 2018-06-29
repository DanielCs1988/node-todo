import * as expect from "expect";
import * as request from "supertest";
import {it, describe, beforeEach} from "mocha";

import {Todo} from "../models/todo.model";
import {app} from "../server";

beforeEach((done: any) => {
    Todo.remove({})
        .then(() => done())
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
              Todo.find().then(todos => {
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
                  expect(todos.length).toBe(0);
                  done();
              }).catch(e => done(e));
          });
   });
});