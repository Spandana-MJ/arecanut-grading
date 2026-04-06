
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import Navbar from '../components/Navbar';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function Result() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  useEffect(() => { if (!state) navigate('/dashboard'); }, [state, navigate]);
  if (!state) return null;

  const { gradeA = 0, gradeB = 0, totalCount = 0, finalGrade, annotatedImage } = state;

  const pctA = totalCount > 0 ? Math.round((gradeA / totalCount) * 100) : 0;
  const pctB = totalCount > 0 ? Math.round((gradeB / totalCount) * 100) : 0;

  const isA    = finalGrade === 'Grade A';
  const isInv  = finalGrade === 'Invalid';
  const badge  = isInv ? 'bg-red-50 border-red-200 text-red-700' : isA ? 'bg-forest-50 border-forest-200 text-forest-700' : 'bg-amber-50 border-amber-200 text-amber-700';

  // Use relative URL — Vite proxies /uploads to http://localhost:5000/uploads
  const imgUrl = annotatedImage
    ? `/uploads/${annotatedImage}`
    : null;

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 bg-cream-50 px-4 py-12">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-8 animate-fade-up">
            <p className="text-xs font-bold text-forest-500 uppercase tracking-widest mb-2">Detection Complete</p>
            <h1 className="font-display text-5xl font-bold text-stone-800">Grading Result</h1>
          </div>

          {/* Grade banner */}
          <div className={`mb-8 p-5 rounded-2xl border-2 ${badge} flex items-center gap-4 animate-fade-up delay-100`}>
            <div className="w-12 h-12 rounded-xl bg-white/60 flex items-center justify-center text-2xl shrink-0">
              {isInv ? '❌' : isA ? '🏆' : '🥈'}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-0.5">Majority Grade</p>
              <p className="font-display text-3xl font-bold">{finalGrade}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs opacity-60 mb-0.5">Total detected</p>
              <p className="font-display text-3xl font-bold">{totalCount}</p>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid lg:grid-cols-3 gap-6 animate-fade-up delay-200">

            {/* Annotated image */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-50">
                <h3 className="font-display text-lg font-bold text-stone-700">Annotated Detection</h3>
                <p className="text-stone-400 text-xs mt-0.5">Bounding boxes drawn by YOLOv8</p>
              </div>
              <div className="p-4 flex items-center justify-center min-h-64 bg-stone-50">
                {imgUrl ? (
                  <img src={imgUrl} alt="Annotated" className="max-w-full max-h-96 rounded-xl object-contain" />
                ) : (
                  <div className="text-center text-stone-300">
                    <p className="text-4xl mb-2">🖼</p>
                    <p className="text-sm">No annotated image available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col gap-6">
              {/* Count cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:'Grade A', value: gradeA, pct: pctA, color:'text-forest-600', bg:'bg-forest-50', border:'border-forest-100' },
                  { label:'Grade B', value: gradeB, pct: pctB, color:'text-amber-600',  bg:'bg-amber-50',  border:'border-amber-100' },
                ].map(c => (
                  <div key={c.label} className={`p-4 rounded-2xl border ${c.bg} ${c.border}`}>
                    <p className={`font-display text-4xl font-bold ${c.color}`}>{c.value}</p>
                    <p className="text-stone-500 text-xs font-semibold mt-1">{c.label}</p>
                    <p className={`text-xs font-bold ${c.color} mt-2`}>{c.pct}%</p>
                  </div>
                ))}
              </div>

              {/* Doughnut */}
              {totalCount > 0 && (
                <div className="bg-white rounded-2xl border border-stone-100 shadow-card p-5">
                  <h4 className="font-display font-bold text-stone-700 text-sm mb-4">Distribution</h4>
                  <Doughnut
                    data={{ labels:['Grade A','Grade B'], datasets:[{ data:[gradeA,gradeB], backgroundColor:['#4e9a2a','#f97316'], borderWidth:0, hoverOffset:4 }] }}
                    options={{ responsive:true, cutout:'68%', plugins:{ legend:{ position:'bottom', labels:{ font:{ size:11 } } } } }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bar chart */}
          <div className="mt-6 bg-white rounded-2xl border border-stone-100 shadow-card p-6 animate-fade-up delay-300">
            <h3 className="font-display text-lg font-bold text-stone-700 mb-2">Grade Distribution</h3>
            <p className="text-stone-400 text-xs mb-6">Count comparison between Grade A and Grade B nuts</p>
            <div className="max-w-md">
              <Bar
                data={{ labels:['Grade A','Grade B'], datasets:[{ label:'Count', data:[gradeA,gradeB], backgroundColor:['#4e9a2a','#f97316'], borderRadius:8, borderSkipped:false }] }}
                options={{ responsive:true, plugins:{ legend:{ display:false } }, scales:{ y:{ beginAtZero:true, ticks:{ precision:0, font:{ size:11 } }, grid:{ color:'#f5f5f4' } }, x:{ grid:{ display:false } } } }}
              />
            </div>

            {/* Progress bars */}
            {totalCount > 0 && (
              <div className="mt-6 space-y-3 max-w-md">
                {[{label:'Grade A', count:gradeA, color:'bg-forest-500'},{ label:'Grade B', count:gradeB, color:'bg-amber-400'}].map(g => (
                  <div key={g.label}>
                    <div className="flex justify-between text-xs text-stone-500 mb-1.5">
                      <span className="font-semibold">{g.label}</span>
                      <span>{Math.round((g.count/totalCount)*100)}%</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full ${g.color} rounded-full transition-all duration-1000`} style={{ width:`${(g.count/totalCount)*100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-4 animate-fade-up delay-300">
            <button onClick={() => navigate('/dashboard')}
              className="px-8 py-3.5 bg-forest-600 hover:bg-forest-700 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-glow">
              ← Scan Another
            </button>
            <button onClick={() => navigate('/history')}
              className="px-8 py-3.5 bg-white border border-stone-200 hover:border-forest-300 text-stone-600 font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-card-hover">
              View History
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
