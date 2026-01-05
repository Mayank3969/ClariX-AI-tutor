
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Configuration uses environment variables.
// Ensure these are set in your .env file.
const firebaseConfig = {
  apiKey: 
  authDomain: 
  databaseURL: 
  projectId: 
  storageBucket: 
  messagingSenderId: 
  appId: 
};

// 1. Initialize App
const app = initializeApp(firebaseConfig);

// 2. Initialize Firestore with Offline Persistence
// We use persistentLocalCache with multi-tab support to allow the app to work offline
// and synchronize data across multiple open tabs seamlessly.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// 3. Initialize Authentication
const auth = getAuth(app);

// 4. Initialize Realtime Database
// Used for low-latency features like live vote counts, presence, or chat indicators.
const rtdb = getDatabase(app);

// 5. Initialize Cloud Storage
// Buckets configured for user content and code snapshots.
const storage = getStorage(app);

// Export named instances
export { app, auth, db, rtdb, storage };
