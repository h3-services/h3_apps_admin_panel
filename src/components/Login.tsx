import { useState } from 'react';
import { AlertTriangle, Users, Heart, BarChart2, BookOpen } from 'lucide-react';
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
      
      // We temporarily store the token to authenticate the API request
      sessionStorage.setItem('authToken', token);

      // Verify user against backend using the static backend token
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
      
      // Fetch the role for this specific user
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
      
      // Fallback just in case roles were left on the user object directly
      roleStr = roleStr || (userRecord.role || userRecord.user_role || '').toLowerCase();
      const isAdmin = roleStr.includes('admin') || roleStr.includes('superadmin') || userRecord.is_superuser === true || userRecord.is_admin === true;
      
      if (!isAdmin) {
        sessionStorage.removeItem('authToken');
        throw new Error('Access Denied. You do not have administrator privileges.');
      }
      
      // Successfully authenticated and verified as admin
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
    <div className="min-h-screen flex bg-slate-50 font-sans">
      {/* Left Section - Hidden on small screens */}
      <div className="hidden lg:flex lg:w-[55%] xl:w-[60%] flex-col justify-center px-12 xl:px-24 relative overflow-hidden bg-white">
        {/* Background decorations */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] bg-indigo-50/80 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 w-full max-w-2xl xl:max-w-3xl">
          <div className="flex items-center gap-3 mb-16">
            <img src="/hope3_logo-removebg-preview.png" alt="Hope3 Logo" className="h-12 w-auto object-contain" />
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">Hope3</h2>
              <p className="text-[9px] font-bold text-slate-400 tracking-[0.2em] mt-1">PEOPLE PURPOSE PROGRESS</p>
            </div>
          </div>

          <div className="mb-12">
            <p className="text-xs font-bold text-slate-400 tracking-[0.2em] mb-4 uppercase">Sign in to continue</p>
            <h1 className="text-5xl xl:text-[4rem] font-black text-slate-800 leading-[1.1] tracking-tight mb-6">
              Together for <br/><span className="text-[#062A78]">Brighter Tomorrows.</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-lg leading-relaxed font-medium">
              Manage students, donors, contributions and programs — all in one place. Empowering communities through education, support and opportunities.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <div className="bg-sky-50/80 p-4 rounded-2xl flex flex-col items-center justify-center text-center border border-sky-100/50">
              <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center mb-3">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Students</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Track Progress</p>
            </div>
            
            <div className="bg-teal-50/80 p-4 rounded-2xl flex flex-col items-center justify-center text-center border border-teal-100/50">
              <div className="w-10 h-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-3">
                <Heart size={20} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Donors</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Build Relationships</p>
            </div>

            <div className="bg-purple-50/80 p-4 rounded-2xl flex flex-col items-center justify-center text-center border border-purple-100/50">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-3">
                <BarChart2 size={20} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Contributions</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Ensure Transparency</p>
            </div>

            <div className="bg-amber-50/80 p-4 rounded-2xl flex flex-col items-center justify-center text-center border border-amber-100/50">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-3">
                <BookOpen size={20} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">Programs</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Create Opportunities</p>
            </div>
          </div>

          <div className="flex items-center gap-6 border-l-2 border-[#062A78] pl-6">
            <div className="text-3xl font-serif italic text-slate-800 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
              Small Support<br/>Big Futures
            </div>
            <p className="text-xs text-slate-500 font-medium max-w-[200px]">
              A more inclusive, educated and empowered tomorrow.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-[45%] xl:w-[40%] flex flex-col relative bg-slate-50/50">
        <div className="absolute top-8 right-8 z-20 flex items-center gap-3 text-sm font-bold text-slate-500">
          <div className="w-6 h-0.5 bg-[#062A78] rounded-full"></div>
          Foundation Admin Portal
        </div>
        
        {/* Abstract background on right side */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[20%] w-[70%] h-[70%] bg-sky-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-full h-[30%] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNlMmU4ZjAiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PC9zdmc+')] opacity-60" />
        </div>

        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 z-10 relative mt-24 lg:mt-0">
          <div className="w-full max-w-[420px] bg-white p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="flex flex-col items-center mb-8">
              <img
                src="/hope3_logo-removebg-preview.png"
                alt="Hope3 Logo"
                className="h-14 w-auto object-contain mb-3"
              />
              <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">Hope3</h2>
              <p className="text-[9px] font-bold text-slate-400 tracking-[0.2em] mb-6 uppercase">Admin Portal</p>
              
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h1>
              <p className="text-sm text-slate-500 font-medium">Sign in to access your admin dashboard</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-xl px-4 py-3 border border-red-100 mb-6">
                <AlertTriangle size={15} className="shrink-0" /> {error}
              </div>
            )}


            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-700 flex items-center justify-center gap-3 transition-colors disabled:opacity-70 shadow-sm mb-8"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-600 rounded-full animate-spin" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              {isLoading ? 'Verifying Account...' : 'Sign in with Google'}
            </button>

            <p className="text-center text-xs font-medium text-slate-500">
              Need access? <button type="button" className="font-bold text-[#062A78] hover:text-blue-700 transition-colors">Contact Administrator</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
