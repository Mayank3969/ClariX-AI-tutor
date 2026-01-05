
import { ref, uploadBytes, getDownloadURL, uploadString, StringFormat } from "firebase/storage";
import { storage } from "../firebaseConfig";

/**
 * Service to manage Cloud Storage interactions.
 * Enforces folder structure policies:
 * - /user-content: Publicly readable user assets (avatars).
 * - /code-snapshots: Historical versions of user code.
 */
export const StorageManager = {
  
  /**
   * Uploads a user's profile picture.
   * Path: user-content/{userId}/profile_{timestamp}
   */
  async uploadProfilePicture(userId: string, file: File): Promise<string> {
    try {
      // Create a unique path to avoid caching issues with same filenames
      const path = `user-content/${userId}/profile_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      
      // Upload
      const snapshot = await uploadBytes(storageRef, file);
      
      // Return public URL
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw new Error("Upload failed");
    }
  },

  /**
   * Uploads a text snapshot of the user's code history.
   * Path: code-snapshots/{userId}/{problemId}/{timestamp}.txt
   */
  async uploadCodeSnapshot(userId: string, problemId: string, code: string): Promise<string> {
    try {
      const timestamp = new Date().toISOString();
      const path = `code-snapshots/${userId}/${problemId}/${timestamp}.txt`;
      const storageRef = ref(storage, path);
      
      // Upload raw string
      await uploadString(storageRef, code, StringFormat.RAW);
      
      // Return the internal storage path (not download URL, as these are usually private/on-demand)
      return path;
    } catch (error) {
      console.error("Error archiving code snapshot:", error);
      throw new Error("Snapshot archival failed");
    }
  },

  /**
   * Retrieves the download URL for a given storage path.
   */
  async getDownloadUrl(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error("Error fetching download URL:", error);
      throw error;
    }
  }
};
