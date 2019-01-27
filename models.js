'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const postSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {
        firstName: String,
        lastName: String
    },
    created: {type: Date, default: Date.now}
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
        created: this.created
    };
};

const Post = mongoose.model('Post', postSchema);

module.exports = {Post};