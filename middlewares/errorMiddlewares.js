const getProdMessage = err => {
  if (err.isOperatinal) return err.message;

  console.error(err);
  if (err.name === 'CastError') {
    return `Invalid ${err.path}: ${err.value}`;
  }
  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    return `Duplicate field value: ${value}. Please use another value!`;
  }
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return `Invalid input data. ${errors.join('. ')}`;
  }
  if (err.name === 'JsonWebTokenError') {
    return 'Invalid token. Please log in again!';
  }
  if (err.name === 'TokenExpiredError') {
    return 'Your token has expired! Please log in again.';
  }

  return 'somthing went wrong!';
};

const getStatus = err => {
  let status = err.status || 'error';
  let statusCode = err.statusCode || 500;

  if (err.name.match(/(CastError|ValidationError)/) || err.code === 11000) {
    status = 'fail';
    statusCode = 400;
  } else if (err.name.match(/(JsonWebTokenError|TokenExpiredError)/)) {
    status = 'fail';
    statusCode = 401;
  }

  return { status, statusCode };
};

module.exports = (error, req, res, next) => {
  const { message, stack } = error;
  const { status, statusCode } = getStatus(error);

  const devError = { status, message, stack, error };
  const prodError = { status, message: getProdMessage(error) };

  res
    .status(statusCode)
    .json(process.env.NODE_ENV === 'development' ? devError : prodError);
};
