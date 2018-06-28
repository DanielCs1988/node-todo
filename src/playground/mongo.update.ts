import {MongoClient, ObjectID} from "mongodb";

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) {
        return console.log('Unable to connect to Mongo!');
    }
    console.log('Connected to Mongo...');
    const db = client.db('TodoApp');

    db.collection('Users').findOneAndUpdate(
        {_id: new ObjectID('5b3517976cfcd003660addfc')},
        {$set: {name: 'Dave'}, $inc: {age: -1}},
        {returnOriginal: false}
        ).then(res => {
            console.log(JSON.stringify(res, undefined, 4));
    });

    client.close();
});