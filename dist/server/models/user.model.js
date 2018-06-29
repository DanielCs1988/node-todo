"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    }
});
exports.User = mongoose_1.model('User', UserSchema);
//# sourceMappingURL=user.model.js.map