import * as express from 'express';
import {json} from "body-parser";
import {connect} from "mongoose";
import {ObjectId} from "mongodb";
import {pick} from "lodash";

import {Todo} from "./models/todo.model";

const PORT = process.env.PORT || 8080;
const DB_URL = process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp';

export const app = express();
connect(DB_URL);
// TODO: How to separate this?

app.use(json());

app.get('/todos', (req, res) => {
   Todo.find().then(todos => {
       res.send({todos});
   }).catch(err => res.status(400).send(err));
});

app.get('/todos/:id', (req, res) => {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        res.status(400).send({error: 'Invalid id!'});
        return;
    }
    Todo.findById(req.params.id)
        .then(todo => {
            if (todo) {
                res.send({todo});
                return;
            }
            res.status(404).send({error: 'Could not find todo with that id!'});
        })
        .catch(err => res.status(400).send({error: 'Could not reach database!'}))
});

app.post('/todos', (req, res) => {
    const todo = new Todo({
        text: req.body.text
    });
    todo.save()
        .then(doc => res.send(doc))
        .catch(err => res.status(400).send(err));
});

app.delete('/todos/:id', (req, res) => {
   const id = req.params.id;
    if (!ObjectId.isValid(id)) {
        res.status(400).send({error: 'Invalid id!'});
        return;
    }
    Todo.findByIdAndRemove(id)
        .then(todo => {
            if (todo) {
                res.send({todo});
                return;
            }
            res.status(404).send({error: 'Could not find todo with that id!'});
        })
        .catch(err => res.status(400).send({error: 'Could not reach database!'}));
});

app.patch('/todos/:id', (req, res) => {
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

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then(todo => {
        if (todo) {
            res.send({todo});
            return;
        }
        res.status(404).send({error: 'Could not find todo with that id!'});
    }).catch(err => res.status(400).send({error: 'Could not reach database!'}))
});

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));