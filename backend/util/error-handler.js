module.exports = (err, req, res, next) => {
  const error = err.reason || err.message || "Something went wrong";
  const status = err.status || 500;
  console.error(err.stack);
  res.status(status).json({ error });
};
