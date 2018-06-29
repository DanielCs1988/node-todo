import {Todo} from "../server/models/todo.model";
import {connect} from "mongoose";
import {ObjectId} from "mongodb";
import {User} from "../server/models/user.model";

const DB_URL = 'mongodb://localhost:27017/TodoApp';
connect(DB_URL);

const id = '5b360ad6d527ca1d80da031d';
const userId = '5b3537807307172a4c721af1';

if (!ObjectId.isValid(id)) {
    console.log('Invalid id!');
}

Todo.findById(id)
    .then(todo => {
        if (!todo) {
            return console.log('ID not found.');
        }
        console.log(JSON.stringify(todo, undefined, 4));
    })
    .catch(err => console.log(err));

User.findById(userId)
    .then(user => {
        if (!user) {
            return console.log('ID not found.');
        }
        console.log(JSON.stringify(user, undefined, 4));
    })
    .catch(err => console.log(err));