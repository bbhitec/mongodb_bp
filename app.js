// main testing server logic

const express = require('express')
const { connectToDb, getDb } = require('./db')  // db connection logic module
const { ObjectId } = require('mongodb')

// init express app
const app = express()


// we establish db connection before opening a listening port
let db

connectToDb((err) => {
    if (!err) {
        // open a port
        app.listen(3000, () => {
            console.log('RUNNING. Listening on port 3000')
        })
        db = getDb()
    }
})

// define a request endpoint
app.get('/blogs', (req, res) => {

    let blogs = []  // response holding array

    db.collection('blogs')
        .find() // cursor toArray forEach batches
        .sort({ author: 1 })
        .forEach(blog => blogs.push(blog))
        .then(() => {
            res.status(200).json(blogs) // set a successful response
        })
        .catch(() => {
            res.status(500).json({error: 'Could not fetch the documents'}) // set an errot state
        })
})

// define a per-id request
app.get('/blogs/:id', (req, res) => {

    // check if the id string is valid
    if (ObjectId.isValid(req.params.id)) {
        db.collection('blogs')
            .findOne( {_id: new ObjectId(req.params.id)} )  // we find by id with the Object directive
            .then((document) => {
                res.status(200).json(document) // set a successful response
            })
            .catch((err) => {
                res.status(500).json({error: 'Could not fetch the document'}) // set an errot state
            })
    } else {
        res.status(500).json({error: 'Invalid document id'})
    }

})