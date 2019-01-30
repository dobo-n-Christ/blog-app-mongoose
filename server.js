'use strict';

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const {DATABASE_URL, PORT} = require('./config');
const {Author, Post} = require('./models');
const app = express();

app.use(morgan('common'));
app.use(express.json());

app.get('/posts', (req, res) => {
    Post.find()
    .then(posts => {
        // console.log(posts);
        console.log('it worked');
        res.json(posts.map(post => {
            return {
                id: post._id,
                title: post.title,
                content: post.content,
                // author: post.authorName,
                comments: post.comments

            };
        }));
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    });
});

app.get('/posts/:id', (req, res) => {
    Post.findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    });
});

app.post('/posts', (req, res) => {
    const requiredFields = ['title', 'content', 'author_id'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        };
    };
    Author.findById(req.body.author_id)
    .then(author => {
        if (author) {
            Post.create({
                title: req.body.title,
                content: req.body.content,
                author: req.body.author_id
            })
            .then(post => res.status(201).json(post))
            .catch(err => {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
            });  
        }
        else {
            const message = "Author not found";
            console.error(message);
            return res.status(400).send(message);
        };
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    });  
});

app.put('/posts/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
        console.error(message);
        return res.status(400).json({message: message});
    };
    const toBeUpdated = {};
    const updateableFields = ['title', 'content'];
    updateableFields.forEach(field => {
        if (field in req.body) {
            toBeUpdated[field] = req.body[field];
        };
    });
    Post.findByIdAndUpdate(req.params.id, {$set: toBeUpdated}, {new: true})
    .then(post => res.status(200).json(post))
    .catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    });
});

app.delete('/posts/:id', (req, res) => {
    Post.findByIdAndRemove(req.params.id)
    .then(() => res.status(204).end())
    .catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    });
});

app.post('/authors', (req, res) => {
    const requiredFields = ['firstName', 'lastName', 'userName'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    Author.findOne({userName: req.body.userName})
    .then(userName => {
        if (userName) {
            const message = 'Username already in use';
            console.error(message);
            return res.status(400).json({message: message});
        }
        Author.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName
        })
        .then(author => {
            res.status(201).json({
                _id: author.id,
                name: `${author.firstName} ${author.lastName}`,
                userName: author.userName
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "Internal server error"});
        });
    });
});

app.put('/authors/:id', (req, res) => {
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
        console.error(message);
        return res.status(400).json({message: message});
    }
    const toBeUpdated = {};
    const updateableFields = ['firstName', 'lastName', 'userName'];
    updateableFields.forEach(field => {
        if (field in req.body) {
            toBeUpdated[field] = req.body[field];
        };
    });
    Author.findOne({userName: req.body.userName})
    .then(userName => {
        if (userName) {
            const message = 'Username already in use';
            console.error(message);
            return res.status(400).json({message: message});
        }
        else {
            Author.findByIdAndUpdate(req.params.id, {$set: toBeUpdated}, {new: true})
            .then(updatedAuthor => {
                res.status(200).json({
                    _id: updatedAuthor.id,
                    name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
                    userName: updatedAuthor.userName
                });
            })
            .catch(err => {
                console.error(err);
                res.status(500).json({message: "Internal server error"});
            });
        }
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    });
});

app.delete('/authors/:id', (req, res) => {
    Post.remove({author: req.params.id})
    .then(() => {
        Author.findByIdAndRemove(req.params.id)
        .then(() => {
            const message = `Deleted posts by and author associated with id (${req.params.id})`;
            res.status(204).json({message: message});
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({message: "Internal server error"});
        });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    });
});

app.use('*', function(req, res) {
    res.status(404).json({message: 'Not Found'});
});

let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            };
            server = app.listen(port, () => {
                console.log(`Your app is listening on port ${port}`);
                resolve();
            })
            .on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
};

function closeServer() {
    return mongoose.disconnect()
    .then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
};

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};