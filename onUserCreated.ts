
import { onUserCreated } from "firebase-functions/v2/auth";
import * as admin from "firebase-admin";

// Initialize Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Triggered when a new user is created in Firebase Auth.
 * Handles the initial setup of the Firestore user document.
 */
export const onUserCreatedHandler = onUserCreated(async (event) => {
  const user = event.data;

  if (!user) {
    console.error("No user data provided in auth event.");
    return;
  }

  // Requirement: If the user is Anonymous, do not create a permanent Firestore document.
  // providerData is empty for anonymous users.
  if (!user.providerData || user.providerData.length === 0) {
    console.log(`User ${user.uid} is anonymous. Skipping Firestore initialization.`);
    return;
  }

  // Double check if the user is using Google (as requested)
  const isGoogleUser = user.providerData.some(
    (provider) => provider.providerId === "google.com"
  );

  if (!isGoogleUser) {
    console.log(`User ${user.uid} signed in with a non-Google provider. Skipping.`);
    return;
  }

  const db = admin.firestore();
  const userRef = db.collection("users").doc(user.uid);

  try {
    // Check if document already exists to avoid overwriting during edge cases
    const doc = await userRef.get();
    if (doc.exists) {
      console.log(`Firestore document already exists for user ${user.uid}.`);
      return;
    }

    // Default values as requested by user
    const newUserProfile = {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || "Clarix Learner",
      photoURL: user.photoURL || null,
      eduLevel: null, // default: null
      targetRole: "SDE", // default: 'SDE'
      preferredLanguage: "C++", // default: 'C++'
      reputation: 0,
      expertise: "Beginner",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActive: admin.firestore.FieldValue.serverTimestamp(),
    };

    await userRef.set(newUserProfile);
    console.log(`Successfully initialized profile for user: ${user.uid}`);
  } catch (error) {
    console.error("Error creating user profile in Firestore:", error);
  }
});
