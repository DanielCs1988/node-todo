"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const body_parser_1 = require("body-parser");
const mongoose_1 = require("mongoose");
const mongodb_1 = require("mongodb");
const lodash_1 = require("lodash");
const todo_model_1 = require("./models/todo.model");
const config_1 = require("./config/config");
const user_model_1 = require("./models/user.model");
const authenticate_1 = require("./middleware/authenticate");
const PORT = process.env.PORT;
const DB_URL = process.env.MONGODB_URI;
exports.app = express();
mongoose_1.connect(DB_URL);
// TODO: How to separate this?
exports.app.use(body_parser_1.json());
exports.app.get('/todos', (req, res) => {
    todo_model_1.Todo.find().then(todos => {
        res.send({ todos });
    }).catch(err => res.status(400).send(err));
});
exports.app.get('/todos/:id', (req, res) => {
    const id = req.params.id;
    if (!mongodb_1.ObjectId.isValid(id)) {
        res.status(400).send({ error: 'Invalid id!' });
        return;
    }
    todo_model_1.Todo.findById(req.params.id)
        .then(todo => {
        if (todo) {
            res.send({ todo });
            return;
        }
        res.status(404).send({ error: 'Could not find todo with that id!' });
    })
        .catch(err => res.status(400).send({ error: 'Could not reach database!' }));
});
exports.app.post('/todos', (req, res) => {
    const todo = new todo_model_1.Todo({
        text: req.body.text
    });
    todo.save()
        .then(doc => res.send(doc))
        .catch(err => res.status(400).send(err));
});
exports.app.delete('/todos/:id', (req, res) => {
    const id = req.params.id;
    if (!mongodb_1.ObjectId.isValid(id)) {
        res.status(400).send({ error: 'Invalid id!' });
        return;
    }
    todo_model_1.Todo.findByIdAndRemove(id)
        .then(todo => {
        if (todo) {
            res.send({ todo });
            return;
        }
        res.status(404).send({ error: 'Could not find todo with that id!' });
    })
        .catch(err => res.status(400).send({ error: 'Could not reach database!' }));
});
exports.app.patch('/todos/:id', (req, res) => {
    const id = req.params.id;
    const body = lodash_1.pick(req.body, ['text', 'completed']);
    if (body.text !== undefined && body.text === '') {
        res.status(400).send({ error: 'Text cannot be empty!' });
        return;
    }
    if (!mongodb_1.ObjectId.isValid(id)) {
        res.status(400).send({ error: 'Invalid id!' });
        return;
    }
    if (body.completed) {
        body.completedAt = new Date().getTime();
    }
    else {
        body.completed = false;
        body.completedAt = null;
    }
    todo_model_1.Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then(todo => {
        if (todo) {
            res.send({ todo });
            return;
        }
        res.status(404).send({ error: 'Could not find todo with that id!' });
    }).catch(err => res.status(400).send({ error: 'Could not reach database!' }));
});
exports.app.post('/users', (req, res) => {
    const user = new user_model_1.User(lodash_1.pick(req.body, ['email', 'password']));
    user.save()
        .then(() => user.generateAuthToken())
        .then(token => res.header('x-auth', token).send(user))
        .catch(err => res.status(400).send(err));
});
exports.app.get('/users/me', authenticate_1.authenticate, (req, res) => {
    res.send(req.user);
});
exports.app.listen(PORT, () => console.log(`Server is listening on port ${PORT} in ${config_1.env} mode...`));
//# sourceMappingURL=server.js.map