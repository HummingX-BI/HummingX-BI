const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'No autenticado. Inicia sesión para continuar.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesión expirada. Inicia sesión nuevamente.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

const requireAdminOrNfcOperator = (req, res, next) => {
  const role = req.user && req.user.role ? String(req.user.role).toLowerCase() : '';
  if (role !== 'admin' && role !== 'nfc_operator') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador u operador NFC.' });
  }
  next();
};

module.exports = { authenticate, requireAdmin, requireAdminOrNfcOperator };

