export const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${err.stack || err.message}`);

    const isProduction = process.env.NODE_ENV === 'production';

    const statusCode = err.statusCode || 500;
    
    const response = {
        status: 'error',
        message: statusCode === 500 && isProduction 
            ? 'An internal server error occurred. Please try again later.' 
            : err.message
    };

    if (!isProduction && err.stack) {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};
