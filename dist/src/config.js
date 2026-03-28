import dotenv from 'dotenv';
dotenv.config();
const parsePort = (value) => {
    const parsed = Number(value);
    if (Number.isInteger(parsed) && parsed > 0) {
        return parsed;
    }
    return 5000;
};
const parseAmount = (value, fallback) => {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
        return Number(parsed.toFixed(2));
    }
    return fallback;
};
export const config = {
    port: parsePort(process.env.PORT),
    jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
    stripeCurrency: (process.env.STRIPE_CURRENCY || 'usd').toLowerCase(),
    premiumPriceUsd: parseAmount(process.env.PREMIUM_PRICE_USD, 9.99),
};
//# sourceMappingURL=config.js.map