"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../models/user.model");
function authenticate(req, res, next) {
    const token = req.header('x-auth');
    user_model_1.User.findByToken(token).then((user) => {
        if (!user) {
            return Promise.reject('Invalid credentials!');
        }
        req.user = user;
        req.token = token;
        return next();
    }).catch((err) => res.status(401).send(err));
}
exports.authenticate = authenticate;
//# sourceMappingURL=authenticate.js.map