import {Document, Schema, model} from "mongoose";


export interface UserModel extends Document {
    email: string;
}

export const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    }
});

export const User = model<UserModel>('User', UserSchema);