import morgan from 'morgan';
import logger from '../logger/logger.js';

logger.stream = {
  write: (message) =>
    logger.info(
      `\n**********************REQUEST_STARTED*********************\n${message.substring(0, message.lastIndexOf('\n'))}`
    ),
};

export default morgan(
  ':method :url :status :response-time ms - :res[content-length]',
  { stream: logger.stream }
);
