import Notification from '../models/Notification.js'
import User from '../models/User.js'
import UserProfile from '../models/UserProfile.js'
import JobOffer from '../models/JobOffer.js'

let io = null

export function setSocketIO(socketIO) {
  io = socketIO
}

function emitToUser(userId, notification) {
  if (io) {
    io.to(`user:${userId}`).emit('notification', notification)
    io.to(`user:${userId}`).emit('unread_count', { unreadCount: 1 })
  }
}

export async function createNotification({ userId, type, title, message, data, actionUrl }) {
  try {
    const notification = await Notification.create({
      userId, type, title, message, data, actionUrl
    })
    emitToUser(userId, notification)
    return notification
  } catch (err) {
    console.error('Erreur création notification:', err.message)
    return null
  }
}

export async function notifyNewJobOffer(jobOffer) {
  try {
    const profileQuery = {}
    const regexPatterns = [jobOffer.sector, jobOffer.domain].filter(Boolean)
    if (regexPatterns.length > 0) {
      profileQuery.domains = { $in: regexPatterns.map(p => new RegExp(p, 'i')) }
    }
    const profiles = await UserProfile.find(profileQuery).populate('userId')

    for (const profile of profiles) {
      const user = profile.userId
      if (!user || user.role !== 'candidat') continue

      const skills = jobOffer.requirements || []
      const userSkills = profile.skills || []
      const matchCount = skills.filter(s =>
        userSkills.some(us => us.toLowerCase().includes(s.toLowerCase()))
      ).length

      if (matchCount === 0) continue

      await createNotification({
        userId: user._id,
        type: 'nouvelle_offre',
        title: 'Nouvelle offre correspondant à votre profil',
        message: `${jobOffer.title} chez ${jobOffer.company} - ${jobOffer.location}${jobOffer.isRemote ? ' (Remote)' : ''}`,
        data: { jobOfferId: jobOffer._id, matchCount, totalSkills: skills.length },
        actionUrl: `/job-offers/${jobOffer._id}`,
      })
    }
  } catch (err) {
    console.error('Erreur notifyNewJobOffer:', err.message)
  }
}

export async function notifyApplicationStatusChange(application, oldStatus, newStatus, changedBy) {
  try {
    const jobOffer = await JobOffer.findById(application.jobOfferId)
    if (!jobOffer) return

    const statusLabels = {
      envoyee: 'Candidature envoyée',
      consulte: 'Candidature consultée',
      valide_entretien: 'Candidature validée pour entretien',
      appel_attente: 'En attente d\'appel pour entretien',
      entretien_fait: 'Entretien terminé',
      accepte_final: 'Acceptation finale',
      refusee: 'Candidature refusée',
    }

    const titles = {
      consulte: 'Votre candidature a été consultée',
      valide_entretien: 'Vous êtes retenu pour un entretien',
      appel_attente: 'En attente de planification',
      entretien_fait: 'Entretien terminé - en attente de décision',
      accepte_final: 'Félicitations ! Vous êtes accepté',
      refusee: 'Mise à jour de votre candidature',
    }

    const messages = {
      consulte: `Le recruteur a consulté votre candidature pour ${jobOffer.title} chez ${jobOffer.company}`,
      valide_entretien: `Votre profil a été retenu pour ${jobOffer.title} chez ${jobOffer.company}. Un recruteur vous contactera prochainement`,
      appel_attente: `Veuillez patienter, le recruteur va vous appeler pour planifier l'entretien pour ${jobOffer.title}`,
      entretien_fait: `L'entretien pour ${jobOffer.title} est terminé. Le recruteur étudie votre dossier`,
      accepte_final: `Félicitations ! Vous avez été accepté pour le poste ${jobOffer.title} chez ${jobOffer.company}`,
      refusee: `Votre candidature pour ${jobOffer.title} chez ${jobOffer.company} n'a pas été retenue`,
    }

    const typeMap = {
      valide_entretien: 'entretien',
      accepte_final: 'acceptation',
    }

    await createNotification({
      userId: application.userId,
      type: typeMap[newStatus] || 'candidature_statut',
      title: titles[newStatus] || statusLabels[newStatus] || `Statut mis à jour : ${newStatus}`,
      message: messages[newStatus] || `Votre candidature pour ${jobOffer.title} est maintenant : ${statusLabels[newStatus] || newStatus}`,
      data: { applicationId: application._id, jobOfferId: jobOffer._id, oldStatus, newStatus, changedBy },
      actionUrl: `/applications/${application._id}`,
    })
  } catch (err) {
    console.error('Erreur notifyApplicationStatusChange:', err.message)
  }
}

export async function notifyNewCompany(company) {
  try {
    const candidates = await User.find({ role: 'candidat' })

    for (const user of candidates) {
      await createNotification({
        userId: user._id,
        type: 'nouvelle_entreprise',
        title: 'Nouvelle entreprise disponible',
        message: `${company.companyName} a rejoint notre plateforme - ${company.sector} à ${company.city}`,
        data: { companyEmailId: company._id, companyName: company.companyName },
        actionUrl: `/company-emails`,
      })
    }
  } catch (err) {
    console.error('Erreur notifyNewCompany:', err.message)
  }
}

export async function notifyScrapingComplete(userId, results) {
  try {
    await createNotification({
      userId,
      type: 'scrapping',
      title: 'Scraping terminé',
      message: `${results.count || 0} nouvelles offres d'emploi ont été trouvées. Consultez les résultats`,
      data: { count: results.count, source: results.source, results },
      actionUrl: `/job-offers?source=${results.source || 'scraped'}`,
    })
  } catch (err) {
    console.error('Erreur notifyScrapingComplete:', err.message)
  }
}

export async function notifyNewApplicationToRecruiter(application, jobOffer) {
  try {
    const recruiter = await User.findById(jobOffer.postedBy || jobOffer.userId)
    if (!recruiter || recruiter.role !== 'recruiter') return

    await createNotification({
      userId: recruiter._id,
      type: 'nouvelle_candidature',
      title: 'Nouvelle candidature reçue',
      message: `Un candidat a postulé à votre offre ${jobOffer.title}`,
      data: { applicationId: application._id, jobOfferId: jobOffer._id },
      actionUrl: `/recruiter/applications`,
    })
  } catch (err) {
    console.error('Erreur notifyNewApplicationToRecruiter:', err.message)
  }
}

export async function notifySuggestedCandidates(recruiterId, jobOffer, candidateCount) {
  try {
    await createNotification({
      userId: recruiterId,
      type: 'candidat_suggere',
      title: 'Candidats suggérés pour votre offre',
      message: `${candidateCount} candidats correspondent à votre offre ${jobOffer.title}`,
      data: { jobOfferId: jobOffer._id, candidateCount },
      actionUrl: `/recruiter/jobs/${jobOffer._id}/candidates`,
    })
  } catch (err) {
    console.error('Erreur notifySuggestedCandidates:', err.message)
  }
}

export async function notifyEncouragement(userId) {
  const messages = [
    { title: 'Continuez vos recherches', message: 'N\'oubliez pas de consulter les nouvelles offres publiées aujourd\'hui' },
    { title: 'Astuce candidature', message: 'Personnalisez votre CV pour chaque offre pour augmenter vos chances' },
    { title: 'Restez actif', message: 'Les recruteurs consultent les profils récemment actifs. Mettez à jour votre profil' },
    { title: 'Nouveaux recruteurs', message: 'De nouvelles entreprises recherchent des profils comme le vôtre' },
    { title: 'Scraping programmé', message: 'Pensez à lancer un scraping pour découvrir plus d\'opportunités' },
    { title: 'Suivi de candidature', message: 'Relancez les recruteurs si vous n\'avez pas de retour après une semaine' },
  ]

  const msg = messages[Math.floor(Math.random() * messages.length)]

  try {
    await createNotification({
      userId,
      type: 'rappel',
      title: msg.title,
      message: msg.message,
      data: {},
      actionUrl: '/job-offers',
    })
  } catch (err) {
    console.error('Erreur notifyEncouragement:', err.message)
  }
}

export async function notifyEmailFromCompany(userId, companyName, subject) {
  try {
    await createNotification({
      userId,
      type: 'email',
      title: 'Email reçu d\'une entreprise',
      message: `${companyName} vous a envoyé un email : ${subject}`,
      data: { companyName, subject },
      actionUrl: '/applications',
    })
  } catch (err) {
    console.error('Erreur notifyEmailFromCompany:', err.message)
  }
}

export default {
  setSocketIO,
  createNotification,
  notifyNewJobOffer,
  notifyApplicationStatusChange,
  notifyNewCompany,
  notifyScrapingComplete,
  notifyNewApplicationToRecruiter,
  notifySuggestedCandidates,
  notifyEncouragement,
  notifyEmailFromCompany,
}
