import { db } from './config/firebase.js'

async function resetAllUsers() {
  if (!db) {
    console.error("Firebase db is mock/offline or not configured. Cannot reset.")
    process.exit(1)
  }
  try {
    const usersCollection = db.collection('users')
    const snapshot = await usersCollection.get()
    
    if (snapshot.empty) {
      console.log('No user documents found in Firestore.')
      process.exit(0)
    }

    const batch = db.batch()
    snapshot.docs.forEach(doc => {
      console.log(`Resetting user document: ${doc.id}`)
      batch.update(doc.ref, {
        completedChapters: [],
        progress: 0
      })
    })

    await batch.commit()
    console.log(`Successfully reset progress and completedChapters for ${snapshot.size} user(s).`)
    process.exit(0)
  } catch (err) {
    console.error('Error resetting users:', err)
    process.exit(1)
  }
}

resetAllUsers()
