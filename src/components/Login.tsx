import { useState } from 'react';
import { AlertTriangle, Users, Heart, BarChart3, BookOpen, Mail, Lock, EyeOff, Eye, ArrowRight } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen flex font-sans bg-white">
      {/* Left Section - Content */}
      <div className="hidden lg:flex lg:w-[58%] flex-col justify-between px-16 py-12 relative overflow-hidden bg-white">
        
        {/* Subtle Background Elements to match design */}
        <div className="absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] bg-blue-50/60 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -top-[10%] -right-[10%] w-[500px] h-[500px] bg-[#f8fafc] rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Header */}
        <div className="z-10 mt-2">
            <div className="flex items-center gap-3 mb-16">
                <img src="/hope3_logo-removebg-preview.png" alt="Hope3 Logo" className="h-10 w-auto object-contain" />
                <div className="flex flex-col justify-center">
                    <span className="text-[22px] font-bold text-[#062A78] leading-none tracking-tight">Hope3</span>
                    <span className="text-[9px] text-slate-400 tracking-[0.25em] font-bold mt-1">PEOPLE PURPOSE PROGRESS</span>
                </div>
            </div>

            {/* Text Content */}
            <div className="space-y-4 max-w-xl">
                <p className="text-xs font-bold text-slate-400 tracking-[0.2em] uppercase">Sign in to continue</p>
                <h1 className="text-[3.5rem] leading-[1.1] font-extrabold tracking-tight text-[#1a2b49]">
                    Together for <br />
                    <span className="text-[#062A78]">Brighter Tomorrows.</span>
                </h1>
                <p className="text-[17px] text-slate-500 mt-6 leading-relaxed max-w-[500px] font-medium">
                    Manage students, donors, contributions and programs — all in one place. Empowering communities through education, support and opportunities.
                </p>
            </div>

            {/* Features Cards */}
            <div className="grid grid-cols-4 gap-4 mt-12 max-w-[650px]">
                {/* Card 1 */}
                <div className="bg-[#f0f7ff] rounded-2xl p-5 flex flex-col items-center text-center shadow-sm border border-blue-100/50">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-[#e0efff]/50">
                        <Users className="text-[#062A78]" size={22} fill="currentColor" />
                    </div>
                    <span className="font-bold text-[13px] text-slate-800 mb-0.5">Students</span>
                    <span className="text-[11px] text-slate-400 font-medium">Track Progress</span>
                </div>
                {/* Card 2 */}
                <div className="bg-[#f0f7ff] rounded-2xl p-5 flex flex-col items-center text-center shadow-sm border border-blue-100/50">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-[#e0efff]/50">
                        <Heart className="text-[#062A78]" size={22} />
                    </div>
                    <span className="font-bold text-[13px] text-slate-800 mb-0.5">Donors</span>
                    <span className="text-[11px] text-slate-400 font-medium">Build Relationships</span>
                </div>
                {/* Card 3 */}
                <div className="bg-[#f0f7ff] rounded-2xl p-5 flex flex-col items-center text-center shadow-sm border border-blue-100/50">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-[#e0efff]/50">
                        <BarChart3 className="text-[#062A78]" size={22} fill="currentColor" />
                    </div>
                    <span className="font-bold text-[13px] text-slate-800 mb-0.5">Contributions</span>
                    <span className="text-[11px] text-slate-400 font-medium">Ensure Transparency</span>
                </div>
                {/* Card 4 */}
                <div className="bg-[#f0f7ff] rounded-2xl p-5 flex flex-col items-center text-center shadow-sm border border-blue-100/50">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3 bg-[#e0efff]/50">
                        <BookOpen className="text-[#062A78]" size={22} fill="currentColor" />
                    </div>
                    <span className="font-bold text-[13px] text-slate-800 mb-0.5">Programs</span>
                    <span className="text-[11px] text-slate-400 font-medium">Create Opportunities</span>
                </div>
            </div>
        </div>

        {/* Bottom Footer */}
        <div className="z-10 flex items-center gap-6 mt-16 mb-4">
            <div className="text-[2.75rem] text-[#062A78] leading-[1.1]" style={{ fontFamily: "'Caveat', cursive" }}>
                Small Support<br/>
                <span className="ml-4">Big Futures</span>
            </div>
            <div className="w-px h-16 bg-slate-300/60"></div>
            <p className="text-[13px] text-slate-400 font-medium max-w-[160px] leading-relaxed">
                A more inclusive, educated and empowered tomorrow.
            </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-[42%] flex flex-col relative bg-[#f8fafc] overflow-hidden items-center justify-center p-6 lg:p-12">
        
        {/* Subtle Background Pattern/Color for Right Side */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-blue-50/80 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-[300px] bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/30 via-transparent to-transparent pointer-events-none"></div>

        {/* Right Header Link */}
        <div className="absolute top-10 right-12 z-20 flex items-center gap-3 text-[13px] font-semibold text-slate-500 hidden lg:flex">
            <div className="w-5 h-0.5 bg-[#062A78] rounded-full"></div>
            Foundation Admin Portal
        </div>

        {/* Dotted pattern bottom right */}
        <div className="absolute bottom-10 right-10 w-32 h-32 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #062A78 2px, transparent 2px)', backgroundSize: '16px 16px' }}></div>

        {/* Login Card */}
        <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-[1.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] z-10">
            <div className="text-center mb-8">
                <div className="flex justify-center mb-3">
                    <img src="/hope3_logo-removebg-preview.png" alt="Hope3 Logo" className="h-[46px] w-auto object-contain" />
                </div>
                <h2 className="text-[22px] font-bold text-[#062A78] leading-none mb-1">Hope3</h2>
                <div className="text-[9px] text-slate-400 tracking-[0.25em] font-bold mb-8 uppercase">Admin Portal</div>
                
                <h3 className="text-[28px] font-black text-slate-900 tracking-tight mb-2">Welcome Back</h3>
                <p className="text-[14px] text-slate-500 font-medium">Sign in to access your admin dashboard</p>
            </div>

            {error && (
              <div className="flex items-start gap-3 text-[13px] text-red-700 bg-red-50 rounded-xl p-3 mb-6 border border-red-100">
                <AlertTriangle className="shrink-0 text-red-600 mt-0.5" size={16} />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            <form className="space-y-4.5" onSubmit={(e) => e.preventDefault()}>
                <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="email" 
                            placeholder="Enter your email address" 
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#062A78]/20 focus:border-[#062A78] text-[14px] transition-all bg-white placeholder:text-slate-400"
                        />
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-[13px] font-bold text-slate-700 mb-2">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Enter your password" 
                            className="w-full pl-11 pr-10 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#062A78]/20 focus:border-[#062A78] text-[14px] transition-all bg-white placeholder:text-slate-400"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                </div>

                <button type="button" className="w-full py-3.5 bg-[#062A78] hover:bg-[#05205c] text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-colors mt-2">
                    Login to Dashboard <ArrowRight size={16} />
                </button>
            </form>

            <div className="relative my-7">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-4 text-slate-400 font-medium">or</span>
                </div>
            </div>

            <button 
                type="button" 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full py-3 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded-xl font-bold text-[14px] flex items-center justify-center gap-3 transition-all disabled:opacity-70"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-[#062A78] rounded-full animate-spin" />
                ) : (
                    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                )}
                Sign in with Google
            </button>

            <div className="mt-8 text-center text-[13px] text-slate-500 font-medium">
                Need access? <a href="#" className="text-[#062A78] hover:underline font-semibold ml-1">Contact Administrator</a>
            </div>
        </div>
      </div>
    </div>
  );
};
