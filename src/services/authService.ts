import { auth, db } from "../firebase";
import { UserRole } from "../types"; // Importing from our fixed types
import type { User } from "../types";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc
} from "firebase/firestore";

const STORAGE_KEYS = { USER: 'ukm_barber_user' };

export const authService = {
  // Listen for login changes
  observeAuthState: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userData: any = {};
        try {
           const docRef = doc(db, "users", firebaseUser.uid);
           const userDoc = await getDoc(docRef);
           if (userDoc.exists()) {
             userData = userDoc.data();
           }
        } catch (e) {
          console.error("Error fetching user profile", e);
        }

        const user: User = {
          id: firebaseUser.uid,
          name: userData.name || firebaseUser.email?.split('@')[0].toUpperCase() || 'STUDENT',
          email: firebaseUser.email || '',
          telegram: userData.telegram || '',
          role: userData.role || UserRole.STUDENT,
          phone: userData.phone,
          college: userData.college
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  login: async (email: string, pass: string) => {
    const finalEmail = email.includes('@') ? email : `${email}@student.ukm.my`;
    const res = await signInWithEmailAndPassword(auth, finalEmail, pass);
    
    // We need to fetch the full user profile to get their name
    const docRef = doc(db, "users", res.user.uid);
    const snap = await getDoc(docRef);
    const data = snap.exists() ? snap.data() : {};

    const user: User = {
        id: res.user.uid,
        name: data.name || 'User',
        role: data.role || UserRole.STUDENT,
        email: res.user.email || '',
        college: data.college,
        telegram: data.telegram
    };
    return user;
  },

  signup: async (email: string, pass: string, telegram: string, phone: string, college: string) => {
    const finalEmail = email.includes('@') ? email : `${email}@student.ukm.my`;
    const name = finalEmail.split('@')[0].toUpperCase();
    
    const res = await createUserWithEmailAndPassword(auth, finalEmail, pass);
    
    let role: UserRole = UserRole.STUDENT; // Type of 'role' explicitly set to the union type 'UserRole'
    if (telegram.toUpperCase() === 'BOSS_MANAP') role = UserRole.SUPER_ADMIN;
    else if (telegram.toUpperCase() === 'STAFF_MANAP') role = UserRole.ADMIN;

    // Create DB entry
    await setDoc(doc(db, "users", res.user.uid), {
        name,
        email: finalEmail,
        telegram,
        phone,
        college,
        role,
        createdAt: Date.now()
    });

    return { id: res.user.uid, name, role } as User;
  },

  logout: async () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    await signOut(auth);
  },

  getCurrentUser: (): User | null => {
      // Basic fallback
      if(auth.currentUser) return { id: auth.currentUser.uid, role: UserRole.STUDENT } as any;
      return null;
  }
};

// Also export the Booking Logic (App.tsx doesn't use it, but Wizard does)
import { collection, addDoc, getDocs, updateDoc, deleteDoc, where, query } from "firebase/firestore";
import type { BookingState } from "../types";
import { CANCELLATION_POLICY } from "../constants";

export const bookingService = {
    getAllBookings: async () => {
        const snap = await getDocs(collection(db, "bookings"));
        return snap.docs.map(d => ({id: d.id, ...d.data()})) as BookingState[];
    },
    saveBooking: async (b: BookingState) => {
        const ref = await addDoc(collection(db, "bookings"), b);
        return { ...b, id: ref.id };
    },
    getUserBookings: async (userId: string) => {
        const q = query(collection(db, "bookings"), where("userId", "==", userId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({id: d.id, ...d.data()})) as BookingState[];
    },
    deleteBooking: async (id: string) => {
        await deleteDoc(doc(db, "bookings", id));
    },
    cancelBooking: async (id: string) => {
        await updateDoc(doc(db, "bookings", id), { status: 'cancelled' });
        return { success: true, message: "Cancelled" };
    },
    checkCancellationPolicy: (booking: BookingState): boolean => {
      if (!booking.date || !booking.time) return false;
      const currentYear = new Date().getFullYear();
      const dateStr = `${booking.date} ${currentYear} ${booking.time}`;
      const bookingTime = new Date(dateStr).getTime();
      const diffHours = (bookingTime - Date.now()) / (1000 * 60 * 60);
      return diffHours >= (CANCELLATION_POLICY?.hours || 3);
    }
};