import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

export class NotifyDecorator {
  constructor(base) {
    this.base = base;
  }

  async invite(user) {
    if (!user || !user.id) {
      throw new Error("Invalid user object.");
    }

    await this.base.invite(user); // Call base invitation logic

    const db = getFirestore();
    await addDoc(collection(db, "notifications"), {
      relatedEventId: this.base.eventId,  // Access eventId from base
      userId: user.id,
      message: `You have been invited to the event: ${this.base.eventTitle}`,  // Access eventTitle from base
      createdAt: serverTimestamp(),
      type: "event_invite",
      read: false,
    });
  }
}