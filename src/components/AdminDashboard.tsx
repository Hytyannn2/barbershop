import React, { useEffect, useState } from 'react';
import { bookingService, authService } from '../services/authService';
import type { BookingState, User } from '../types.ts';
import { UserRole } from '../types.ts';
import { User as UserIcon, Clock, LogOut, Loader2, Shield, Send, Sparkles, ArchiveRestore, MapPin, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Button } from './Button';

interface AdminProps {
  onLogout: () => void;
}

type ViewMode = 'BOOKINGS' | 'USERS'; 
type FilterType = 'ALL' | 'CONFIRMED' | 'CANCELLED';

export const AdminDashboard: React.FC<AdminProps> = ({ onLogout }) => {
  const [bookings, setBookings] = useState<BookingState[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('BOOKINGS');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load User
  useEffect(() => {
    const unsubscribe = authService.observeAuthState((u) => {
      if (u) setCurrentUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Load Data
  const refreshData = async () => {
    setLoading(true);
    setError('');
    try {
      if (viewMode === 'BOOKINGS') {
        const data = await bookingService.getAllBookings();
        setBookings(data);
      } else {
        const { db } = await import('../firebase.ts'); 
        const snapshot = await db.collection('users').get();
        const users = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as User));
        setUsersList(users);
      }
    } catch (e: any) {
        console.error(e);
        setError('Failed to fetch data. ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [viewMode]);

  const getShortCollegeName = (fullName: string) => {
    if (!fullName) return '';
    const match = fullName.match(/\(([^)]+)\)/);
    return match ? match[1] : fullName.split(' ')[0];
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      alert("You cannot delete yourself!");
      return;
    }
    const confirmMsg = "WARNING: This deletes the user Profile. Proceed?";
    if (window.confirm(confirmMsg)) {
      try {
        const { db } = await import('../firebase.ts');
        await db.collection('users').doc(userId).delete();
        alert("User profile deleted.");
        refreshData();
      } catch (e) {
        alert("Failed to delete user.");
      }
    }
  }

  // --- NEW: SECURE PROMOTION SYSTEM ---
  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    if (userId === currentUser?.id) {
       alert("You cannot change your own role here.");
       return;
    }
    
    try {
       const { db } = await import('../firebase.ts');
       await db.collection('users').doc(userId).update({ role: newRole });
       alert(`User role updated to ${newRole}`);
       refreshData();
    } catch (e) {
       console.error(e);
       alert("Failed to update role.");
    }
  };

  // --- Auto-Hide Logic ---
  const isBookingRelevant = (b: BookingState) => {
    if (!b.date || !b.time) return true;
    const currentYear = new Date().getFullYear();
    const dateStr = `${b.date} ${currentYear} ${b.time}`;
    const bookingTime = new Date(dateStr).getTime();
    if (isNaN(bookingTime)) return true;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (bookingTime > now) return true;
    if ((now - bookingTime) < oneDay) return true;
    return false;
  };

  const relevantBookings = bookings.filter(isBookingRelevant);
  const filteredBookings = relevantBookings.filter(b => {
    if (filter === 'ALL') return true;
    if (filter === 'CANCELLED') return b.status === 'cancelled';
    return b.status === 'confirmed' || !b.status;
  });

const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <Shield className={isSuperAdmin ? "text-red-500" : "text-gold-500"} />
             <h2 className="text-xl font-serif font-bold text-white">
               {isSuperAdmin ? "BOSS Mode" : "Staff Mode"}
             </h2>
          </div>
          <Button variant="outline" onClick={onLogout} className="text-xs px-4 py-2 gap-2">
             <LogOut size={14} /> Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 animate-fadeIn">
        
        {isSuperAdmin && (
           <div className="mb-12 bg-red-900/10 border border-red-900/30 rounded-2xl p-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 mb-2">
                   <UserIcon className="text-red-500" />
                   <h3 className="text-xl font-serif text-white">Super Admin Panel</h3>
                </div>
                {viewMode === 'USERS' && (
                  <button onClick={() => setViewMode('BOOKINGS')} className="text-zinc-400 hover:text-white flex items-center gap-1 text-sm">
                    <X size={16} /> Close User List
                  </button>
                )}
              </div>
              
              {viewMode === 'BOOKINGS' ? (
                 <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <p className="text-zinc-400 text-sm flex-1">
                       Manage staff and students. Securely promote admins here.
                    </p>
                    <div className="flex gap-4">
                       <Button 
                         variant="outline" 
                         className="text-xs py-2 bg-zinc-900 border-red-900/50 text-red-400 hover:bg-red-900/20"
                         onClick={() => setViewMode('USERS')}
                       >
                         Manage Users & Staff
                       </Button>
                    </div>
                 </div>
              ) : (
                 <p className="text-zinc-500 text-sm italic">Showing registered database...</p>
              )}
           </div>
        )}

        {viewMode === 'USERS' && isSuperAdmin && (
           <div className="animate-fadeIn">
              <h2 className="text-2xl font-serif text-white mb-6">User Database</h2>
              {loading ? <Loader2 className="animate-spin text-gold-500" /> : (
                <div className="grid gap-4">
                   {usersList.map(u => (
                      <div key={u.id} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                                ${u.role === UserRole.SUPER_ADMIN ? 'bg-red-500 text-white' : 
                                  u.role === UserRole.ADMIN ? 'bg-gold-500 text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                               {u.name?.[0] || '?'}
                            </div>
                            <div>
                               <div className="flex items-center gap-2">
                                  <h4 className="text-white font-bold">{u.name}</h4>
                                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${u.role === UserRole.ADMIN ? 'bg-gold-500/20 text-gold-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                    {u.role}
                                  </span>
                               </div>
                               <p className="text-zinc-500 text-sm">{u.email}</p>
                               <div className="flex gap-3 mt-1 text-xs text-zinc-500">
                                  {u.college && (
                                     <span className={`flex items-center gap-1 ${u.college.includes('KPZ') ? 'text-gold-500 font-bold' : ''}`}>
                                       <MapPin size={10}/> 
                                       {getShortCollegeName(u.college)}
                                       {u.college.includes('KPZ') ? ' 👑' : ''}
                                     </span>
                                  )}
                                  <span className="flex items-center gap-1 text-blue-400"><Send size={10}/> {u.telegram || '-'}</span>
                               </div>
                            </div>
                         </div>
                         
                         {/* Action Buttons */}
                         <div className="flex items-center gap-2">
                            {u.role === UserRole.STUDENT && (
                                <Button 
                                    variant="outline" 
                                    className="text-xs py-2 border-gold-500/30 text-gold-500 hover:bg-gold-500/10 gap-1"
                                    onClick={() => handleUpdateRole(u.id, UserRole.ADMIN)}
                                >
                                    <ArrowUpCircle size={14}/> Make Admin
                                </Button>
                            )}
                            {u.role === UserRole.ADMIN && (
                                <Button 
                                    variant="outline" 
                                    className="text-xs py-2 border-zinc-700 text-zinc-400 hover:text-white gap-1"
                                    onClick={() => handleUpdateRole(u.id, UserRole.STUDENT)}
                                >
                                    <ArrowDownCircle size={14}/> Revoke Admin
                                </Button>
                            )}
                            <Button variant="danger" className="text-xs py-2" onClick={() => handleDeleteUser(u.id)}>
                                Delete
                            </Button>
                         </div>
                      </div>
                   ))}
                </div>
              )}
           </div>
        )}

        {viewMode === 'BOOKINGS' && (
          <div className="animate-fadeIn">
            {/* Same Booking List as before... */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                   <h1 className="text-4xl font-serif text-white">Bookings</h1>
                   <span className="bg-zinc-800 text-zinc-500 text-[10px] uppercase font-bold px-2 py-1 rounded flex items-center gap-1 border border-zinc-700">
                      <ArchiveRestore size={10} /> Auto-Clears {'>'} 24h
                   </span>
                </div>
                <p className="text-zinc-400">Showing {filteredBookings.length} active records</p>
              </div>
              
              <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
                {(['ALL', 'CONFIRMED', 'CANCELLED'] as FilterType[]).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
                      filter === f 
                        ? 'bg-gold-500 text-black shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-900/50 p-6 rounded-xl mb-6 flex items-start gap-4">
                <Shield className="text-red-500 shrink-0" size={24} />
                <div className="text-red-400">
                  <h4 className="font-bold mb-1">Access Error</h4>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold-500" size={48} /></div>
            ) : filteredBookings.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-2xl p-20 text-center">
                <Sparkles className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
                <h3 className="text-xl text-zinc-500">All clear, Boss.</h3>
                <p className="text-zinc-600 mt-2">No upcoming appointments or recent history.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredBookings.map((booking) => {
                  const isCancelled = booking.status === 'cancelled';
                  return (
                    <div 
                      key={booking.id} 
                      className={`border rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 transition-colors
                        ${isCancelled 
                          ? 'bg-zinc-950 border-zinc-800 opacity-60' 
                          : 'bg-zinc-900/50 border-zinc-800 hover:border-gold-500/50'}`
                      }
                    >
                      <div className="flex-1 flex items-center gap-6 w-full">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl shrink-0
                          ${isCancelled ? 'bg-zinc-800 text-zinc-600' : 'bg-gold-500/10 text-gold-500'}`}>
                          {booking.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className={`text-lg font-bold ${isCancelled ? 'text-zinc-500 line-through' : 'text-white'}`}>
                            {booking.userName}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {booking.userCollege && (
                                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold flex items-center gap-1
                                   ${booking.userCollege.includes('KPZ') ? 'bg-gold-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                                    <MapPin size={8} />
                                    {getShortCollegeName(booking.userCollege)}
                                    {booking.userCollege.includes('KPZ') ? ' 👑' : ''}
                                </span>
                            )}
                            {booking.userTelegram && (
                              <span className="flex items-center gap-1 text-blue-400 text-xs px-2 py-0.5 bg-blue-900/20 rounded border border-blue-900/30">
                                <Send size={10} /> {booking.userTelegram}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 w-full md:w-auto text-sm text-zinc-400">
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <UserIcon size={16} />
                          <span className={booking.serviceId === 'house_call' ? 'text-gold-500 font-bold' : ''}>
                            {booking.serviceId === 'house_call' ? 'House Call (RM15)' : 'Walk-in (RM13)'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 min-w-[140px]">
                          <Clock size={16} />
                          <span>{booking.date} @ {booking.time}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};