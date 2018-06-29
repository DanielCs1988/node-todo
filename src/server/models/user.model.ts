import {Document, Schema, model, Model} from "mongoose";
import isEmail = require("validator/lib/isEmail");
import {sign, verify} from "jsonwebtoken";
import {pick} from "lodash";
import {compare, genSalt, hash} from "bcryptjs";

const secret = process.env.SECRET;
if (!secret) {
    throw new Error('Could not hash token, because SECRET environmental variable was not found.');
}

export interface IUser extends Document {
    email: string;
    password: string;
    tokens: Token[];
    generateAuthToken(): Promise<string>;
}

export interface IUserModel extends Model<IUser> {
    findByToken(token: string | undefined): any;
    findByCredentials(email: string, password: string): any;
}

export interface Token {
    access: string;
    token: string;
}

const UserSchema = new Schema({
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

UserSchema.methods.toJSON = function (): {_id: string, email: string} {
    const userObj = this.toObject();
    return pick(userObj, ['_id', 'email']);
};

UserSchema.methods.generateAuthToken = function (): Promise<string> {
    const user = this;
    const access = 'auth';
    const token = sign({_id: user._id.toHexString(), access}, secret).toString();
    user.tokens = user.tokens.concat([{access, token}]);
    return user.save().then(() => token);
};

UserSchema.pre('save', function (next) {
   const user = <IUser>this;
    if (!user.isModified('password')) {
        return next();
    }
   genSalt(12, (err, salt) => {
      hash(user.password, salt, (err, hash) => {
          user.password = hash;
          next();
      })
   });
});

UserSchema.statics.findByToken = function (token: string | undefined): any {
    let decodedToken;
    try {
        decodedToken = verify(token!, secret);
    } catch (e) {
        return Promise.reject('Invalid credentials!');
    }
    decodedToken = <{_id: string, access: string}>decodedToken;
    return this.findOne({
        '_id': decodedToken._id,
        'tokens.token': token,
        'tokens.access': decodedToken.access
    });
};

UserSchema.statics.findByCredentials = function (email: string, password: string): any {
    return this.findOne({email}).then((user: IUser) => {
        if (!user) {
            return Promise.reject('Invalid credentials!');
        }
        return new Promise(((resolve, reject) => {
            compare(password, user.password, (err, res) => {
                if (err || !res) {
                    reject('Invalid credentials!');
                }
                resolve(user);
            });
        }));
    })
};

export const User: IUserModel = model<IUser, IUserModel>('User', UserSchema);