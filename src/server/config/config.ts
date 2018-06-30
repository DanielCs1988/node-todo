export const env = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
    const config = require('./config.json');
    const currentParams = config[env];
    Object.keys(currentParams).forEach(key => {
        process.env[key] = currentParams[key];
    });
}