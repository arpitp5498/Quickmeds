const mongoose = require('mongoose');
const { AsyncLocalStorage } = require('node:async_hooks');

mongoose.set('transactionAsyncLocalStorage', true);
const pendingEffects = new AsyncLocalStorage();

function afterCommit(effect) {
  const effects = pendingEffects.getStore();
  if (effects) effects.push(effect);
  else effect();
}

// Mongoose propagates the session to queries and saves in this async context.
// Delay the HTTP response and realtime messages until the successful attempt commits.
function transactional(handler) {
  return async (req, res, next) => {
    try {
      const result = await mongoose.connection.transaction(async () => {
        const effects = [];
        const reply = {
          status(code) { this.code = code; return this; },
          json(body) { return { code: this.code, body, effects }; }
        };
        return pendingEffects.run(effects, () => handler(req, reply, err => { throw err; }));
      });
      for (const effect of result.effects) effect();
      return res.status(result.code).json(result.body);
    } catch (err) { return next(err); }
  };
}
module.exports = { transactional, afterCommit };
