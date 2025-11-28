
import React, { useEffect, useState } from 'react';
import { bookingService, authService } from '../services/authService';
import type { BookingState } from '../types';
import { SERVICES, CANCELLATION_POLICY } from '../constants';
import { Button } from './Button';
import { Calendar, Clock, User, AlertCircle, XCircle, CheckCircle, Loader2, Hourglass, Timer } from 'lucide-react';

const CountdownTimer = ({ targetDate, onExpired }: { targetDate: string, onExpired: () => void }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const distance = target - now;

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft('Started');
        onExpired();
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        setIsUrgent(distance < 3 * 60 * 60 * 1000); // Less than 3 hours
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={`font-mono font-bold text-sm flex items-center gap-2 ${isUrgent ? 'text-red-400' : 'text-gold-500'}`}>
      <Timer size={14} className={isUrgent ? 'animate-pulse' : ''} />
      {timeLeft}
    </div>
  );
};

export const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<BookingState[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [hoursBefore, setHoursBefore] = useState<number | null>(null);

  const [user, setUser] = useState(authService.getCurrentUser());

  // Listen for user changes (in case profile wasn't fully loaded)
  useEffect(() => {
    const unsub = authService.observeAuthState((u) => {
        if (u) setUser(u);
    });
    return () => unsub();
  }, []);

  const loadData = async () => {
    if (user && user.id) {
      setLoading(true);
      const data = await bookingService.getUserBookings(user.id);
      setBookings(data);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const initiateCancel = (booking: BookingState) => {
    const currentYear = new Date().getFullYear();
    const dateStr = `${booking.date} ${currentYear} ${booking.time}`;
    const bookingTime = new Date(dateStr).getTime();
    const now = Date.now();
    const diffHours = (bookingTime - now) / (1000 * 60 * 60);

    setHoursBefore(diffHours);
    setConfirmCancelId(booking.id!);
  };

  const confirmCancellation = async () => {
    if (confirmCancelId) {
       const result = await bookingService.cancelBooking(confirmCancelId);
       if (result.success) {
         setConfirmCancelId(null);
         loadData();
       } else {
         alert(result.message);
       }
    }
  };

  const getServiceName = (id: string) => SERVICES.find(s => s.id === id)?.name || id;

  const getFullDateString = (date: string, time: string) => {
     const currentYear = new Date().getFullYear();
     return `${date} ${currentYear} ${time}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fadeIn relative">
      
      {/* Custom Confirmation Modal */}
      {confirmCancelId && hoursBefore !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-slideUp">
              <h3 className="text-xl font-serif text-white mb-2">Cancel Appointment?</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Your appointment is in <span className="text-gold-500 font-bold">{hoursBefore.toFixed(1)} hours</span>. 
                Are you sure you want to give up your slot?
              </p>
              
              <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-4 mb-6">
                 <p className="text-red-400 text-xs font-bold uppercase mb-1">Warning</p>
                 <p className="text-red-300 text-sm">Action cannot be undone. You will lose your slot.</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => setConfirmCancelId(null)}>Keep Booking</Button>
                <Button variant="danger" fullWidth onClick={confirmCancellation}>Confirm Cancel</Button>
              </div>
           </div>
        </div>
      )}

      <div className="mb-12">
        <h1 className="text-4xl font-serif text-white mb-4">My Appointments</h1>
        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl flex items-start gap-4">
          <AlertCircle className="text-gold-500 shrink-0 mt-1" />
          <div>
            <h4 className="text-gold-500 font-bold text-sm uppercase tracking-wide mb-1">Cancellation Policy (3 Hours)</h4>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {CANCELLATION_POLICY.text}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
         <div className="flex justify-center py-20"><Loader2 className="animate-spin text-white" size={32}/></div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <Calendar className="mx-auto text-zinc-700 mb-4" size={48} />
          <h3 className="text-zinc-500 text-xl font-serif">No appointments found</h3>
          <p className="text-zinc-600 mt-2">Time to get fresh! Book a cut now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const isCancelled = booking.status === 'cancelled';
            const canCancel = bookingService.checkCancellationPolicy(booking);
            const targetDateStr = getFullDateString(booking.date!, booking.time!);

            return (
              <div 
                key={booking.id} 
                className={`relative border rounded-xl p-6 transition-all ${
                  isCancelled 
                    ? 'bg-zinc-950/30 border-zinc-800 opacity-60' 
                    : 'bg-zinc-900/50 border-zinc-700 hover:border-gold-500/30'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between md:justify-start gap-6 mb-2">
                       {isCancelled ? (
                         <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-900/30 text-red-500 text-xs font-bold uppercase tracking-wider">
                           <XCircle size={12} /> Cancelled
                         </span>
                       ) : (
                         <>
                           <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-900/30 text-green-500 text-xs font-bold uppercase tracking-wider">
                             <CheckCircle size={12} /> Confirmed
                           </span>
                           {/* Countdown Timer */}
                           <div className="bg-black/50 px-3 py-0.5 rounded-full border border-zinc-800">
                              <CountdownTimer targetDate={targetDateStr} onExpired={() => {}} />
                           </div>
                         </>
                       )}
                       
                    </div>
                    
                    <h3 className={`text-xl font-bold mb-1 ${isCancelled ? 'text-zinc-500 line-through' : 'text-white'}`}>
                      {getServiceName(booking.serviceId)}
                    </h3>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mt-3">
                      <span className="flex items-center gap-2"><Calendar size={14}/> {booking.date}</span>
                      <span className="flex items-center gap-2"><Clock size={14}/> {booking.time}</span>
                      <span className="flex items-center gap-2"><User size={14}/> Haji Manap</span>
                      <span className="flex items-center gap-2 text-zinc-500">#{booking.id?.slice(-6)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isCancelled && (
                    <div className="md:border-l md:border-zinc-800 md:pl-6 flex flex-col items-end gap-2">
                      <Button 
                        variant="danger" 
                        onClick={() => initiateCancel(booking)}
                        disabled={!canCancel}
                        className="text-xs py-2 px-4 whitespace-nowrap"
                      >
                        {canCancel ? "Cancel Booking" : "Too Late to Cancel"}
                      </Button>
                      {!canCancel && (
                         <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                           <Hourglass size={10}/> Within 3 hours
                         </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
