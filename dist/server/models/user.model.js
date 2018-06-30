"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const isEmail = require("validator/lib/isEmail");
const jsonwebtoken_1 = require("jsonwebtoken");
const lodash_1 = require("lodash");
const bcryptjs_1 = require("bcryptjs");
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
    const token = jsonwebtoken_1.sign({ _id: user._id.toHexString(), access }, process.env.SECRET).toString();
    user.tokens = user.tokens.concat([{ access, token }]);
    return user.save().then(() => token);
};
UserSchema.methods.removeToken = function (token) {
    const user = this;
    return user.update({
        $pull: {
            tokens: { token }
        }
    });
};
UserSchema.pre('save', function (next) {
    const user = this;
    if (!user.isModified('password')) {
        return next();
    }
    bcryptjs_1.genSalt(12, (err, salt) => {
        bcryptjs_1.hash(user.password, salt, (err, hash) => {
            user.password = hash;
            next();
        });
    });
});
UserSchema.statics.findByToken = function (token) {
    let decodedToken;
    try {
        decodedToken = jsonwebtoken_1.verify(token, process.env.SECRET);
    }
    catch (e) {
        return Promise.reject('Invalid credentials!');
    }
    decodedToken = decodedToken;
    return this.findOne({
        '_id': decodedToken._id,
        'tokens.token': token,
        'tokens.access': decodedToken.access
    });
};
UserSchema.statics.findByCredentials = function (email, password) {
    return this.findOne({ email }).then((user) => {
        if (!user) {
            return Promise.reject('Invalid credentials!');
        }
        return new Promise(((resolve, reject) => {
            bcryptjs_1.compare(password, user.password, (err, res) => {
                if (err || !res) {
                    reject('Invalid credentials!');
                }
                resolve(user);
            });
        }));
    });
};
exports.User = mongoose_1.model('User', UserSchema);
//# sourceMappingURL=user.model.js.map