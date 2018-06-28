import {MongoClient, ObjectID} from "mongodb";

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) {
        return console.log('Unable to connect to Mongo!');
    }
    console.log('Connected to Mongo...');
    const db = client.db('TodoApp');

    // db.collection('Todos').find({_id: new ObjectID('5b3513a56cfcd003660add5c')})
    //     .toArray()
    //     .then(docs => {
    //     console.log(JSON.stringify(docs, undefined, 4));
    // }).catch(err => console.log(err));

    // db.collection('Todos').find().count()
    //     .then(count => {
    //         console.log(count);
    //     }).catch(err => console.log(err));
    //
    // client.close();

    db.collection('Users').find({name: 'Daniel'}).toArray().then(docs => {
        console.log(JSON.stringify(docs, undefined, 4));
    }).catch(err => console.log(err));
});