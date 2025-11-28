export const UserRole = {
  STUDENT: 'STUDENT',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: string;
  name: string;
  email?: string;
  telegram?: string;
  role: UserRole; // This will now correctly use the new UserRole type
  phone?: string;
  college?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMin: number;
}

export interface Barber {
  id: string;
  name: string;
  specialty: string;
  image: string;
}

export interface BookingState {
  id?: string;
  userId: string;
  userName: string;
  userTelegram?: string;
  userPhone?: string;
  userCollege?: string;
  serviceId: string;
  barberId: string | null;
  date: string | null;
  time: string | null;
  status: 'confirmed' | 'cancelled';
  createdAt: number;
  price?: number;
}

export const ViewState = {
  LOGIN: 'LOGIN',
  HOME: 'HOME',
  BOOKING: 'BOOKING',
  MY_BOOKINGS: 'MY_BOOKINGS',
  CONSULTANT: 'CONSULTANT',
  ADMIN_DASHBOARD: 'ADMIN_DASHBOARD',
} as const;

export type ViewState = typeof ViewState[keyof typeof ViewState];