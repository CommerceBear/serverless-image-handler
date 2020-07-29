const winston = require('winston');
const { PapertrailTransport } = require('@commercebear/winston-papertrail-transport');

const {
  PAPERTRAIL_HOST,
  PAPERTRAIL_PORT,
} = process.env;

const SERVICE = 'image-resizer';
const LEVEL = Symbol.for('level');

const transports = [
  new winston.transports.Console(),
];

function formatMeta(meta) {
  const newInfoString = JSON.stringify(meta);
  if (meta === '{}') {
    return '';
  }
  return ` ${newInfoString}`;
}

function logFormat({
  level,
  message,
  timestamp,
  service,
  stack,
  [LEVEL]: rawLevel,
  ...meta
}) {
  const time = timestamp;
  const spaces = ' '.repeat('verbose'.length - rawLevel.length + 1);
  const object = formatMeta(meta);
  const stackText = stack ? `\n${stack}` : '';
  return `${time} ${level}${spaces}${service} | ${message}${object}${stackText}`;
}

if (PAPERTRAIL_HOST && PAPERTRAIL_PORT) {
  transports.push(new PapertrailTransport({
    levels: {
      silly: 7,
      debug: 7,
      verbose: 6,
      http: 6,
      info: 6,
      warn: 4,
      error: 3,
    },
    host: PAPERTRAIL_HOST,
    port: PAPERTRAIL_PORT,
    program: SERVICE,
    colorize: true,
  }));
}

module.exports = winston.createLogger({
  level: 'http',
  format: winston.format.combine(
    winston.format.colorize({
      colors: {
        silly: 'magenta',
        debug: 'magenta',
        verbose: 'blue',
        http: 'blue',
        info: 'green',
        warn: 'yellow',
        error: 'red',
      },
    }),
    winston.format.errors({ stack: true }),
    winston.format.timestamp(),
    winston.format.printf(logFormat),
  ),
  defaultMeta: {
    service: SERVICE,
  },
  transports,
});
