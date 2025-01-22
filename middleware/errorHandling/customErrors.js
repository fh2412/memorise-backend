// apps/component-a/domain/errors/customErrors.js
class AppError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
        this.isOperational = true;
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

class AuthenticationError extends AppError {
    constructor(message) {
        super(message, 401);
    }
}

module.exports = { AppError, ValidationError, AuthenticationError };
