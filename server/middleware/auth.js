import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'inkdabba_jwt_secret_token_key_2026_production_vault'

/**
 * Authentication middleware:
 * Verifies Bearer token from Authorization header and attaches
 * req.userId and req.userRole to the request object.
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'No authorization token provided. Format: Authorization: Bearer <token>',
    })
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Token is missing from Authorization header',
    })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.id
    req.userRole = decoded.role
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      details: err.message,
    })
  }
}

/**
 * Optional role-guard middleware for admin-only operations
 */
export function requireAdmin(req, res, next) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied: administrator privileges required',
    })
  }
  next()
}

export default authMiddleware
