import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

const errorHandler = (err, req, res, next) => {
    let error = err;

    // Transform generic errors into ApiError
    if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
        const message = error.message || "Something went wrong";
        error = new ApiError(statusCode, message, error?.errors || [], err.stack);
    }

    // Prepare the response object
    const response = {
        ...error,
        message: error.message,
        ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    };

    // Send error response
    return res.status(error.statusCode).json(response);
};

export { errorHandler };

//some of the middlewares goes into the routes and some of the 
//them goes into app.js always or sometime you need to remember that