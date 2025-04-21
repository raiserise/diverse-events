import { getFirestore, updateDoc, doc, arrayUnion } from "firebase/firestore";

export class InviteBase {
    constructor(eventId, eventTitle) {
      this.eventId = eventId;
      this.eventTitle = eventTitle;  // Store eventTitle here
    }
  
    async invite(user) {
      if (!user || !user.id) {
        throw new Error("Invalid user object.");
      }
      const db = getFirestore();
      await updateDoc(doc(db, "events", this.eventId), {
        invitedUsers: arrayUnion(user.id),
      });
    }
  }