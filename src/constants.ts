import type { Barber, Service } from './types';

export const COLLEGES = [
  "Kolej Ibrahim Yaakub (KIY)",
  "Kolej Dato' Onn (KDO)",
  "Kolej Aminuddin Baki (KAB)",
  "Kolej Ungku Omar (KUO)",
  "Kolej Burhanuddin Helmi (KBH)",
  "Kolej Rahim Kajai (KRK)",
  "Kolej Ibu Zain (KIZ)",
  "Kolej Keris Mas (KKM)",
  "Kolej Tun Hussein Onn (KTHO)",
  "Kolej Pendeta Za'ba (KPZ)"
];

export const SERVICES: Service[] = [
  {
    id: 'kpz_walkin',
    name: 'KPZ Walk-in (My Block)',
    price: 13,
    durationMin: 30
  },
  {
    id: 'house_call',
    name: 'House Call (Your Kolej)',
    price: 15,
    durationMin: 45
  }
];

// Default fallback barber
export const BARBERS: Barber[] = [
  {
    id: 'harith',
    name: 'Harith',
    specialty: 'Fade, Taper & Mullet',
    image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=200&auto=format&fit=crop'
  }
];

export const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '20:00', '20:30', '21:00'
];

export const CANCELLATION_POLICY = {
  hours: 3,
  text: "Strict Policy: You can only cancel up to 3 hours before your slot. Late cancellations disrupt the flow for other students."
};