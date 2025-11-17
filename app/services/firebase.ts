// app/Services/Firebase.ts

import admin from 'firebase-admin'
import serviceAccount from '../../config/serviceAccountKey.json' assert { type: 'json' }

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
})

export default admin
