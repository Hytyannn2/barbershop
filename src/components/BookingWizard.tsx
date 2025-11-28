
import React, { useState } from 'react';
import { BARBERS, SERVICES, TIME_SLOTS } from '../constants';
import type { BookingState } from '../types';
import { bookingService, authService } from '../services/authService';
import { Button } from './Button';
import { Check, ChevronLeft, ChevronRight, Calendar, User as UserIcon, Scissors, Loader2, MapPin } from 'lucide-react';

interface WizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const BookingWizard: React.FC<WizardProps> = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const currentUser = authService.getCurrentUser();
  
  const [booking, setBooking] = useState<Partial<BookingState>>({
    serviceId: SERVICES[0].id,
    barberId: BARBERS[0].id, // Default to Haji Manap
    date: null,
    time: null,
  });

  const confirmBooking = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      await bookingService.saveBooking({
        ...booking,
        userId: currentUser.id,
        userName: currentUser.name,
        userTelegram: currentUser.telegram || '', // Fix: Ensure undefined becomes empty string
        status: 'confirmed',
      } as BookingState);
      onComplete();
    } catch (error: any) {
      console.error("Failed to book", error);
      if (error.code === 'permission-denied') {
         alert("Database Error: Permission Denied.\n\nAdmin: Go to Firebase Console > Firestore Database > Rules and set 'allow read, write: if true;'");
      } else {
         alert("Failed to process booking. Check internet connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderServiceSelection = () => (
    <div className="animate-fadeIn">
      <h3 className="text-2xl font-serif text-white mb-6">Choose Service</h3>
      <div className="grid gap-4">
        {SERVICES.map(service => (
          <div 
            key={service.id}
            onClick={() => setBooking({ ...booking, serviceId: service.id })}
            className={`cursor-pointer group relative overflow-hidden rounded-xl border-2 transition-all p-6 flex items-center justify-between
              ${booking.serviceId === service.id ? 'bg-zinc-900 border-gold-500' : 'bg-black border-zinc-800 hover:border-zinc-600'}`}
          >
            <div className="flex items-center gap-4">
               <div className={`p-3 rounded-full ${booking.serviceId === service.id ? 'bg-gold-500/10 text-gold-500' : 'bg-zinc-900 text-zinc-500'}`}>
                 <Scissors size={24} />
               </div>
               <div>
                  <h4 className="text-white font-bold text-lg">{service.name}</h4>
                  <p className="text-zinc-500 text-sm flex items-center gap-1">
                    <MapPin size={12} /> {service.id === 'kpz_walkin' ? 'Kolej Pendeta Za\'aba' : 'Your Kolej (Outside KPZ)'}
                  </p>
               </div>
            </div>
            
            <div className="text-right">
              <span className="block text-2xl font-serif font-bold text-gold-500">RM{service.price}</span>
              <span className="text-zinc-600 text-xs">{service.durationMin} mins</span>
            </div>
            
            {booking.serviceId === service.id && (
              <div className="absolute top-2 right-2 text-gold-500">
                <Check size={16} />
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 flex items-center gap-4">
        <img src={BARBERS[0].image} alt="Haji Manap" className="w-12 h-12 rounded-full object-cover border border-gold-500" />
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-wide">Your Barber</p>
          <p className="text-white font-bold">Haji Manap</p>
        </div>
      </div>
    </div>
  );

  const renderTimeSelection = () => {
    // Generate next 3 days
    const dates = Array.from({ length: 3 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i); // Start from today
      return d;
    });

    return (
      <div className="animate-fadeIn space-y-8">
        <div>
          <h3 className="text-xl font-serif text-white mb-4">Select Date</h3>
          <div className="flex gap-3">
            {dates.map((date) => {
              const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
              const isSelected = booking.date === dateStr;
              return (
                <button
                  key={dateStr}
                  onClick={() => setBooking({ ...booking, date: dateStr, time: null })}
                  className={`flex-1 p-4 rounded-xl border-2 transition-all text-center
                    ${isSelected ? 'bg-zinc-900 border-gold-500 text-white' : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
                >
                  <span className="block text-sm uppercase font-bold text-zinc-500">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="block text-2xl font-serif font-bold">{date.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {booking.date && (
          <div>
             <h3 className="text-xl font-serif text-white mb-4">Select Time</h3>
             <div className="grid grid-cols-4 gap-3">
               {TIME_SLOTS.map(time => (
                 <button
                   key={time}
                   onClick={() => setBooking({ ...booking, time })}
                   className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all
                     ${booking.time === time ? 'bg-gold-500 text-black border-gold-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}
                 >
                   {time}
                 </button>
               ))}
             </div>
          </div>
        )}
      </div>
    );
  };

  const renderConfirmation = () => {
    const service = SERVICES.find(s => s.id === booking.serviceId);
    return (
      <div className="animate-fadeIn">
         <h3 className="text-2xl font-serif text-white mb-6">Booking Summary</h3>
         <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gold-500/10 text-gold-500 rounded-lg"><Scissors size={20} /></div>
                <div>
                  <p className="text-zinc-400 text-xs uppercase tracking-wide">Service</p>
                  <p className="text-white font-bold">{service?.name}</p>
                </div>
              </div>
              <p className="text-xl font-serif text-gold-500">RM{service?.price}</p>
            </div>
  
            <div className="flex items-center gap-4">
               <div className="p-2 bg-zinc-800 text-zinc-400 rounded-lg"><UserIcon size={20} /></div>
               <div>
                  <p className="text-zinc-400 text-xs uppercase tracking-wide">Barber</p>
                  <p className="text-white font-bold">Haji Manap</p>
               </div>
            </div>
  
            <div className="flex items-center gap-4">
               <div className="p-2 bg-zinc-800 text-zinc-400 rounded-lg"><Calendar size={20} /></div>
               <div>
                  <p className="text-zinc-400 text-xs uppercase tracking-wide">Appointment</p>
                  <p className="text-white font-bold">{booking.date} at {booking.time}</p>
               </div>
            </div>
         </div>
         <p className="text-center text-zinc-500 text-xs mt-6 bg-red-900/10 p-3 rounded-lg border border-red-900/20 text-red-400">
           Cancellation Policy: Minimum 3 hours before appointment.
         </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative">
      <button onClick={onCancel} className="absolute top-6 right-6 text-zinc-600 hover:text-white transition-colors">✕</button>
      
      {/* Steps Indicator */}
      <div className="flex gap-2 mb-10">
        {[1, 2, 3].map(i => (
           <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-gold-500' : 'bg-zinc-800'}`} />
        ))}
      </div>

      <div className="min-h-[400px]">
        {step === 1 && renderServiceSelection()}
        {step === 2 && renderTimeSelection()}
        {step === 3 && renderConfirmation()}
      </div>

      <div className="flex justify-between mt-8 pt-6 border-t border-zinc-900">
        {step > 1 ? (
          <Button variant="outline" onClick={() => setStep(s => s - 1)} className="px-6">Back</Button>
        ) : <div />}
        
        {step < 3 ? (
          <Button 
            disabled={step === 1 ? !booking.serviceId : (!booking.date || !booking.time)}
            onClick={() => setStep(s => s + 1)}
            className="bg-white text-black hover:bg-zinc-200"
          >
            Next Step
          </Button>
        ) : (
          <Button onClick={confirmBooking} disabled={loading} className="bg-gradient-to-r from-gold-600 to-gold-500 text-black hover:from-gold-500 hover:to-gold-400 shadow-gold-900/20">
             {loading ? <Loader2 className="animate-spin" size={18}/> : "Confirm Booking"}
          </Button>
        )}
      </div>
    </div>
  );
};
