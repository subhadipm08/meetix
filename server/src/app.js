import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import statsRouter from "./routes/stats.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { ApiError } from "./utils/ApiError.js";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials:true
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

// routes import (to be added later)
// import userRouter from './routes/user.routes.js'

// routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/stats", statsRouter);


// test-error
app.get("/api/v1/test-error", (req, res, next) => {
    throw new ApiError(503, "Test error");
});

// Global Error Handler (must be the very last middleware)
app.use(errorHandler);

export { app };
