import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      const email = result.user.email;
      
      sessionStorage.setItem('authToken', token);

      const envToken = import.meta.env.VITE_API_TOKEN || 'Hope3-Apps-Team';
      const res = await fetch('https://h3apps-api.hope3.org/api/v1/users/?limit=10000', {
        headers: {
          'Authorization': `Bearer ${envToken}`
        }
      });
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error('Access Denied. Your account does not have administrator privileges or the role assignment failed.');
        }
        throw new Error('Failed to verify user permissions with the server.');
      }
      
      const users = await res.json();
      const userRecord = users.find((u: any) => u.user_email === email);
      
      if (!userRecord) {
        sessionStorage.removeItem('authToken');
        throw new Error('Access Denied. This email is not registered in our system.');
      }
      
      let roleStr = '';
      try {
        const roleRes = await fetch(`https://h3apps-api.hope3.org/api/v1/userroles/user/${userRecord.user_id}`, {
          headers: {
            'Authorization': `Bearer ${envToken}`
          }
        });
        if (roleRes.ok) {
          const roleData = await roleRes.json();
          if (Array.isArray(roleData) && roleData.length > 0 && roleData[0].role) {
             roleStr = Array.isArray(roleData[0].role) ? roleData[0].role.join(',').toLowerCase() : String(roleData[0].role).toLowerCase();
          }
        }
      } catch (err) {
         console.warn("Failed to fetch user roles", err);
      }
      
      roleStr = roleStr || (userRecord.role || userRecord.user_role || '').toLowerCase();
      const isAdmin = roleStr.includes('admin') || roleStr.includes('superadmin') || userRecord.is_superuser === true || userRecord.is_admin === true;
      
      if (!isAdmin) {
        sessionStorage.removeItem('authToken');
        throw new Error('Access Denied. You do not have administrator privileges.');
      }
      
      sessionStorage.setItem('userRole', roleStr);
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      sessionStorage.removeItem('authToken');
      setError(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-50">
      {/* Left Section - The Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#062A78] flex-col justify-between p-12 xl:p-20 overflow-hidden shadow-2xl shadow-blue-900/20 z-10">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2000&auto=format&fit=crop')" }}
        >
          {/* Blue Overlay to keep text readable and maintain brand identity */}
          <div className="absolute inset-0 bg-[#062A78]/50 mix-blend-multiply"></div>
          {/* Gradient to make bottom text perfectly readable */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#062A78]/95 via-[#062A78]/30 to-transparent"></div>
        </div>
        
        {/* Top Logo and Title */}
        <div className="relative z-10 flex items-center gap-4">
          <img
            src="/hope3_logo-removebg-preview.png"
            alt="Hope3 Logo"
            className="h-12 w-auto object-contain drop-shadow-md"
          />
          <h2 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">
            Hope3 Admin Portal
          </h2>
        </div>
        {/* Bottom Text */}
        <div className="relative z-10 mt-auto">
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Empowering communities through education.
          </h1>
          <p className="text-lg text-white/90 font-medium max-w-md leading-relaxed">
            A centralized platform to manage students, donors, contributions, and programs. Secure, professional, and impactful.
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col relative bg-slate-50 overflow-hidden">
        {/* Subtle decorative background blur on the right */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-bl-full blur-[100px] opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50 rounded-tr-full blur-[100px] opacity-60 pointer-events-none"></div>

        {/* Top right subtle text */}
        <div className="absolute top-8 right-8 z-20 flex items-center gap-3 text-sm font-bold text-slate-400">
          <div className="w-6 h-0.5 bg-[#062A78] rounded-full"></div>
          Admin Portal
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-12 lg:px-16 z-10 relative">
          
          {/* Main Login Card to fill the empty space */}
          <div className="w-full max-w-[420px] bg-white p-10 sm:p-12 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-300">
            
            <div className="mb-10 text-center">
              <img 
                src="/hope3_logo-removebg-preview.png" 
                alt="Hope3 Logo" 
                className="h-14 w-auto object-contain mx-auto mb-4"
              />
              <div className="inline-block px-3 py-1 bg-blue-50 text-[#062A78] rounded-full text-[10px] font-bold tracking-[0.2em] uppercase mb-6">
                Hope3 Foundation
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h2>
              <p className="text-sm text-slate-500 font-medium">Please authenticate to access the dashboard.</p>
            </div>

            {error && (
              <div className="flex items-start gap-3 text-sm text-red-700 bg-red-50 rounded-xl p-4 mb-8 border border-red-100">
                <AlertTriangle className="shrink-0 text-red-600 mt-0.5" size={18} />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full h-[54px] bg-[#062A78] hover:bg-[#05205c] rounded-xl text-[15px] font-bold text-white flex items-center justify-center gap-3 transition-all disabled:opacity-70 shadow-md shadow-[#062A78]/20 group"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5 bg-white rounded-full p-0.5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                {isLoading ? 'Authenticating...' : 'Sign in with Google'}
              </button>
            </div>
            
            {/* Footer links to fill vertical space nicely */}
            <div className="mt-8 pt-8 border-t border-slate-100">
               <div className="flex flex-col items-center gap-3">
                 <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                   <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                   Protected by Enterprise Security
                 </p>
                 <div className="flex gap-4 text-[11px] font-medium text-slate-400">
                   <button type="button" className="hover:text-[#062A78] transition-colors">Privacy Policy</button>
                   <span>&bull;</span>
                   <button type="button" className="hover:text-[#062A78] transition-colors">Terms of Service</button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
