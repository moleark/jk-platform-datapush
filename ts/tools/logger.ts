import { configure, getLogger } from 'log4js';
configure({
    appenders: {
        joint: { type: 'console' },
        'console': { type: 'console' }
    },
    categories: {
        joint: { appenders: ['joint'], level: 'debug' },
        default: { appenders: ['console'], level: 'debug' }
    },
    pm2: true
})

const logger = getLogger();

export { logger }