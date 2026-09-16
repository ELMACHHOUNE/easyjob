import mongoose from 'mongoose'

const OLD_JOB_INDEX = 'userId_1_source_1_sourceId_1'

export async function fixJobOfferIndexes() {
  try {
    const db = mongoose.connection.db
    if (!db) return

    const collection = db.collection('joboffers')
    const indexes = await collection.indexes()
    const oldIndex = indexes.find(i => i.name === OLD_JOB_INDEX)

    if (oldIndex) {
      await collection.dropIndex(OLD_JOB_INDEX)
      console.log('🧹 Ancien index unique supprimé (userId_1_source_1_sourceId_1)')
    }

    await mongoose.model('JobOffer').createIndexes()
  } catch (err) {
    console.error('Migration index JobOffer échouée:', err.message)
  }
}
