import * as express from 'express';
import {json} from "body-parser";
import {connect} from "mongoose";
import {ObjectId} from "mongodb";
import {pick} from "lodash";

import {Todo} from "./models/todo.model";
import {env} from "./config/config";
import {IUser, User} from "./models/user.model";
import {authenticate} from "./middleware/authenticate";

const PORT = process.env.PORT;
const DB_URL = process.env.MONGODB_URI;

export const app = express();
connect(DB_URL!);

app.use(json());

app.get('/todos', authenticate, async (req: any, res) => {
    try {
        const todos = await Todo.find({_owner: req.user._id});
        res.send({todos});
    } catch (e) {
        res.status(400).send();
    }
});

app.get('/todos/:id', authenticate, async (req: any, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        res.status(400).send({error: 'Invalid id!'});
        return;
    }
    try {
        const todo = await Todo.findOne({_id: req.params.id, _owner: req.user._id});
        if (todo) {
            res.send({todo});
            return;
        }
        res.status(404).send({error: 'Could not find todo with that id!'});
    } catch (e) {
        res.status(400).send({error: 'Could not reach database!'});
    }
});

app.post('/todos', authenticate, async (req: any, res) => {
    const todo = new Todo({
        text: req.body.text,
        _owner: req.user._id
    });
    try {
        const savedTodo = await todo.save();
        res.send(savedTodo);
    } catch (err) {
        res.status(400).send(err)
    }
});

app.delete('/todos/:id', authenticate, async (req: any, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        res.status(400).send({error: 'Invalid id!'});
        return;
    }
    try {
        const todo = await Todo.findOneAndRemove({_id: id, _owner: req.user._id});
        if (todo) {
            res.send({todo});
            return;
        }
        res.status(404).send({error: 'Could not find todo with that id!'});
    } catch (e) {
        res.status(400).send({error: 'Could not reach database!'});
    }
});

app.patch('/todos/:id', authenticate, async (req: any, res) => {
    const id = req.params.id;
    const body: any = pick(req.body, ['text', 'completed']);

    if (body.text !== undefined && body.text === '') {
        res.status(400).send({error: 'Text cannot be empty!'});
        return;
    }

    if (!ObjectId.isValid(id)) {
        res.status(400).send({error: 'Invalid id!'});
        return;
    }
    if (body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    try {
        const todo = await Todo.findOneAndUpdate(
            {_id: id, _owner: req.user._id},
            {$set: body},
            {new: true}
        );
        if (todo) {
            res.send({todo});
            return;
        }
        res.status(404).send({error: 'Could not find todo with that id!'});
    } catch (e) {
        res.status(400).send({error: 'Could not reach database!'})
    }
});

app.post('/users', async (req, res) => {
    try {
        const user = new User(pick(req.body, ['email', 'password']));
        await user.save();
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(400).send();
    }
});

app.get('/users/me', authenticate, (req: any, res) => {
    res.send(req.user);
});

app.post('/users/login', async (req, res) => {
    try {
        const authData = pick(req.body, ['email', 'password']);
        const user = await User.findByCredentials(authData.email, authData.password);
        const token = await user.generateAuthToken();
        res.header('x-auth', token).send(user);
    } catch (e) {
        res.status(401).send('Invalid credentials!');
    }
});

app.delete('/users', authenticate, async (req: any, res) => {
    try {
        await req.user.removeToken(req.token);
        res.status(200).send();
    } catch (e) {
        res.status(401).send();
    }
});

app.listen(PORT, () => console.log(`Server is listening on port ${PORT} in ${env} mode...`));