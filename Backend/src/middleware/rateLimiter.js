const rateLimit =require("express-rate-limit");
app.set('trust proxy', 1)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes

    limit: 100, // Maximum 100 requests

    message: {
        success: false,
        message: "Too many requests. Please try again later."
    },

    standardHeaders: "draft-8",
    legacyHeaders: false,
});

module.exports =limiter;