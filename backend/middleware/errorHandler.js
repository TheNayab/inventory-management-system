const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const error = {
    message: err.message || 'Server Error',
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({ success: false, error: error.message });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error.message = `${field} already exists`;
    return res.status(400).json({ success: false, error: error.message });
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    error.message = 'Invalid ID format';
    return res.status(400).json({ success: false, error: error.message });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: error.message,
  });
};

module.exports = errorHandler;
