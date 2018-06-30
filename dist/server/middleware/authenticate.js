"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../models/user.model");
function authenticate(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = req.header('x-auth');
        try {
            const user = yield user_model_1.User.findByToken(token);
            if (!user) {
                throw new Error('Invalid credentials!');
            }
            req.user = user;
            req.token = token;
            next();
        }
        catch (e) {
            res.status(401).send('Invalid credentials!');
        }
    });
}
exports.authenticate = authenticate;
//# sourceMappingURL=authenticate.js.map