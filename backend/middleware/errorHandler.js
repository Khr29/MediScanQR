const errorHandler = (err, req, res, next) => {
  // Full stack trace goes to the server log only - never to the client,
  // in any environment. There's no legitimate reason for an API response to
  // include internal file paths and call stacks.
  console.error("❌ Global Server Error:", err.stack);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return res.status(statusCode).json({
    message: err.message || "Internal Server Error",
  });
};

module.exports = errorHandler;