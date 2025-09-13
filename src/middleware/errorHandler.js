export default function errorHandler(err, req, res, next) {
  console.error('❌', err);
  res.status(err.status || 500);
  const message = process.env.NODE_ENV === 'production' ? 'Server error' : err.message || err;
  if (req.accepts('html')) return res.render('error', { message });
  res.json({ error: message });
}
