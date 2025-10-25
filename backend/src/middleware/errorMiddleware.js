const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    // 1. Determine the status code. Prioritize custom status codes
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;
    let errors = undefined;

    // --- 2. Map Specific Mongoose/MongoDB Errors ---
    
    // A. Mongoose Bad ObjectId (CastError)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404; 
        message = `Resource not found with ID of ${err.value}`;
    }

    // B. Mongoose Validation Error
    if (err.name === 'ValidationError') {
        statusCode = 400; 
        message = 'Validation Failed';
        errors = Object.values(err.errors).map(val => ({
            field: val.path,
            message: val.message
        }));
    }

    // C. Mongoose Duplicate Key Error (Code 11000)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate field value entered: ${field} already exists.`;
    }

    // --- 3. Final Response ---
    res.status(statusCode);

    res.json({
        success: false,
        status: statusCode,
        message: message,
        errors: errors, 
        // Only include the stack trace in development mode
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
};

module.exports = { notFound, errorHandler };