import * as mng from "mongoose";


export interface TodoModel extends mng.Document {
    text: string;
    completed?: boolean;
    completedAt?: number | null;
    _owner: mng.Types.ObjectId;
}

const TodoSchema = new mng.Schema({
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
    },
    _owner: {
        type: mng.Schema.Types.ObjectId,
        required: true
    }
});

export const Todo = mng.model<TodoModel>('Todo', TodoSchema);
