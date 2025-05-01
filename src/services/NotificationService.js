import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";

class NotificationService {
  constructor() {
    this.observers = [];
    this.unsubscribe = null;
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribeObserver(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notifyObservers(data) {
    this.observers.forEach((observer) => observer(data));
  }

  startListening(userId) {
    const db = getFirestore();
    const q = query(collection(db, "notifications"), where("userId", "==", userId));

    this.unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.notifyObservers(data);
    });
  }

  stopListening() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

const notificationService = new NotificationService();
export default notificationService;
