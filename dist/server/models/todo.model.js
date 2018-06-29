"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mng = require("mongoose");
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
exports.Todo = mng.model('Todo', TodoSchema);
//# sourceMappingURL=todo.model.js.map