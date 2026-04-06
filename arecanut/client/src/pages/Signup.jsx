
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ username: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = e => { setForm({...form, [e.target.name]: e.target.value}); setError(''); };

  const onSubmit = async e => {
    e.preventDefault();
    if (form.username.length < 3) return setError('Username must be at least 3 characters');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await API.post('/auth/signup', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      navigate('/home');
    } catch(err) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-forest-800 relative overflow-hidden flex-col items-center justify-center p-16">
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage:'radial-gradient(circle at 70% 50%, #7aba5a 0%, transparent 60%), radial-gradient(circle at 20% 80%, #4e9a2a 0%, transparent 50%)'}} />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-8 border border-white/20">
            <span className="font-display text-4xl font-bold text-white">N</span>
          </div>
          <h1 className="font-display text-5xl font-bold text-white mb-4 leading-tight">
            Join the<br/>
            <em className="text-forest-400 not-italic">Future</em> of<br/>
            Agriculture
          </h1>
          <p className="text-forest-200 text-lg max-w-xs mx-auto leading-relaxed mt-4">
            Automate arecanut quality grading with computer vision
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-10">
            <h2 className="font-display text-4xl font-bold text-stone-800 mb-2">Create account</h2>
            <p className="text-stone-400">Start grading arecanuts with AI</p>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Username</label>
              <input type="text" name="username" value={form.username} onChange={onChange} required
                placeholder="Min 3 characters"
                className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-forest-400 focus:ring-4 focus:ring-forest-50 transition-all placeholder:text-stone-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} name="password" value={form.password} onChange={onChange} required
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-3.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-forest-400 focus:ring-4 focus:ring-forest-50 transition-all placeholder:text-stone-300 pr-20"
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-forest-500 hover:text-forest-700">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-4 bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-glow hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-2">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Creating...</> : 'Create account →'}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-stone-400">
            Already have an account?{' '}
            <Link to="/login" className="text-forest-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

