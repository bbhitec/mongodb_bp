// put db connection logic here

const { MongoClient } = require('mongodb')

// variable to hold an established mdb connection
let dbConnection

module.exports = {

    // initiate db connection. we also take and handle a callback function
    connectToDb: (callBack) => {
        // async
        MongoClient.connect('mongodb://localhost:27017/bloug_mdb')
        .then((client) => {
            dbConnection = client.db();
            return callBack()
        })
        .catch (error => {
            console.log(error);
            callBack(error)
        })
    },

    // return the db connection
    getDb: () => dbConnection
}