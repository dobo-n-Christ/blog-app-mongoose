'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const authorSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: {type: String, unique: true}
});

const commentSchema = mongoose.Schema({content: String});

const postSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'Author'},
    created: {type: Date, default: Date.now},
    comments: [commentSchema]
});

postSchema.pre('findOne', function(next) {
    this.populate('author');
    next();
});

postSchema.pre('find', function(next) {
    this.populate('author');
    next();
});

postSchema.virtual('authorName').get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

postSchema.methods.serialize = function() {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        author: this.authorName,
        created: this.created,
        comments: this.comments
    };
};

const Author = mongoose.model('Author', authorSchema);
const Post = mongoose.model('Post', postSchema);

module.exports = {Author, Post};