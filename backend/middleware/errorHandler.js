// Univerzální error handling middleware
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({ msg: 'Nastala neočekávaná chyba na serveru.' });
}

module.exports = errorHandler;
