import {MongoClient, ObjectID} from "mongodb";

MongoClient.connect('mongodb://localhost:27017', (err, client) => {
    if (err) {
        return console.log('Unable to connect to Mongo!');
    }
    console.log('Connected to Mongo...');
    const db = client.db('TodoApp');

    // db.collection('Todos').deleteMany({text: 'Eat dinner'}).then(result => {
    //     console.log(`Deleted: ${result.deletedCount} number of entries.`);
    // }).catch(err => console.log(err));

    db.collection('Todos').findOneAndDelete({_id: new ObjectID('5b35097ed56e241498a6cae2')}).then(obj => {
        console.log(JSON.stringify(obj.value, undefined, 4));
    }).catch(err => console.log('Could not delete.'));

    client.close();
});