export default function notFound(req, res, next) {
  res.status(404);
  if (req.accepts('html')) return res.render('404', { url: req.originalUrl });
  if (req.accepts('json')) return res.json({ error: 'Not Found' });
  res.type('txt').send('Not Found');
}
