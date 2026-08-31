const errorHandler = (err, req, res, next) => {
  console.error('Error encountered:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message, errors: err.errors });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ message: 'A record with this unique constraint already exists.' });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = errorHandler;
