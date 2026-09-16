import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './models/User.js'

dotenv.config()

const NEW_PASSWORD = '123456789'

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connexion MongoDB OK')

    const users = await User.find()

    if (users.length === 0) {
      console.log('Aucun utilisateur trouvé en base.')
    } else {
      console.log(`\n=== UTILISATEURS TROUVÉS (${users.length}) ===`)
      for (const u of users) console.log(`  - ${u.email} (${u.role})`)

      for (const user of users) {
        user.password = NEW_PASSWORD
        await user.save()
        console.log(`✔ ${user.email} — mot de passe réinitialisé`)
      }

      console.log(`\n✅ ${users.length} utilisateur(s) mis à jour. Nouveau mot de passe : ${NEW_PASSWORD}`)
    }

    await mongoose.disconnect()
  } catch (err) {
    console.error('Erreur:', err.message)
    process.exit(1)
  }
}

run()
