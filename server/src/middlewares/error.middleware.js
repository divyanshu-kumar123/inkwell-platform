import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    // Default error values
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose bad ObjectId
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        message = `Resource not found. Invalid: ${err.path}`;
        statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const value = Object.keys(err.keyValue)[0];
        message = `Duplicate field value entered: ${value}. Please use another value.`;
        statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        message = messages.join('. ');
        statusCode = 400;
    }

    // If the error is not one we specifically handle, log it for debugging
    if (statusCode === 500) {
        console.error(err); 
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        errors: err.errors || undefined,
        // Provide stack trace only in development environment
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

export { errorHandler };