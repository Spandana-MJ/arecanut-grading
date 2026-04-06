
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api/axios';

export default function History() {
  const navigate      = useNavigate();
  const [scans, setScans]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    API.get('/scans/history')
      .then(r => setScans(r.data))
      .catch(() => setError('Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async id => {
    if (!window.confirm('Delete this scan?')) return;
    setDeleting(id);
    try {
      await API.delete(`/scans/${id}`);
      setScans(p => p.filter(s => s._id !== id));
    } catch { alert('Delete failed'); }
    finally { setDeleting(null); }
  };

  const badge = g =>
    g === 'Grade A' ? 'bg-forest-50 text-forest-700 border-forest-200'
    : g === 'Grade B' ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-red-50 text-red-600 border-red-200';

  const fmt = iso => new Date(iso).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

  const totalA = scans.filter(s => s.finalGrade === 'Grade A').length;
  const totalB = scans.filter(s => s.finalGrade === 'Grade B').length;

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 bg-cream-50 px-4 py-12">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 animate-fade-up">
            <div>
              <p className="text-xs font-bold text-forest-500 uppercase tracking-widest mb-2">Records</p>
              <h1 className="font-display text-5xl font-bold text-stone-800">Scan History</h1>
            </div>
            <button onClick={() => navigate('/dashboard')}
              className="self-start sm:self-auto px-6 py-3 bg-forest-600 hover:bg-forest-700 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-glow text-sm">
              + New Scan
            </button>
          </div>

          {/* Stat cards */}
          {!loading && scans.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-up delay-100">
              {[
                { label:'Total Scans',    value: scans.length,  color:'text-stone-800',   bg:'bg-white' },
                { label:'Grade A Results',value: totalA,        color:'text-forest-600',  bg:'bg-forest-50' },
                { label:'Grade B Results',value: totalB,        color:'text-amber-600',   bg:'bg-amber-50' },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-2xl border border-stone-100 shadow-card p-5 text-center`}>
                  <p className={`font-display text-4xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-stone-400 text-xs mt-1 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-32">
              <span className="w-10 h-10 border-4 border-stone-100 border-t-forest-500 rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && <div className="text-center py-16 text-red-500">⚠ {error}</div>}

          {/* Empty */}
          {!loading && !error && scans.length === 0 && (
            <div className="text-center py-32 bg-white rounded-2xl border border-stone-100 shadow-card animate-fade-up">
              <p className="text-5xl mb-4">📂</p>
              <p className="font-display text-2xl font-bold text-stone-700 mb-2">No scans yet</p>
              <p className="text-stone-400 mb-8">Upload your first arecanut image to get started</p>
              <button onClick={() => navigate('/dashboard')}
                className="px-8 py-3 bg-forest-600 text-white rounded-xl font-semibold hover:bg-forest-700 transition-all">
                Go to Dashboard
              </button>
            </div>
          )}

          {/* Table */}
          {!loading && scans.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-card overflow-hidden animate-fade-up delay-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-100">
                      {['#','Filename','Grade A','Grade B','Total','Result','Date',''].map(h => (
                        <th key={h} className="px-5 py-4 text-left text-xs font-bold text-stone-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {scans.map((s, i) => (
                      <tr key={s._id} className="hover:bg-cream-50 transition-colors">
                        <td className="px-5 py-4 text-stone-300 font-medium text-xs">{String(i+1).padStart(2,'0')}</td>
                        <td className="px-5 py-4">
                          <span className="font-medium text-stone-700 truncate block max-w-[160px]" title={s.filename}>{s.filename}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="font-bold text-forest-600">{s.gradeA}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="font-bold text-amber-500">{s.gradeB}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="font-semibold text-stone-600">{s.totalCount}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold border ${badge(s.finalGrade)}`}>
                            {s.finalGrade}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-stone-400 text-xs whitespace-nowrap">{fmt(s.createdAt)}</td>
                        <td className="px-5 py-4">
                          <button onClick={() => handleDelete(s._id)} disabled={deleting === s._id}
                            className="text-xs font-semibold text-stone-300 hover:text-red-400 disabled:opacity-30 transition-colors">
                            {deleting === s._id ? '...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
