import express from 'express'
import Notification from '../models/Notification.js'
import { protect } from '../middlewares/auth.js'
import { createNotification } from '../services/NotificationService.js'

const router = express.Router()

router.get('/', protect, async (req, res) => {
  try {
    const { type, unreadOnly, page = 1, limit = 50 } = req.query
    const query = { userId: req.user._id }
    if (type) query.type = type
    if (unreadOnly === 'true') query.isRead = false

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Notification.countDocuments(query),
      Notification.countDocuments({ userId: req.user._id, isRead: false }),
    ])

    res.json({ notifications, total, unreadCount, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.post('/', protect, async (req, res) => {
  try {
    const { type, title, message, data, actionUrl } = req.body
    if (!type || !title || !message) {
      return res.status(400).json({ error: 'type, title et message requis' })
    }

    const notification = await createNotification({
      userId: req.user._id,
      type,
      title,
      message,
      data,
      actionUrl,
    })

    res.status(201).json({ notification, message: 'Notification créée' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true })
    res.json({ message: 'Toutes les notifications marquées comme lues' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.put('/:id/read', protect, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    )
    if (!notif) return res.status(404).json({ error: 'Notification non trouvée' })
    res.json({ notification: notif })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.delete('/:id', protect, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    res.json({ message: 'Notification supprimée' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
