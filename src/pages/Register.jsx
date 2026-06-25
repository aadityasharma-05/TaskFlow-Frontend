import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios';
import { Sparkles, LayoutDashboard, Loader2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const res = await api.post('/auth/register', { name, email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans selection:bg-gray-900 selection:text-white">
      
      {/* Left Panel - Dark Mode Hero */}
      <div className="hidden lg:flex w-1/2 bg-[#0A0A0A] relative flex-col justify-between p-12 overflow-hidden">
        {/* Subtle geometric grid background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] z-0 pointer-events-none"></div>
        
        {/* Top Gradient Flare */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/20 rounded-full filter blur-[120px] pointer-events-none z-0"></div>

        <div className="z-10 relative">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 font-medium text-xs mb-8 tracking-wide">
            <Sparkles className="w-3.5 h-3.5 mr-2 text-indigo-400" />
            Llama 3.1 8b Integrated
          </div>
          
          <h1 className="text-5xl font-bold text-white tracking-tight leading-tight mb-6">
            Engineering velocity. <br />
            <span className="text-gray-400">Zero friction.</span>
          </h1>
          
          <p className="text-lg text-gray-400 mb-12 max-w-md font-medium leading-relaxed">
            TaskFlow is the modern planner for high-output teams. Estimate tasks with AI and organize your sprints effortlessly.
          </p>

          <div className="space-y-5 max-w-sm">
            <div className="flex items-start text-gray-300">
              <div className="mt-1 mr-4">
                 <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">AI Auto-Estimates</h3>
                <p className="text-sm text-gray-500">Let Groq predict task deadlines instantly based on description complexity.</p>
              </div>
            </div>
            
            <div className="flex items-start text-gray-300">
              <div className="mt-1 mr-4">
                 <LayoutDashboard className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white mb-1">Fluid Kanban</h3>
                <p className="text-sm text-gray-500">Optimistic UI updates for zero-latency drag and drop.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="z-10 relative text-sm font-medium text-gray-600">
          TaskFlow &copy; {new Date().getFullYear()}
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Create an account</h2>
            <p className="text-gray-500 text-sm">Join TaskFlow to start managing your projects.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all text-sm"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all text-sm"
                placeholder="name@company.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors mt-2 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-gray-900 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
