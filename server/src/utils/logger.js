const log = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  // Never log passwords, tokens, or sensitive health data
  const sanitizedMeta = { ...meta };
  delete sanitizedMeta.password;
  delete sanitizedMeta.token;
  delete sanitizedMeta.authorization;

  const metaStr = Object.keys(sanitizedMeta).length ? JSON.stringify(sanitizedMeta) : '';
  console.log(`[${timestamp}] [${level.toUpperCase()}]: ${message} ${metaStr}`);
};

module.exports = {
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta)
};
