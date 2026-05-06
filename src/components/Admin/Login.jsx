import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Lock, Phone, Loader2, ArrowLeft, ShieldPlus, ArrowRight } from 'lucide-react';

const AdminLogin = ({ onBack }) => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('setup') === 'owner') {
      setIsSetupMode(true);
    }
  }, []);

    const handleLogin = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validate inputs
      if (phone.length !== 10) {
        setError('Phone number must be exactly 10 digits.');
        setLoading(false);
        return;
      }
      if (pin.length < 6) {
        setError('PIN must be at least 6 digits for security.');
        setLoading(false);
        return;
      }

      const ownerEmail = `${phone}@mamta-varieties.com`;

      const { error } = await supabase.auth.signInWithPassword({
        email: ownerEmail,
        password: pin,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setError("Incorrect Phone or PIN. Access Denied.");
        } else {
          setError(error.message);
        }
      }
      setLoading(false);
    };

    const handleSignup = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validate inputs
      if (phone.length !== 10) {
        setError('Phone number must be exactly 10 digits.');
        setLoading(false);
        return;
      }
      if (pin.length < 6) {
        setError('PIN must be at least 6 digits for security.');
        setLoading(false);
        return;
      }

      const ownerEmail = `${phone}@mamta-varieties.com`;
      const { data, error } = await supabase.auth.signUp({
        email: ownerEmail,
        password: pin,
        options: {
          data: {
            role: 'owner',
            phone: phone
          }
        }
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess("Owner account created successfully! You can now login.");
        // Switch back to login mode after a short delay
        setTimeout(() => setIsSetupMode(false), 2000);
      }
      setLoading(false);
    };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans text-left relative overflow-hidden">
      {/* Background Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 md:top-12 md:left-12 flex items-center gap-2 text-dark/40 hover:text-accent transition-colors font-mono text-xs uppercase z-10"
      >
        <ArrowLeft size={16} /> Exit to Site
      </button>

      <div className="w-full max-w-md bg-white border border-dark/10 rounded-[3rem] p-8 md:p-12 shadow-2xl relative z-10">
        <div className="flex flex-col gap-4 mb-10 text-center">
          <div className="mx-auto w-16 h-16 bg-accent/10 rounded-3xl flex items-center justify-center mb-2">
            {isSetupMode ? <ShieldPlus className="text-accent" size={32} /> : <Lock className="text-accent" size={32} />}
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            {isSetupMode ? 'Owner' : 'Owner'} <span className="text-accent italic font-drama lowercase">{isSetupMode ? 'Setup' : 'Access'}.</span>
          </h1>
          <p className="text-dark/40 font-mono text-[10px] uppercase tracking-[0.4em]">
            {isSetupMode ? 'Initialize System Admin' : 'Digital Terminal v1.1'}
          </p>
        </div>

        <form onSubmit={isSetupMode ? handleSignup : handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase text-dark/40 ml-4 font-bold tracking-widest">Phone Number</label>
            <div className="relative flex items-center bg-dark/5 rounded-2xl overflow-hidden border border-transparent focus-within:border-accent/30 transition-colors">
              <div className="pl-4 flex items-center gap-2 text-dark/40 font-mono text-sm border-r border-dark/10 pr-3 h-full py-5 bg-dark/[0.02]">
                <Phone size={14} />
                <span className="font-bold">+91</span>
              </div>
              <input 
                type="tel" required placeholder="00000 00000"
                maxLength={10}
                className="flex-1 bg-transparent border-none p-5 font-sans font-bold text-lg tracking-widest focus:ring-0"
                value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase text-dark/40 ml-4 font-bold tracking-widest">Secret Access PIN</label>
            <div className="relative text-left flex items-center bg-dark/5 rounded-2xl overflow-hidden border border-transparent focus-within:border-accent/30 transition-colors">
              <div className="pl-4 pr-3 py-5 border-r border-dark/10 bg-dark/[0.02]">
                <Lock className="text-dark/20" size={18} />
              </div>
              <input 
                type="password" required placeholder="••••••"
                className="w-full bg-transparent border-none p-5 font-sans font-bold text-lg tracking-[0.5em] focus:ring-0"
                value={pin} onChange={(e) => setPin(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-[10px] font-mono border border-red-100 uppercase text-center tracking-wider animate-shake">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-2xl text-[10px] font-mono border border-green-100 uppercase text-center tracking-wider">
              {success}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="bg-dark text-primary py-5 rounded-full font-bold uppercase text-xs tracking-[0.3em] hover:bg-accent hover:text-white transition-all duration-500 shadow-xl shadow-dark/10 flex items-center justify-center gap-4 mt-4 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                {isSetupMode ? "Create Account" : "Unlock Dashboard"}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center flex flex-col gap-4">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-dark/5 rounded-full">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
            <span className="text-[8px] font-mono text-dark/30 uppercase tracking-[0.3em]">
              {isSetupMode ? 'Setup Protocol Active' : 'System Operational'}
            </span>
          </div>
          
          {!isSetupMode && (
            <p className="text-[10px] font-mono text-dark/20 uppercase tracking-widest leading-relaxed">
              Contact system admin if you forgot <br /> your access credentials.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;

