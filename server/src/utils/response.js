class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode  = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json(data);
};

const paginatedResponse = (res, { data, page, limit, total }) => {
  return res.json({
    data,
    pagination: {
      page:  parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

module.exports = { AppError, successResponse, paginatedResponse };
