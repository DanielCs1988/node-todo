import * as express from 'express';
import {json} from "body-parser";
import {connect} from "mongoose";

import {Todo} from "./models/todo.model";

export const app = express();
const PORT = process.env.port || 8080;

const DB_URL = 'mongodb://localhost:27017/TodoApp';
connect(DB_URL);
// TODO: How to separate this?

app.use(json());

app.post('/todos', (req, res) => {
    const todo = new Todo({
        text: req.body.text
    });
    todo.save()
        .then(doc => res.send(doc))
        .catch(err => res.status(400).send(err));
});

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));