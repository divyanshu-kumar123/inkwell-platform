 /**
  * about params
     * @param {number} statusCode - The HTTP status code of the error.
     * @param {string} message - The error message.
     * @param {Array} errors - (Optional) A list of validation errors.
     * @param {string} stack - (Optional) The error stack trace.
*/

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null; // As per standard API error response structure
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export { ApiError };