import log from 'electron-log/main'

log.initialize();

log.transports.file.level = 'info';

log.info('Logger initialized');

export default log;
