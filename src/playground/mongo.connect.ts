import {MongoClient} from "mongodb";

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) {
        return console.log('Unable to connect to Mongo!');
    }
    console.log('Connected to Mongo...');
    const db = client.db('TodoApp');

    db.collection('Todos').insertOne({
        text: 'Something to do',
        completed: false
    }, (err: any, res: any) => {
        if (err) {
            return console.log('Unable to insert todo.', err);
        }
        console.log(JSON.stringify(res.ops, undefined, 4));
    });

    db.collection('Users').insertOne({
        name: 'Daniel',
        age: 29,
        location: 'Hungary'
    }, (err: any, res: any) => {
        if (err) {
            return console.log('Unable to insert user.', err);
        }
        console.log(JSON.stringify(res.ops, undefined, 4));
    });

    client.close();
});