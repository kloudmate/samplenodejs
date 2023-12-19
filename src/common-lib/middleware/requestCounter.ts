import { meter } from "../../instrumentation";

const requestCounter = meter.createCounter('requests_total', {
    description: 'Total number of requests',
});

export const countRequestsMiddleware = (req, res, next) => {
    // Increment the counter for each incoming request
    requestCounter.add(1, {
        'http.method': req.method,
        'http.route': req.originalUrl,
    });

    next();
};


