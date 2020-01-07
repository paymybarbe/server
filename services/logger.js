const winston = require("winston");
const path = require("path");
const fs = require("fs");
const config = require("../config/config");

config.config();

const log_folder = (process.env.NODE_ENV === "production") ? path.resolve(process.env.BIN_FOLDER, "../logs/") : path.resolve(process.env.BIN_FOLDER, "./logs/");
fs.mkdirSync(log_folder, {
    recursive: true
});


const logger = winston.createLogger({
    level: 'silly',
    format: winston.format.combine(
        winston.format((info) => {
            // eslint-disable-next-line no-param-reassign
            info.level = info.level.toUpperCase();
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
            filename: 'exceptions.log'
        })
    ]
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//


if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.splat(),
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.printf((info) => {
                if (info.stack) {
                    return `[${info.timestamp}] [${info.service}] ${info.level}: ${info.message}\n${info.stack}`;
                }
                console.log(info);
                return `[${info.timestamp}] [${info.service}] ${info.level}: ${info.message}`;
            }),

        )
    }));
    logger.add(new winston.transports.File({
        filename: path.resolve(log_folder, 'debug.log'),
        level: 'debug'
    }));
}

logger.error("Trying to show an error.", new Error("This be an error"));
