// put db connection logic here

const { MongoClient } = require('mongodb')
require('dotenv').config()

// variable to hold an established mdb connection
let dbConnection

// let uri = 'mongodb://localhost:27017/bloug_mdb' // local db version
let uri= process.env.MDB_URI

module.exports = {

    // initiate db connection. we also take and handle a callback function
    connectToDb: (callBack) => {
        // async
        MongoClient.connect(uri)
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