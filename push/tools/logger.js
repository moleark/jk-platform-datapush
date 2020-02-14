"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log4js_1 = require("log4js");
log4js_1.configure({
    appenders: {
        joint: { type: 'console' },
        'console': { type: 'console' }
    },
    categories: {
        joint: { appenders: ['joint'], level: 'debug' },
        default: { appenders: ['console'], level: 'debug' }
    },
    pm2: true
});
const logger = log4js_1.getLogger();
exports.logger = logger;
//# sourceMappingURL=logger.js.map