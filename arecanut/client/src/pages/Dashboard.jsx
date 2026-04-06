
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api/axios';

export default function Dashboard() {
  const navigate      = useNavigate();
  const inputRef      = useRef(null);
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [drag, setDrag]       = useState(false);

  const process = f => {
    if (!f) return;
    if (!['image/jpeg','image/jpg','image/png','image/webp'].includes(f.type))
      return setError('Only JPG, PNG or WEBP allowed');
    if (f.size > 10*1024*1024) return setError('File must be under 10MB');
    setFile(f); setError('');
    const r = new FileReader();
    r.onloadend = () => setPreview(r.result);
    r.readAsDataURL(f);
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!file) return setError('Please select an image first');
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await API.post('/scans/predict', fd, { headers:{ 'Content-Type':'multipart/form-data' } });
      navigate('/result', { state: res.data });
    } catch(err) {
      setError(err.response?.data?.error || 'Prediction failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 bg-cream-50 flex items-center justify-center px-4">
        <div className="w-full max-w-2xl py-16">
          {/* Header */}
          <div className="mb-10 animate-fade-up">
            <p className="text-xs font-bold text-forest-500 uppercase tracking-widest mb-2">AI Detection</p>
            <h1 className="font-display text-5xl font-bold text-stone-800 mb-3">Grade Your Nuts</h1>
            <p className="text-stone-400 text-lg">Upload a tray photo for instant AI-powered grading</p>
          </div>

          <div className="animate-fade-up delay-100">
            {error && (
              <div className="mb-6 flex gap-3 items-center px-4 py-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                <span>⚠</span> {error}
              </div>
            )}

            <form onSubmit={onSubmit}>
              {/* Drop zone */}
              <div
                onClick={() => inputRef.current.click()}
                onDragOver={e => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={e => { e.preventDefault(); setDrag(false); process(e.dataTransfer.files[0]); }}
                className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden
                  ${drag ? 'border-forest-400 bg-forest-50 scale-[1.01]' : preview ? 'border-stone-200' : 'border-stone-200 hover:border-forest-300 hover:bg-forest-50/30'}
                  ${preview ? 'min-h-72' : 'min-h-64'}`}
              >
                {preview ? (
                  <div className="relative">
                    <img src={preview} alt="Preview" className="w-full max-h-72 object-contain" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-xs font-semibold text-stone-600 truncate max-w-xs">
                        {file?.name}
                      </span>
                      <button type="button"
                        onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); }}
                        className="px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50">
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center px-8">
                    <div className="w-16 h-16 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center mb-4">
                      <svg className="w-7 h-7 text-forest-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-stone-600 mb-1">Drop image here or click to browse</p>
                    <p className="text-stone-400 text-sm">JPG, PNG, WEBP — max 10MB</p>
                  </div>
                )}
              </div>
              <input ref={inputRef} type="file" accept="image/*" onChange={e => process(e.target.files[0])} className="hidden" />

              {/* Submit */}
              <button type="submit" disabled={loading || !file}
                className="mt-5 w-full py-4 bg-forest-600 hover:bg-forest-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow flex items-center justify-center gap-3 text-base">
                {loading ? (
                  <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analysing with AI...</>
                ) : (
                  <><span>🔍</span> Detect &amp; Grade Arecanuts</>
                )}
              </button>
            </form>

            {/* Tips */}
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              {[['💡','Good lighting','Natural or bright light gives best results'],
                ['📐','Flat surface','Place nuts flat on tray without overlap'],
                ['🎯','Clear photo','Ensure all nuts are visible in frame']].map(([i,t,d]) => (
                <div key={t} className="p-4 bg-white rounded-xl border border-stone-100 shadow-card">
                  <p className="text-lg mb-1">{i}</p>
                  <p className="font-semibold text-stone-700 text-xs mb-1">{t}</p>
                  <p className="text-stone-400 text-xs">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
