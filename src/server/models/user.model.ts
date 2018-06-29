import {Document, Schema, model} from "mongoose";
import isEmail = require("validator/lib/isEmail");
import {sign} from "jsonwebtoken";
import {pick} from "lodash";


export interface UserModel extends Document {
    email: string;
    password: string;
    tokens: Token[];
    generateAuthToken(): Promise<string>;
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
    const secret = process.env.SECRET;
    if (!secret) {
        throw new Error('Could not hash token, because SECRET environmental variable was not found.');
    }
    const token = sign({_id: user._id.toHexString(), access}, secret).toString();
    user.tokens = user.tokens.concat([{access, token}]);
    return user.save().then(() => token);
};

export const User = model<UserModel>('User', UserSchema);