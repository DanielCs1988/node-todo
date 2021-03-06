import {ObjectId} from "mongodb";
import {Todo} from "../models/todo.model";
import {sign} from "jsonwebtoken";
import {User} from "../models/user.model";

const userOneId = new ObjectId();
const userTwoId = new ObjectId();

export const todos = [{
    _id: new ObjectId(),
    text: 'First test todo',
    _owner: userOneId
}, {
    _id: new ObjectId(),
    text: 'Second test todo',
    completed: true,
    completedAt: 17500,
    _owner: userTwoId
}];

export function populateTodos(done: any) {
    Todo.remove({})
        .then(() => {
            return Todo.insertMany(todos, (err, doc) => {
                if (err) return done(err);
            });
        })
        .then(() => done())
        .catch(err => done(err));
}

export const users = [{
    _id: userOneId,
    email: 'kek@keklord.com',
    password: 's3cr3t',
    tokens: [{
        access: 'auth',
        token: sign({_id: userOneId, access: 'auth'}, process.env.SECRET!).toString()
    }]
}, {
    _id: userTwoId,
    email: 'zod@overmind.org',
    password: 'bevezetem.eu',
    tokens: [{
        access: 'auth',
        token: sign({_id: userTwoId, access: 'auth'}, process.env.SECRET!).toString()
    }]
}];

export function populateUsers(done: any) {
    User.remove({})
        .then(() => {
            const userOne = new User(users[0]).save();
            const userTwo = new User(users[1]).save();
            return Promise.all([userOne, userTwo]);
        })
        .then(() => done())
        .catch(err => done(err));
}