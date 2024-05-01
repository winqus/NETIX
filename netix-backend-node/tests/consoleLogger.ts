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

const filterOnly = (level: string) =>
  format((info) => {
    if (info.level === level) {
      return info;
    }

    return false;
  })();

const errorFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf((info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`),
  format.colorize({ all: true })
);

const debugFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf((info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`),
  format.colorize({ all: true })
);

const otherFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf((info) => `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`)
);

const transports = [
  new winston.transports.Console({
    level: 'error',
    format: format.combine(filterOnly('error'), errorFormat),
  }),
  new winston.transports.Console({
    level: 'warn',
    format: format.combine(filterOnly('warn'), otherFormat),
  }),
  new winston.transports.Console({
    level: 'info',
    format: format.combine(filterOnly('info'), otherFormat),
  }),
  new winston.transports.Console({
    level: 'http',
    format: format.combine(filterOnly('http'), otherFormat),
  }),
  new winston.transports.Console({
    level: 'verbose',
    format: format.combine(filterOnly('verbose'), otherFormat),
  }),
  new winston.transports.Console({
    level: 'debug',
    format: format.combine(filterOnly('debug'), debugFormat),
  }),
  new winston.transports.Console({
    level: 'silly',
    format: format.combine(filterOnly('silly'), otherFormat),
  }),
];

const consoleLogger = winston.createLogger({
  levels: levels,
  level: 'debug',
  transports: transports,
  exitOnError: false,
});

winston.addColors(colors);

export function logError(message: any) {
  consoleLogger.error(message);
}

export default consoleLogger;
