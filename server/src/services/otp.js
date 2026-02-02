const crypto = require("crypto");

const generateOtpCode = () => String(crypto.randomInt(100000, 999999));

const generateSessionId = () => crypto.randomUUID();

module.exports = { generateOtpCode, generateSessionId };
