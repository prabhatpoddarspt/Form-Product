import { createLogger, transports, format } from "winston";

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: `./src/logs/${new Date().toDateString().split(" ").join("-")}.log`,
      json: false,
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

export default logger;
