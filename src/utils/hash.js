const crypto = require("crypto");
exports.randomId = (len = 24) => crypto.randomBytes(len).toString("hex");
