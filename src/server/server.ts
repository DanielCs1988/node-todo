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
// TODO: How to separate this?

app.use(json());

app.get('/todos', authenticate, (req: any, res) => {
   Todo.find({_owner: req.user._id}).then(todos => {
       res.send({todos});
   }).catch(err => res.status(400).send(err));
});

app.get('/todos/:id', authenticate, (req: any, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        res.status(400).send({error: 'Invalid id!'});
        return;
    }
    Todo.findOne({_id: req.params.id, _owner: req.user._id})
        .then(todo => {
            if (todo) {
                res.send({todo});
                return;
            }
            res.status(404).send({error: 'Could not find todo with that id!'});
        })
        .catch(err => res.status(400).send({error: 'Could not reach database!'}))
});

app.post('/todos', authenticate, (req: any, res) => {
    const todo = new Todo({
        text: req.body.text,
        _owner: req.user._id
    });
    todo.save()
        .then(doc => res.send(doc))
        .catch(err => res.status(400).send(err));
});

app.delete('/todos/:id', authenticate, (req: any, res) => {
   const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        res.status(400).send({error: 'Invalid id!'});
        return;
    }
    Todo.findOneAndRemove({_id: id, _owner: req.user._id})
        .then(todo => {
            if (todo) {
                res.send({todo});
                return;
            }
            res.status(404).send({error: 'Could not find todo with that id!'});
        })
        .catch(err => res.status(400).send({error: 'Could not reach database!'}));
});

app.patch('/todos/:id', authenticate, (req: any, res) => {
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

    Todo.findOneAndUpdate(
        {_id: id, _owner: req.user._id},
        {$set: body},
        {new: true}
        )
        .then(todo => {
        if (todo) {
            res.send({todo});
            return;
        }
        res.status(404).send({error: 'Could not find todo with that id!'});
    }).catch(err => res.status(400).send({error: 'Could not reach database!'}))
});

app.post('/users', (req, res) => {
    const user = new User(pick(req.body, ['email', 'password']));
    user.save()
        .then(() => user.generateAuthToken())
        .then(token => res.header('x-auth', token).send(user))
        .catch(err => res.status(400).send(err));
});

app.get('/users/me', authenticate, (req: any, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
   const authData = pick(req.body, ['email', 'password']);
   User.findByCredentials(authData.email, authData.password)
       .then((user: IUser) => {
           return user.generateAuthToken().then(token => {
               res.header('x-auth', token).send(user)
           });
       })
       .catch((err: Error) => res.status(401).send('Invalid credentials!'));
});

app.delete('/users', authenticate, (req: any, res) => {
    req.user.removeToken(req.token)
        .then(() => res.status(200).send())
        .catch(() => res.status(401).send());
});

app.listen(PORT, () => console.log(`Server is listening on port ${PORT} in ${env} mode...`));