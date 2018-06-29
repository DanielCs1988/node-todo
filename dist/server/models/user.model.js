"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const isEmail = require("validator/lib/isEmail");
const jsonwebtoken_1 = require("jsonwebtoken");
const lodash_1 = require("lodash");
const UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: isEmail,
            message: '{VALUE} is not a valid email!'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
            access: {
                type: String,
                required: true
            },
            token: {
                type: String,
                required: true
            }
        }]
});
UserSchema.methods.toJSON = function () {
    const userObj = this.toObject();
    return lodash_1.pick(userObj, ['_id', 'email']);
};
UserSchema.methods.generateAuthToken = function () {
    const user = this;
    const access = 'auth';
    const secret = process.env.SECRET;
    if (!secret) {
        throw new Error('Could not hash token, because SECRET environmental variable was not found.');
    }
    const token = jsonwebtoken_1.sign({ _id: user._id.toHexString(), access }, secret).toString();
    user.tokens = user.tokens.concat([{ access, token }]);
    return user.save().then(() => token);
};
exports.User = mongoose_1.model('User', UserSchema);
//# sourceMappingURL=user.model.js.map