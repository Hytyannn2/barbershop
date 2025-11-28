import React, { useState, useRef } from 'react';
import { authService } from '../services/authService.ts'; // Added .ts
import { Button } from './Button.tsx'; // Added .tsx
import { Scissors, User, Lock, Loader2, Send, Phone, MapPin, Smile } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore'; // Import modular firestore functions
import { db } from '../firebase.ts'; // Import db instance

// Defined locally so it works immediately without editing constants.ts
const COLLEGES = [
  'Kolej Pendeta Za\'aba (KPZ)',
  'Kolej Tun Syed Nasir (KTSN)',
  'Kolej Keris Mas (KKM)',
  'Kolej Ibu Zain (KIZ)',
  'Kolej Tun Hussein Onn (KTHO)',
  'Kolej Tun Dr. Ismail (KTDI)',
  'Kolej Burhanuddin Helmi (KBH)',
  'Kolej Aminuddin Baki (KAB)',
  'Kolej Dato Onn (KDO)',
  'Kolej Rahim Kajai (KRK)',
  'Kolej Ungku Omar (KUO)'
];

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [id, setId] = useState('');
  const [nickname, setNickname] = useState(''); 
  const [password, setPassword] = useState('');
  const [telegram, setTelegram] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Refs for focus management
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    if (!id || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (isSignUp && (!telegram || !phone || !college || !nickname)) {
        setError('Please fill in all details for registration.');
        setLoading(false);
        return;
    }

    // Client-side validation for password length
    if (isSignUp && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    try {
      let user;
      if (isSignUp) {
        // 1. Create the user using the existing service
        user = await authService.signup(id, password, telegram, phone, college);
        
        // 2. OVERWRITE the name with the chosen Nickname using Modular Firebase Syntax
        try {
          const userRef = doc(db, 'users', user.id);
          await updateDoc(userRef, {
            name: nickname.toUpperCase() 
          });
          // Update local user object to reflect the change immediately
          user.name = nickname.toUpperCase();
        } catch (updateErr) {
          console.error("Failed to update nickname", updateErr);
        }

      } else {
        user = await authService.login(id, password);
      }
      onLoginSuccess(user);
    } catch (err: any) {
      console.error(err);
      let msg = "Authentication failed";
      
      // Detailed Error Mapping
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
          msg = isSignUp ? "Failed to create account." : "Incorrect username or password.";
      }
      if (err.code === 'auth/email-already-in-use') {
          msg = "Account already exists! Please switch to Login.";
      }
      if (err.code === 'auth/weak-password') {
          msg = "Password is too weak (min 6 characters).";
      }
      if (err.code === 'auth/user-not-found') {
          msg = "Account does not exist. Please Sign Up first.";
      }
      if (err.code === 'auth/network-request-failed') {
          msg = "Network error. Check your connection.";
      }
      if (err.code === 'permission-denied') {
          msg = "Database access denied. Please contact admin.";
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleIdKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordInputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-zinc-950">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-ukm-red/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-gold-500/5 rounded-full blur-[100px]" />

      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 p-8 rounded-2xl shadow-2xl z-10 animate-slideUp my-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-ukm-red to-red-900 text-white mb-4 shadow-lg shadow-red-900/30 border border-gold-500/20">
            <Scissors size={28} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">Haji Manap</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-gold-500/50"></span>
            <p className="text-gold-500 text-xs font-bold tracking-widest uppercase">Barbershop</p>
            <span className="h-px w-8 bg-gold-500/50"></span>
          </div>
          <p className="text-zinc-500 text-xs mt-2">Kolej Pendeta Za'aba (KPZ)</p>
        </div>

        <form className="space-y-4">
          
          {/* USERNAME FIELD */}
          <div>
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
              Username / Student ID
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-gold-500 transition-colors">
                <User size={18} />
              </div>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                onKeyDown={handleIdKeyDown}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3.5 text-white placeholder-zinc-600 focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-all outline-none"
                placeholder="A123456"
                autoFocus
              />
            </div>
          </div>

          {/* PASSWORD FIELD */}
          <div className="animate-fadeIn">
            <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-gold-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                ref={passwordInputRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !isSignUp && handleSubmit(e)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3.5 text-white placeholder-zinc-600 focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-all outline-none"
                placeholder="Password"
              />
            </div>
            {isSignUp && password.length > 0 && password.length < 6 && (
                <p className="text-ukm-red text-xs mt-1 ml-1 animate-fadeIn">Must be at least 6 characters</p>
            )}
          </div>

          {isSignUp && (
            <div className="space-y-4 animate-fadeIn">
               {/* NEW: NICKNAME FIELD */}
               <div>
                 <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                   Name / Nickname
                 </label>
                 <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-gold-500 transition-colors">
                     <Smile size={18} />
                   </div>
                   <input
                     type="text"
                     value={nickname}
                     onChange={(e) => setNickname(e.target.value)}
                     className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3.5 text-white placeholder-zinc-600 focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-all outline-none"
                     placeholder="e.g. Manap"
                   />
                 </div>
               </div>

               {/* Telegram */}
               <div>
                 <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                   Telegram ID
                 </label>
                 <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-gold-500 transition-colors">
                     <Send size={18} />
                   </div>
                   <input
                     type="text"
                     value={telegram}
                     onChange={(e) => setTelegram(e.target.value)}
                     className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3.5 text-white placeholder-zinc-600 focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-all outline-none"
                     placeholder="@username"
                   />
                 </div>
               </div>

               {/* Phone */}
               <div>
                 <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                   Phone Number
                 </label>
                 <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-gold-500 transition-colors">
                     <Phone size={18} />
                   </div>
                   <input
                     type="text"
                     value={phone}
                     onChange={(e) => setPhone(e.target.value)}
                     className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3.5 text-white placeholder-zinc-600 focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-all outline-none"
                     placeholder="012-3456789"
                   />
                 </div>
               </div>

               {/* College */}
               <div>
                 <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                   College (Kolej)
                 </label>
                 <div className="relative group">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-gold-500 transition-colors">
                     <MapPin size={18} />
                   </div>
                   <select
                     value={college}
                     onChange={(e) => setCollege(e.target.value)}
                     className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-10 pr-4 py-3.5 text-white placeholder-zinc-600 focus:ring-1 focus:ring-gold-500 focus:border-gold-500 transition-all outline-none appearance-none"
                   >
                     <option value="">Select College...</option>
                     {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>
               </div>
            </div>
          )}

          {error && <p className="text-red-400 text-sm text-center animate-fadeIn font-medium bg-red-900/10 py-3 rounded-lg border border-red-900/30">{error}</p>}

          <Button 
            type="button" 
            onClick={(e) => handleSubmit(e)} 
            fullWidth 
            className="mt-6 py-4 text-base bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-black font-bold shadow-lg shadow-gold-900/20 border-none"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mx-auto"/> : (isSignUp ? 'Create Account' : 'Login')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            {isSignUp ? "Already have an account? Login" : "New user? Create an account"}
          </button>
        </div>
      </div>
    </div>
  );
};