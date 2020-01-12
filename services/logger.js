/* eslint-disable no-param-reassign */
const winston = require("winston");
const path = require("path");
const fs = require("fs");
const util = require('util');

function transform(info) {
    const args = info[Symbol.for('splat')];
    if (args) {
        info.message = util.format(info.message, ...args);
    }
    return info;
}

function utilFormatter() {
    return {
        transform
    };
}
const log_folder = (process.env.NODE_ENV === "production") ? path.resolve(process.cwd(), "../logs/") : path.resolve(process.cwd(), "./logs/");
fs.mkdirSync(log_folder, {
    recursive: true
});

const logger = winston.createLogger({
    level: 'silly',
    format: winston.format.combine(
        utilFormatter(),
        winston.format((info) => {
            // eslint-disable-next-line no-param-reassign
            info.level = info.level.toUpperCase();
            if (info.stack) {
                if (info[Symbol.for("splat")]) {
                    const errorMessage = info[Symbol.for("splat")][0].message;
                    info.message = info.message.replace(errorMessage, "");
                }
                info.message = info.message.replace(`\n${info.stack}`, "");
            }
            return info;
        })(),
        winston.format.errors({
            stack: true
        }),
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.prettyPrint()
    ),
    defaultMeta: {
        service: 'general-log'
    },
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.File({
            filename: path.resolve(log_folder, 'error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.resolve(log_folder, 'combined.log'),
            level: 'info'
        })
    ],
    exceptionHandlers: [
        new winston.transports.File({
            filename: path.resolve(log_folder, 'exceptions.log')
        })
    ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//


if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        handleExceptions: true,
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.splat(),
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.printf((info) => {
                if (info.message.constructor === Object) {
                    info.message = JSON.stringify(info.message, null, 4);
                }
                if (info.stack) {
                    return `[${info.timestamp}] [${info.service}] ${info.level}: ${info.message}\n\u001b[31m${info.stack}\u001b[39m`;
                }
                return `[${info.timestamp}] [${info.service}] ${info.level}: ${info.message}`;
            }),

        )
    }));
    logger.add(new winston.transports.File({
        filename: path.resolve(log_folder, 'debug.log'),
        level: 'debug'
    }));
}

module.exports = logger;
