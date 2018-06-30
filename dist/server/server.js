"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
exports.app.get('/todos', authenticate_1.authenticate, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        const todos = yield todo_model_1.Todo.find({ _owner: req.user._id });
        res.send({ todos });
    }
    catch (e) {
        res.status(400).send();
    }
}));
exports.app.get('/todos/:id', authenticate_1.authenticate, (req, res) => __awaiter(this, void 0, void 0, function* () {
    const id = req.params.id;
    if (!mongodb_1.ObjectId.isValid(id)) {
        res.status(400).send({ error: 'Invalid id!' });
        return;
    }
    try {
        const todo = yield todo_model_1.Todo.findOne({ _id: req.params.id, _owner: req.user._id });
        if (todo) {
            res.send({ todo });
            return;
        }
        res.status(404).send({ error: 'Could not find todo with that id!' });
    }
    catch (e) {
        res.status(400).send({ error: 'Could not reach database!' });
    }
}));
exports.app.post('/todos', authenticate_1.authenticate, (req, res) => __awaiter(this, void 0, void 0, function* () {
    const todo = new todo_model_1.Todo({
        text: req.body.text,
        _owner: req.user._id
    });
    try {
        const savedTodo = yield todo.save();
        res.send(savedTodo);
    }
    catch (err) {
        res.status(400).send(err);
    }
}));
exports.app.delete('/todos/:id', authenticate_1.authenticate, (req, res) => __awaiter(this, void 0, void 0, function* () {
    const id = req.params.id;
    if (!mongodb_1.ObjectId.isValid(id)) {
        res.status(400).send({ error: 'Invalid id!' });
        return;
    }
    try {
        const todo = yield todo_model_1.Todo.findOneAndRemove({ _id: id, _owner: req.user._id });
        if (todo) {
            res.send({ todo });
            return;
        }
        res.status(404).send({ error: 'Could not find todo with that id!' });
    }
    catch (e) {
        res.status(400).send({ error: 'Could not reach database!' });
    }
}));
exports.app.patch('/todos/:id', authenticate_1.authenticate, (req, res) => __awaiter(this, void 0, void 0, function* () {
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
    try {
        const todo = yield todo_model_1.Todo.findOneAndUpdate({ _id: id, _owner: req.user._id }, { $set: body }, { new: true });
        if (todo) {
            res.send({ todo });
            return;
        }
        res.status(404).send({ error: 'Could not find todo with that id!' });
    }
    catch (e) {
        res.status(400).send({ error: 'Could not reach database!' });
    }
}));
exports.app.post('/users', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const user = new user_model_1.User(lodash_1.pick(req.body, ['email', 'password']));
    try {
        yield user.save();
        const token = yield user.generateAuthToken();
        res.header('x-auth', token).send(user);
    }
    catch (e) {
        res.status(400).send();
    }
}));
exports.app.get('/users/me', authenticate_1.authenticate, (req, res) => {
    res.send(req.user);
});
exports.app.post('/users/login', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const authData = lodash_1.pick(req.body, ['email', 'password']);
    try {
        const user = yield user_model_1.User.findByCredentials(authData.email, authData.password);
        const token = yield user.generateAuthToken();
        res.header('x-auth', token).send(user);
    }
    catch (e) {
        res.status(401).send('Invalid credentials!');
    }
}));
exports.app.delete('/users', authenticate_1.authenticate, (req, res) => __awaiter(this, void 0, void 0, function* () {
    try {
        yield req.user.removeToken(req.token);
        res.status(200).send();
    }
    catch (e) {
        res.status(401).send();
    }
}));
exports.app.listen(PORT, () => console.log(`Server is listening on port ${PORT} in ${config_1.env} mode...`));
//# sourceMappingURL=server.js.map