import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  let token
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  } else if (req.cookies?.token) {
    token = req.cookies.token
  }
  if (!token) return res.status(401).json({ error: 'Non autorisé. Veuillez vous connecter.' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password -refreshToken -avatar')
    if (!user) return res.status(401).json({ error: 'Utilisateur non trouvé' })
    if (!user.isActive) return res.status(403).json({ error: 'Compte désactivé' })
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expiré', expired: true })
    }
    return res.status(401).json({ error: 'Token invalide' })
  }
}

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Accès non autorisé pour votre rôle' })
  }
  next()
}
