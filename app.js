// main testing server logic

const express = require('express')
const { connectToDb, getDb } = require('./db')  // db connection logic module
const { ObjectId } = require('mongodb')


const app = express()   // init an express app
app.use(express.json()) // middleware: json parser is needed to form proper json data

// we establish a db connection before opening the listening port
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

// define a request endpoint (to handle a get request)
app.get('/blogs', (req, res) => {
    console.log('GET request received')

    // adding pagination: since the date set may be quite large,
    // we slice it to pages of pre-defined sizes
    const page = req.query.p || 0  // the logical check will default to first page
    const docsPerPage = 3
    console.log('page: ' + page + ' docs per page: ' + docsPerPage)


    let blogs = []  // response holding array

    db.collection('blogs')
        .find() // cursor toArray forEach batches
        .sort({ author: 1 })
        .skip(page * docsPerPage)
        .limit(docsPerPage)
        .forEach(blog => blogs.push(blog))
        .then(() => {
            res.status(200).json(blogs) // set a successful response
        })
        .catch(() => {
            res.status(500).json({ error: 'Could not fetch the documents' }) // set an errot state
        })
})

// define a per-id request
app.get('/blogs/:id', (req, res) => {
    console.log('GET by id request received')

    // check if the id string is valid
    if (ObjectId.isValid(req.params.id)) {
        db.collection('blogs')
            .findOne({ _id: new ObjectId(req.params.id) })  // we find by id with the Object directive
            .then((document) => {
                res.status(200).json(document) // set a successful response
            })
            .catch((err) => {
                res.status(500).json({ error: 'Could not fetch the document' }) // set an errot state
            })
    } else {
        res.status(500).json({ error: 'Invalid document id' })
    }

})

// define a post request endpoint handler
app.post('/blogs', (req, res) => {
    console.log('POST request received')
    const blog = req.body   // the use(express.json()) allows to read the body as it is

    db.collection('blogs')
        .insertOne(blog)
        .then((result) => {
            res.status(201).json(result) // set a 201 (create success) status and return result
            console.log('POST request handled')
        })
        .catch((err) => {
            res.status(500).json({ err: 'Failed creating anew document' })
        })



})

// deletion endpoint is similar t get-by-id one
app.delete('/blogs/:id', (req, res) => {
    console.log('DELETE by id request received')

    // check if the id string is valid
    if (ObjectId.isValid(req.params.id)) {
        db.collection('blogs')
            .deleteOne({ _id: new ObjectId(req.params.id) })  // we find by id with the Object directive
            .then((result) => {
                res.status(200).json(result) // set a successful response
            })
            .catch((err) => {
                res.status(500).json({ error: 'Could not delete the document' }) // set an errot state
            })
    } else {
        res.status(500).json({ error: 'Invalid document id' })
    }
})


// update/patch endpoint by id
app.patch('/blogs/:id', (req, res) => {
    console.log('UPDATE by id request received')

    const updates = req.body

    if (ObjectId.isValid(req.params.id)) {
        db.collection('blogs')
            .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
            .then((result) => {
                res.status(200).json(result) // set a successful response
            })
            .catch((err) => {
                res.status(500).json({ error: 'Could not update the document' }) // set an errot state
            })

    } else {
        res.status(500).json({ error: 'Invalid document id' })
    }
})