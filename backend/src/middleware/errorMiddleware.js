const notFound = (req, res, next) => {
    // Standard 404 handler: Create a new Error object and pass it to the errorHandler
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    // 1. Determine the status code. Prioritize custom status codes (e.g., 401, 403, 409)
    // If res.statusCode is 200 (default success), it means an error occurred mid-request, 
    // so we default to 500, otherwise use the status already set.
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;
    let errors = undefined; // For structured validation errors

    // --- 2. Map Specific Mongoose/MongoDB Errors to Appropriate HTTP Status Codes ---
    
    // A. Mongoose Bad ObjectId (e.g., /api/drugs/invalidid)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404; // Treat invalid ID as Not Found for security/consistency
        message = `Resource not found with ID of ${err.value}`;
    }

    // B. Mongoose Validation Error (e.g., missing required field)
    if (err.name === 'ValidationError') {
        statusCode = 400; // Bad Request
        message = 'Validation Failed';
        // Extract detailed validation messages
        errors = Object.values(err.errors).map(val => ({
            field: val.path,
            message: val.message
        }));
    }

    // C. Mongoose Duplicate Key Error (e.g., registering with existing email)
    if (err.code === 11000) {
        statusCode = 409; // Conflict
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate field value entered: ${field} already exists.`;
    }

    // --- 3. Final Response ---

    // Set the final HTTP status code
    res.status(statusCode);

    // Send the structured JSON response
    res.json({
        success: false, // Explicitly indicate failure
        status: statusCode,
        message: message,
        errors: errors, // Only present for ValidationErrors
        // Only include the stack trace in development mode
        stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
    });
};

module.exports = { notFound, errorHandler };