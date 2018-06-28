import {Document, Schema, model} from "mongoose";


export interface TodoModel extends Document {
    text: string;
    completed: boolean;
    completedAt: number;
}

export const TodoSchema = new Schema({
    text: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        required: false,
        default: null
    }
});

export const Todo = model<TodoModel>('Todo', TodoSchema);
