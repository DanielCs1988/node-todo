"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = process.env.NODE_ENV || 'development';
if (exports.env === 'development') {
    process.env.PORT = '8080';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
}
else if (exports.env === 'test') {
    process.env.PORT = '8080';
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
}
//# sourceMappingURL=config.js.map