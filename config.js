'use strict';

console.log(process.env.DATABASE_URL || 'mongodb://localhost:27017/blog-app');
console.log(process.env.DATABASE_URL);

exports.DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/blog-app';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/test-blog-app';
exports.PORT = process.env.PORT || 8080;