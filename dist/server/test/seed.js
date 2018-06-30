"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
const todo_model_1 = require("../models/todo.model");
const jsonwebtoken_1 = require("jsonwebtoken");
const user_model_1 = require("../models/user.model");
const userOneId = new mongodb_1.ObjectId();
const userTwoId = new mongodb_1.ObjectId();
exports.todos = [{
        _id: new mongodb_1.ObjectId(),
        text: 'First test todo',
        _owner: userOneId
    }, {
        _id: new mongodb_1.ObjectId(),
        text: 'Second test todo',
        completed: true,
        completedAt: 17500,
        _owner: userTwoId
    }];
function populateTodos(done) {
    todo_model_1.Todo.remove({})
        .then(() => {
        return todo_model_1.Todo.insertMany(exports.todos, (err, doc) => {
            if (err)
                return done(err);
        });
    })
        .then(() => done())
        .catch(err => done(err));
}
exports.populateTodos = populateTodos;
exports.users = [{
        _id: userOneId,
        email: 'kek@keklord.com',
        password: 's3cr3t',
        tokens: [{
                access: 'auth',
                token: jsonwebtoken_1.sign({ _id: userOneId, access: 'auth' }, process.env.SECRET).toString()
            }]
    }, {
        _id: userTwoId,
        email: 'zod@overmind.org',
        password: 'bevezetem.eu',
        tokens: [{
                access: 'auth',
                token: jsonwebtoken_1.sign({ _id: userTwoId, access: 'auth' }, process.env.SECRET).toString()
            }]
    }];
function populateUsers(done) {
    user_model_1.User.remove({})
        .then(() => {
        const userOne = new user_model_1.User(exports.users[0]).save();
        const userTwo = new user_model_1.User(exports.users[1]).save();
        return Promise.all([userOne, userTwo]);
    })
        .then(() => done())
        .catch(err => done(err));
}
exports.populateUsers = populateUsers;
//# sourceMappingURL=seed.js.map