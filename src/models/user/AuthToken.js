import mongoose from "mongoose";

const AuthTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: false,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },

    expiresAt: {
        type: Number,
        required: false,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    }
});

AuthTokenSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

const AuthToken = mongoose.model("AuthToken", AuthTokenSchema);

export default AuthToken;
