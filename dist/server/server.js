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
exports.app.use(body_parser_1.json());
exports.app.get('/todos', authenticate_1.authenticate, (req, res) => {
    todo_model_1.Todo.find({ _owner: req.user._id }).then(todos => {
        res.send({ todos });
    }).catch(err => res.status(400).send(err));
});
exports.app.get('/todos/:id', authenticate_1.authenticate, (req, res) => {
    const id = req.params.id;
    if (!mongodb_1.ObjectId.isValid(id)) {
        res.status(400).send({ error: 'Invalid id!' });
        return;
    }
    todo_model_1.Todo.findOne({ _id: req.params.id, _owner: req.user._id })
        .then(todo => {
        if (todo) {
            res.send({ todo });
            return;
        }
        res.status(404).send({ error: 'Could not find todo with that id!' });
    })
        .catch(err => res.status(400).send({ error: 'Could not reach database!' }));
});
exports.app.post('/todos', authenticate_1.authenticate, (req, res) => {
    const todo = new todo_model_1.Todo({
        text: req.body.text,
        _owner: req.user._id
    });
    todo.save()
        .then(doc => res.send(doc))
        .catch(err => res.status(400).send(err));
});
exports.app.delete('/todos/:id', authenticate_1.authenticate, (req, res) => {
    const id = req.params.id;
    if (!mongodb_1.ObjectId.isValid(id)) {
        res.status(400).send({ error: 'Invalid id!' });
        return;
    }
    todo_model_1.Todo.findOneAndRemove({ _id: id, _owner: req.user._id })
        .then(todo => {
        if (todo) {
            res.send({ todo });
            return;
        }
        res.status(404).send({ error: 'Could not find todo with that id!' });
    })
        .catch(err => res.status(400).send({ error: 'Could not reach database!' }));
});
exports.app.patch('/todos/:id', authenticate_1.authenticate, (req, res) => {
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
    todo_model_1.Todo.findOneAndUpdate({ _id: id, _owner: req.user._id }, { $set: body }, { new: true })
        .then(todo => {
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
exports.app.post('/users/login', (req, res) => {
    const authData = lodash_1.pick(req.body, ['email', 'password']);
    user_model_1.User.findByCredentials(authData.email, authData.password)
        .then((user) => {
        return user.generateAuthToken().then(token => {
            res.header('x-auth', token).send(user);
        });
    })
        .catch((err) => res.status(401).send('Invalid credentials!'));
});
exports.app.delete('/users', authenticate_1.authenticate, (req, res) => {
    req.user.removeToken(req.token)
        .then(() => res.status(200).send())
        .catch(() => res.status(401).send());
});
exports.app.listen(PORT, () => console.log(`Server is listening on port ${PORT} in ${config_1.env} mode...`));
//# sourceMappingURL=server.js.map