import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
            minlength: [3, 'Username must be at least 3 characters long'],
            maxlength: [20, 'Username must be at most 20 characters long']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            required: [true, 'Gender is required']
        },
        avatar: {
            type: String,
            default: function() {
                const seed = this.username || Math.random().toString(36).substring(7);
                return `https://robohash.org/${seed}.png?set=set4`;
            }
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters long']
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            avatar: this.avatar
        },
        process.env.ACCESS_TOKEN_SECRET || "default_access_token",
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1d"
        }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET || "default_refresh_token",
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "10d"
        }
    );
};

export const User = mongoose.model("User", userSchema);
