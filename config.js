'use strict';
exports.DATABASE_URL = 
    process.env.DATABASE_URL || 'mongodb://localhost/blog-app-mongoose';
exports.TEST_DATABASE_URL = 
    process.env.TEST_DATABASE_URL || 'mongodb://localhost/test-blog-app-mongoose';
exports.PORT = process.env.PORT || 8080;