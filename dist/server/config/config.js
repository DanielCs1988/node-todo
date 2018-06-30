"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = process.env.NODE_ENV || 'development';
if (exports.env === 'development' || exports.env === 'test') {
    const config = require('./config.json');
    const currentParams = config[exports.env];
    Object.keys(currentParams).forEach(key => {
        process.env[key] = currentParams[key];
    });
}
//# sourceMappingURL=config.js.map