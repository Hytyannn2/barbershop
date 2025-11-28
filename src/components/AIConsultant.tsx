import React, { useState } from 'react';
import { getStyleRecommendation } from '../services/geminiService';
import { Button } from './Button';
import { Sparkles, User, Loader2 } from 'lucide-react';

export const AIConsultant: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ face: '', texture: '', desc: '' });
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const recommendation = await getStyleRecommendation(form.desc, form.face, form.texture);
    setResult(recommendation);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-500/10 text-gold-500 text-xs font-bold uppercase tracking-wider mb-4 border border-gold-500/20">
          <Sparkles size={12} /> Beta Feature
        </span>
        <h2 className="text-4xl font-serif text-white mb-4">What's your style?</h2>
        <p className="text-zinc-400 max-w-lg mx-auto">
          Not sure what to tell the barber? Let our AI suggest a cut based on your face shape.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        <form onSubmit={handleSubmit} className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 space-y-6">
           <div>
             <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Face Shape</label>
             <select 
               className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-gold-500 outline-none"
               value={form.face}
               onChange={e => setForm({...form, face: e.target.value})}
               required
             >
               <option value="">Select Shape...</option>
               <option value="Oval">Oval</option>
               <option value="Square">Square</option>
               <option value="Round">Round</option>
               <option value="Diamond">Diamond</option>
             </select>
           </div>
           
           <div>
             <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Hair Texture</label>
             <select 
               className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-gold-500 outline-none"
               value={form.texture}
               onChange={e => setForm({...form, texture: e.target.value})}
               required
             >
               <option value="">Select Texture...</option>
               <option value="Straight">Straight</option>
               <option value="Wavy">Wavy</option>
               <option value="Curly">Curly</option>
             </select>
           </div>

           <div>
             <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Vibe / Notes</label>
             <textarea 
               className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-gold-500 outline-none h-32 resize-none"
               placeholder="I want something clean for my internship interview..."
               value={form.desc}
               onChange={e => setForm({...form, desc: e.target.value})}
             />
           </div>

           <Button type="submit" fullWidth disabled={loading}>
             {loading ? <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={16}/> Thinking...</span> : "Generate Style"}
           </Button>
        </form>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 relative overflow-hidden flex flex-col justify-center min-h-[300px]">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <User size={150} />
           </div>
           
           {result ? (
             <div className="relative z-10 animate-fadeIn">
                <h3 className="text-gold-500 font-serif text-xl mb-4 flex items-center gap-2">
                  <Sparkles size={20} /> Recommended Look
                </h3>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-line text-lg">
                  {result}
                </p>
                <div className="mt-8 pt-8 border-t border-zinc-800">
                  <p className="text-zinc-500 text-xs italic">Tip: Show this message to Abang Barber.</p>
                </div>
             </div>
           ) : (
             <div className="text-center text-zinc-600 relative z-10">
               <Sparkles className="mx-auto mb-4 opacity-20" size={48} />
               <p>Fill out the form to get an instant recommendation.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};