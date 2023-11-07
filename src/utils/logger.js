require("dotenv").config();
const winston = require("winston");
const path = require("path");
const fs = require("fs");

const logsDir = path.resolve(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir);
}

// Функция, которая будет добавлять стек вызовов, если STACK_TRACE === true
// работает не так как ожидалось, выводит стек вызовов функций логгера, а не функций основного кода, как при ошибке
const addStackTraceIfEnabled = winston.format((info) => {
	if (process.env.TOTAL_STACK_TRACE === "true") {
		info.stack = new Error().stack;
	}
	return info;
});

const timestamp = winston.format((info) => {
	const now = new Date();
	info.logTimestamp = `[${now.toLocaleDateString()} | ${now.toLocaleTimeString()}]`;
	return info;
});

const alignLevels = (level) => {
	// тут + 2 в конце, потому что без него оно крашится с ошибкой, что длины не хватило на строке maxLenght - level.length, типа длина отрицательная (-2)
	const maxLength = Math.max(...Object.keys(winston.config.npm.levels).map(key => key.length + 2));
	const spaces = ' '.repeat(maxLength - level.length);
	return `${level.toUpperCase()}${spaces}`;
};

const customLevelsFormat = winston.format((info) => {
	info.level = alignLevels(`[${info.level.toUpperCase()}]`);
	return info;
});

const logger = winston.createLogger({
	format: winston.format.combine(
		timestamp(),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		winston.format.prettyPrint(),
		winston.format.printf((info) => {
			return `${info.level} ${info.logTimestamp} ${info.message}`;
		}),
		addStackTraceIfEnabled(),
	),
	defaultMeta: { service: process.env.SERVICE_NAME },
	transports: [
		new winston.transports.File({
			filename: path.join(logsDir, "error.log"),
			level: "error",
			format: winston.format.combine(
				winston.format.timestamp({
					format: "YYYY-MM-DD HH:mm:ss",
				}),
				winston.format.errors({ stack: true }),
				winston.format.splat(),
				winston.format.prettyPrint(),
				winston.format.json(),
				addStackTraceIfEnabled(),
			),
		}),
		new winston.transports.File({
			filename: path.join(logsDir, "combined.log"),
			format: winston.format.combine(
				winston.format.timestamp({
					format: "YYYY-MM-DD HH:mm:ss",
				}),
				winston.format.errors({ stack: true }),
				winston.format.splat(),
				winston.format.prettyPrint(),
				winston.format.json(),
				addStackTraceIfEnabled(),
			),
		}),
		new winston.transports.Console({
			format: winston.format.combine(
				customLevelsFormat(),
				winston.format.colorize(),
				winston.format.splat(),
				winston.format.prettyPrint(),
				winston.format.simple(),
				winston.format.printf((info) => {
					return `${info.level} ${info.logTimestamp} ${info.message}`;
				}),
				addStackTraceIfEnabled(),
			),
		}),
	],
});

if (process.env.RUN_MODE === "PROD") {
	logger.level = process.env.PROD_LOGGER_LEVEL || "info";
}

if (process.env.RUN_MODE !== "PROD") {
	if (process.env.RUN_MODE === "DEV") {
		logger.level = process.env.DEV_LOGGER_LEVEL || "debug";
	}
}

logger.exceptions.handle(
	new winston.transports.File({
		filename: path.join(logsDir, "error.log"),
		format: winston.format.combine(
			winston.format.timestamp({
				format: "YYYY-MM-DD HH:mm:ss",
			}),
			winston.format.errors({ stack: true }),
			winston.format.prettyPrint(),
			winston.format.json(),
			addStackTraceIfEnabled(),
		),
	}),
	new winston.transports.Console({
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.prettyPrint(),
			winston.format.simple(),
			winston.format.printf((info) => {
				return `${info.level} ${info.logTimestamp} ${info.message}`;
			}),
			addStackTraceIfEnabled(),
		),
	}),
);

module.exports = logger;
