import cron from 'node-cron'
import User from '../models/User.js'
import Application from '../models/Application.js'
import { notifyEncouragement, createNotification } from './NotificationService.js'

export function startNotificationCron() {
  cron.schedule('0 9 * * 1,3,5', async () => {
    console.log('⏰ Cron: Envoi des encouragements...')
    try {
      const candidates = await User.find({ role: 'candidat' })
      for (const user of candidates) {
        await notifyEncouragement(user._id)
      }
      console.log(`✅ ${candidates.length} encouragements envoyés`)
    } catch (err) {
      console.error('❌ Erreur cron encouragements:', err.message)
    }
  })

  cron.schedule('0 10 * * 1', async () => {
    console.log('⏰ Cron: Vérification des candidatures sans suivi...')
    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const staleApps = await Application.find({
        status: { $in: ['envoyee', 'consulte'] },
        updatedAt: { $lt: oneWeekAgo }
      }).populate('jobOfferId')

      for (const app of staleApps) {
        await createNotification({
          userId: app.userId,
          type: 'rappel',
          title: 'Relance suggérée',
          message: `Votre candidature pour ${app.jobOfferId?.title || 'une offre'} n'a pas eu de mise à jour depuis une semaine. Pensez à relancer le recruteur`,
          data: { applicationId: app._id },
          actionUrl: `/applications/${app._id}`,
        })
      }
      console.log(`✅ ${staleApps.length} relances suggérées`)
    } catch (err) {
      console.error('❌ Erreur cron relances:', err.message)
    }
  })

  console.log('⏰ Cron notifications démarré')
}
