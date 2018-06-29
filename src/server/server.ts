import * as express from 'express';
import {json} from "body-parser";
import {connect} from "mongoose";
import {ObjectId} from 'mongodb';

import {Todo} from "./models/todo.model";

export const app = express();
const PORT = process.env.port || 8080;

const DB_URL = 'mongodb://localhost:27017/TodoApp';
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

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));