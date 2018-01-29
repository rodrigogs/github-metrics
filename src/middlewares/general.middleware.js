const GeneralMiddleware = () => (req, res, next) => {
  res.locals.current_url = req.originalUrl;

  next();
};

module.exports = GeneralMiddleware;
