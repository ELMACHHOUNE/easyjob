import jwt from 'jsonwebtoken'
import crypto from 'crypto'

export const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '15m' })
}

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export const generateEmailVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const generateResetPasswordToken = () => {
  return crypto.randomBytes(32).toString('hex')
}
