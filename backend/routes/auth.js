import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import UserProfile from '../models/UserProfile.js'
import RecruiterProfile from '../models/RecruiterProfile.js'
import { generateAccessToken, generateRefreshToken, generateEmailVerificationCode, generateResetPasswordToken } from '../utils/generateToken.js'
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/sendEmail.js'
import { protect } from '../middlewares/auth.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ error: 'Un compte avec cet email existe déjà' })
    }

    const validRoles = ['candidat', 'recruiter']
    const userRole = validRoles.includes(role) ? role : 'candidat'

    const verificationCode = generateEmailVerificationCode()

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: userRole,
      isEmailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpire: new Date(Date.now() + 10 * 60 * 1000),
    })

    // If recruiter, create recruiter profile
    if (userRole === 'recruiter') {
      const { companyName, industry, companySize, companyLocation, companyWebsite, companyDescription, position, linkedinUrl } = req.body
      await RecruiterProfile.create({
        userId: user._id,
        companyName: companyName || '',
        industry: industry || '',
        companySize: companySize || '11-50',
        companyLocation: companyLocation || '',
        companyWebsite: companyWebsite || '',
        companyDescription: companyDescription || '',
        position: position || '',
        linkedinUrl: linkedinUrl || '',
      })
    } else {
      // Create empty profile for candidates
      await UserProfile.create({ userId: user._id })
    }

    const emailResult = await sendVerificationEmail(user.email, user.firstName, verificationCode)
    const emailSent = emailResult.success

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)
    user.refreshToken = refreshToken
    await user.save()

    res.status(201).json({
      message: 'Compte créé avec succès. Vérifiez votre email.',
      accessToken,
      refreshToken,
      user,
      emailSent,
      previewUrl: emailResult.previewUrl || null,
    })
  } catch (error) {
    console.error('Erreur register:', error)
    res.status(500).json({ error: 'Erreur lors de la création du compte' })
  }
})

router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body

    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerificationCode: code,
      emailVerificationExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ error: 'Code invalide ou expiré' })
    }

    user.isEmailVerified = true
    user.emailVerificationCode = undefined
    user.emailVerificationExpire = undefined
    await user.save()

    res.json({ message: 'Email vérifié avec succès' })
  } catch (error) {
    console.error('Erreur verify-email:', error)
    res.status(500).json({ error: 'Erreur lors de la vérification' })
  }
})

router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })
    if (user.isEmailVerified) return res.status(400).json({ error: 'Email déjà vérifié' })

    const verificationCode = generateEmailVerificationCode()
    user.emailVerificationCode = verificationCode
    user.emailVerificationExpire = new Date(Date.now() + 10 * 60 * 1000)
    await user.save()

    const emailResult = await sendVerificationEmail(user.email, user.firstName, verificationCode)
    res.json({ message: 'Code de vérification renvoyé', previewUrl: emailResult.previewUrl || null })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'envoi' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' })
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password')
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ error: 'Compte temporairement bloqué. Réessayez plus tard.' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      user.loginAttempts += 1
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000)
      }
      await user.save()
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    }

    user.loginAttempts = 0
    user.lockUntil = undefined
    user.lastLogin = new Date()

    const accessToken = generateAccessToken(user._id)
    const refreshToken = generateRefreshToken(user._id)
    user.refreshToken = refreshToken
    await user.save()

    res.json({
      message: 'Connexion réussie',
      accessToken,
      refreshToken,
      user,
    })
  } catch (error) {
    console.error('Erreur login:', error)
    res.status(500).json({ error: 'Erreur lors de la connexion' })
  }
})

router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token requis' })

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id)

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Refresh token invalide' })
    }

    const newAccessToken = generateAccessToken(user._id)
    const newRefreshToken = generateRefreshToken(user._id)
    user.refreshToken = newRefreshToken
    await user.save()

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
  } catch (error) {
    res.status(401).json({ error: 'Token invalide ou expiré' })
  }
})

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      return res.json({ message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' })
    }

    const resetToken = generateResetPasswordToken()
    user.resetPasswordToken = resetToken
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000)
    await user.save()

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
    await sendPasswordResetEmail(user.email, user.firstName, resetUrl)

    res.json({ message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'envoi' })
  }
})

router.post('/reset-password/:token', async (req, res) => {
  try {
    const { password } = req.body
    const { token } = req.params

    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' })
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    })

    if (!user) {
      return res.status(400).json({ error: 'Lien invalide ou expiré' })
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined
    user.refreshToken = undefined
    await user.save()

    res.json({ message: 'Mot de passe réinitialisé avec succès' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la réinitialisation' })
  }
})

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.json({ user })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.post('/logout', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null })
    res.json({ message: 'Déconnexion réussie' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la déconnexion' })
  }
})

// Update job search status
router.put('/job-search-status', protect, async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['none', 'actively_looking', 'open_to_offers', 'urgent', 'seeking_internship']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' })
    }
    const user = await User.findByIdAndUpdate(req.user._id, { jobSearchStatus: status }, { new: true })
    res.json({ user, message: 'Statut mis à jour' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
