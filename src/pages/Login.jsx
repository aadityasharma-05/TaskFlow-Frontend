import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/axios';
import { Sparkles, LayoutDashboard, Zap } from 'lucide-react';

const Login = () => {
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
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-slate-50">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[40%] h-[40%] bg-pink-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>

      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center justify-between p-6 gap-12 z-10">
        
        {/* Landing Page Content (Left Side) */}
        <div className="w-full lg:w-1/2 text-center lg:text-left pt-10 lg:pt-0">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold text-sm mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
            Now with Llama-3 AI Estimations
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 font-heading mb-6 tracking-tight leading-tight">
            Master your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              workflow.
            </span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-10 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
            TaskFlow is the ultimate intelligent workspace. Plan, track, and collaborate on your projects with AI-powered task estimates and an intuitive drag-and-drop interface.
          </p>
          
          {/* Feature Highlights */}
          <div className="space-y-6 hidden lg:block max-w-md">
            <div className="flex items-center text-slate-700 glass p-4 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4 shadow-sm border border-indigo-200/50">
                 <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">AI Auto-Estimates</h3>
                <p className="text-sm text-slate-500 font-medium">Let Groq predict your task deadlines instantly.</p>
              </div>
            </div>
            
            <div className="flex items-center text-slate-700 glass p-4 rounded-2xl ml-8">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4 shadow-sm border border-purple-200/50">
                 <LayoutDashboard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Fluid Kanban Boards</h3>
                <p className="text-sm text-slate-500 font-medium">Seamless drag-and-drop task management.</p>
              </div>
            </div>

            <div className="flex items-center text-slate-700 glass p-4 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mr-4 shadow-sm border border-pink-200/50">
                 <Zap className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Lightning Fast</h3>
                <p className="text-sm text-slate-500 font-medium">Optimized MERN stack performance.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form (Right Side) */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="glass w-full p-8 rounded-3xl relative shadow-2xl shadow-indigo-900/10 border border-white/60">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 font-heading mb-2">Welcome Back</h2>
              <p className="text-gray-500 font-medium">Sign in to your workspace</p>
            </div>

            {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-white/60 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none font-medium"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5 ml-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 bg-white/60 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3.5 rounded-2xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 mt-4 hover:-translate-y-0.5"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In to Workspace'}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-600 font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
