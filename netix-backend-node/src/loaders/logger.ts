import morgan, { StreamOptions } from 'morgan';
import winston, { format } from 'winston';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'white',
  silly: 'grey',
};

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';

  return isDevelopment ? 'debug' : 'warn';
};

const filterOnly = (level: string) =>
  format((info) => {
    if (info.level === level) {
      return info;
    }

    return false;
  })();

winston.addColors(colors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`)
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`)
);

const transports = [
  new winston.transports.Console({
    level: level(),
    format: consoleFormat,
    handleExceptions: true,
  }),
  new winston.transports.File({
    filename: `./logs/error/error.log`,
    level: 'error',
    format: format.combine(filterOnly('error'), fileFormat),
    maxsize: 5242880, // 5 MB
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: `./logs/warn/warn.log`,
    level: 'warn',
    format: format.combine(filterOnly('warn'), fileFormat),
    maxsize: 5242880, // 5 MB
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: `./logs/info/info.log`,
    level: 'info',
    format: format.combine(filterOnly('info'), fileFormat),
    maxsize: 5242880, // 5 MB
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: `./logs/http/http.log`,
    level: 'http',
    format: format.combine(filterOnly('http'), fileFormat),
    maxsize: 5242880, // 5 MB
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: `./logs/all/globalAll.log`,
    level: 'silly',
    format: fileFormat,
    maxsize: 5242880, // 5 MB
    maxFiles: 10,
  }),
];

const wLoggerInstance = winston.createLogger({
  levels: levels,
  level: level(),
  transports: transports,
  exitOnError: false,
});

const stream: StreamOptions = {
  write: (message) => wLoggerInstance.http(message.trimEnd()),
};
const morganFormat = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';

  return isDevelopment ? 'short' : 'combined';
};

const morganMiddleware = morgan(morganFormat(), { stream });

export { morganMiddleware, wLoggerInstance };
