const { ZodError } = require('zod');

/**
 * Zod validation middleware.
 * The schema should be a z.object({ body?, query?, params? }).
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body:   req.body,
        query:  req.query,
        params: req.params,
      });

      if (parsed.body   !== undefined) req.body   = parsed.body;
      if (parsed.query  !== undefined) req.query  = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(e => ({
          field:   e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({ error: 'Validation failed', details: errors });
      }
      next(error);
    }
  };
};

module.exports = { validate };
