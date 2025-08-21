/**
 * about params
 * @param {number} statusCode - The HTTP status code.
 * @param {object} data - The response data.
 * @param {string} message - A success message.
 */

class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400; // Status codes below 400 are generally success
    }
}

export { ApiResponse };