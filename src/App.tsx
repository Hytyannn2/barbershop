
import React, { useState, useEffect } from 'react';
import { ViewState, UserRole } from './types';
import type { User } from './types.ts';
import { authService } from './services/authService';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { BookingWizard } from './components/BookingWizard';
import { AIConsultant } from './components/AIConsultant';
import { MyBookings } from './components/MyBookings';
import { Button } from './components/Button';
import { Scissors, Menu, X, LogOut, Instagram } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.LOGIN);
  const [menuOpen, setMenuOpen] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.observeAuthState((u) => {
      setUser(u);
      if (u) {
        setView(currentView => {
           // Redirect Admins to dashboard on login
           if (currentView === ViewState.LOGIN) {
             const isAdmin = u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN;
             return isAdmin ? ViewState.ADMIN_DASHBOARD : ViewState.HOME;
           }
           return currentView;
        });
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    const isAdmin = u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN;
    setView(isAdmin ? ViewState.ADMIN_DASHBOARD : ViewState.HOME);
  };

  const logout = async () => {
    setUser(null);
    setView(ViewState.LOGIN);
    setMenuOpen(false);
    await authService.logout();
  };

  if (initializing) return <div className="min-h-screen bg-black flex items-center justify-center text-gold-500">Loading...</div>;

  if (view === ViewState.LOGIN) return <Login onLoginSuccess={handleLogin} />;
  
  if (!user) return <Login onLoginSuccess={handleLogin} />;

  if (view === ViewState.ADMIN_DASHBOARD) return <AdminDashboard onLogout={logout} />;

  return (
    <div className="min-h-screen flex flex-col bg-black selection:bg-gold-500 selection:text-black">
      <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView(ViewState.HOME)}>
             <div className="w-8 h-8 bg-gradient-to-br from-gold-500 to-gold-700 rounded flex items-center justify-center text-black shadow-lg shadow-gold-900/20"><Scissors size={18} /></div>
             <span className="font-serif font-bold text-lg text-white tracking-wide">HAJI MANAP</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => setView(ViewState.HOME)} className={`text-sm font-medium hover:text-white transition-colors ${view === ViewState.HOME ? 'text-white' : 'text-zinc-400'}`}>Home</button>
            <button onClick={() => setView(ViewState.MY_BOOKINGS)} className={`text-sm font-medium hover:text-white transition-colors ${view === ViewState.MY_BOOKINGS ? 'text-white' : 'text-zinc-400'}`}>My Bookings</button>
            <button onClick={() => setView(ViewState.CONSULTANT)} className={`text-sm font-medium hover:text-white transition-colors ${view === ViewState.CONSULTANT ? 'text-white' : 'text-zinc-400'}`}>AI Stylist</button>
            <div className="h-4 w-px bg-zinc-800"></div>
            <span className="text-zinc-500 text-sm">Hi, {user?.name}</span>
            <button onClick={logout} className="text-zinc-500 hover:text-white"><LogOut size={18}/></button>
          </div>

          <button className="md:hidden text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-zinc-950 border-t border-zinc-900 p-6 flex flex-col gap-4">
             <button onClick={() => { setView(ViewState.HOME); setMenuOpen(false); }} className="text-left text-zinc-300 py-2">Home</button>
             <button onClick={() => { setView(ViewState.MY_BOOKINGS); setMenuOpen(false); }} className="text-left text-zinc-300 py-2">My Bookings</button>
             <button onClick={() => { setView(ViewState.CONSULTANT); setMenuOpen(false); }} className="text-left text-zinc-300 py-2">AI Stylist</button>
             <button onClick={logout} className="text-left text-red-500 py-2">Logout</button>
          </div>
        )}
      </nav>

      <main className="flex-grow pt-20">
        {view === ViewState.HOME && (
          <>
            <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                  <img src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-50" />
               </div>
               
               <div className="relative z-20 text-center max-w-3xl px-6 animate-fadeIn">
                  <span className="inline-block py-1 px-3 border border-gold-500/50 text-gold-500 rounded-full text-xs font-bold uppercase tracking-widest mb-6 bg-gold-500/10">
                    Kolej Pendeta Za'aba (KPZ)
                  </span>
                  <h1 className="text-5xl md:text-7xl font-serif text-white font-medium leading-tight mb-8">
                    Haji Manap<br/>Barbershop
                  </h1>
                  <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto">
                    Premium cuts for KPZ residents. Walk-in to my block or book a house call. 
                    Look sharp for class, stay fresh for leisure.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => setView(ViewState.BOOKING)} className="py-4 px-10 text-lg bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-black border-none">Book Cut</Button>
                    <Button onClick={() => setView(ViewState.CONSULTANT)} variant="outline" className="py-4 px-10 text-lg border-zinc-700">AI Consultation</Button>
                  </div>
               </div>
            </section>

            <section className="py-20 px-6 bg-zinc-950">
               <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 text-center md:text-left">
                  <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                     <h3 className="text-gold-500 font-bold text-xl mb-2 font-serif">KPZ Special</h3>
                     <p className="text-zinc-400">Walk-in to my block for only <strong className="text-white">RM13</strong>. Exclusive for KPZ residents.</p>
                  </div>
                  <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                     <h3 className="text-gold-500 font-bold text-xl mb-2 font-serif">House Call</h3>
                     <p className="text-zinc-400">Too lazy to walk? I'll come to your college for <strong className="text-white">RM15</strong>.</p>
                  </div>
                  <div className="p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                     <h3 className="text-gold-500 font-bold text-xl mb-2 font-serif">Premium Tools</h3>
                     <p className="text-zinc-400">Clean fades, sharp tapers, and high-quality equipment.</p>
                  </div>
               </div>
            </section>
          </>
        )}

        {view === ViewState.BOOKING && (
          <div className="py-12 px-4">
             <BookingWizard 
               onComplete={() => setView(ViewState.MY_BOOKINGS)} 
               onCancel={() => setView(ViewState.HOME)} 
             />
          </div>
        )}

        {view === ViewState.MY_BOOKINGS && <MyBookings />}

        {view === ViewState.CONSULTANT && <AIConsultant />}
      </main>

      <footer className="border-t border-zinc-900 py-12 px-6 bg-black text-center">
         <div className="flex justify-center items-center gap-2 text-white font-serif font-bold text-xl mb-4">
            HAJI MANAP
         </div>
         <p className="text-zinc-600 text-sm">© 2024 Haji Manap Barbershop. Kolej Pendeta Za'aba.</p>
      </footer>
    </div>
  );
};

export default App;
