
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const features = [
  { icon:'🎯', title:'YOLOv8 Detection',   desc:'State-of-the-art real-time object detection fine-tuned on arecanut dataset.' },
  { icon:'⚡', title:'Instant Results',     desc:'Upload a tray photo and receive grade classification in seconds.' },
  { icon:'📊', title:'Visual Analytics',   desc:'Bar charts, doughnut charts, and annotated images with bounding boxes.' },
  { icon:'🔒', title:'Secure & Private',   desc:'JWT authentication ensures only you can see your scan history.' },
  { icon:'📂', title:'Scan History',       desc:'Every grading session is saved and accessible anytime.' },
  { icon:'🌾', title:'Built for Farmers',  desc:'Simple upload interface designed for field use without technical knowledge.' },
];

const steps = [
  { n:'01', title:'Upload Image',    desc:'Take a photo of your arecanut tray and upload it to the dashboard.' },
  { n:'02', title:'AI Detection',    desc:'YOLOv8 detects each nut, draws bounding boxes and classifies Grade A or B.' },
  { n:'03', title:'View Results',    desc:'See count summary, annotated image, and grade distribution charts.' },
];

export default function Home() {
  const navigate   = useNavigate();
  const aboutRef   = useRef(null);
  const stepsRef   = useRef(null);
  const featRef    = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(entries =>
      entries.forEach(e => e.isIntersecting && e.target.classList.add('opacity-100','translate-y-0')),
      { threshold: 0.1 }
    );
    [aboutRef, stepsRef, featRef].forEach(r => r.current && obs.observe(r.current));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="bg-cream-50">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-forest-900">
        {/* Background texture */}
        <div className="absolute inset-0"
          style={{backgroundImage:'radial-gradient(ellipse at 20% 50%, rgba(122,186,90,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(78,154,42,0.1) 0%, transparent 50%)'}} />
        <div className="absolute inset-0 opacity-5"
          style={{backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px)'}} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-forest-500/20 border border-forest-400/30 rounded-full text-forest-300 text-xs font-semibold tracking-widest uppercase mb-8 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-400 animate-pulse-slow" />
              AI-Powered Quality Detection
            </div>

            <h1 className="font-display text-6xl lg:text-7xl font-bold text-white leading-[1.05] mb-6 animate-fade-up">
              Grade Arecanuts<br/>
              <em className="text-forest-400 not-italic">Instantly</em> with AI
            </h1>

            <p className="text-forest-100/70 text-xl leading-relaxed mb-10 max-w-lg animate-fade-up delay-100">
              Upload a tray image. Our YOLOv8 model detects every nut, classifies Grade A or B, and delivers results in seconds.
            </p>

            <div className="flex flex-wrap gap-4 animate-fade-up delay-200">
              <button onClick={() => navigate('/dashboard')}
                className="px-8 py-4 bg-forest-500 hover:bg-forest-400 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-glow">
                Start Grading →
              </button>
              <button onClick={() => navigate('/history')}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all duration-200">
                View History
              </button>
            </div>

            {/* Stats */}
            <div className="mt-14 flex gap-10 animate-fade-up delay-300">
              {[['YOLOv8','Detection Model'],['2','Grade Classes'],['Real-time','Processing']].map(([v,l]) => (
                <div key={l}>
                  <p className="font-display text-2xl font-bold text-white">{v}</p>
                  <p className="text-forest-300 text-xs mt-1">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="hidden lg:flex items-center justify-center animate-fade-in delay-300">
            <div className="relative w-80 h-80">
              <div className="absolute inset-0 rounded-3xl bg-forest-500/20 border border-forest-400/30 backdrop-blur rotate-6" />
              <div className="absolute inset-0 rounded-3xl bg-forest-800/60 border border-forest-400/20 backdrop-blur flex flex-col items-center justify-center gap-6">
                <div className="text-7xl">🌰</div>
                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-white">Grade A</p>
                  <p className="text-forest-300 text-sm mt-1">12 nuts detected</p>
                </div>
                <div className="flex gap-3">
                  <div className="px-4 py-2 bg-forest-500/30 rounded-lg border border-forest-400/40 text-center">
                    <p className="font-bold text-white text-lg">8</p>
                    <p className="text-forest-300 text-xs">Grade A</p>
                  </div>
                  <div className="px-4 py-2 bg-orange-500/20 rounded-lg border border-orange-400/30 text-center">
                    <p className="font-bold text-white text-lg">4</p>
                    <p className="text-orange-300 text-xs">Grade B</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        ref={stepsRef}
        className="py-24 px-6 opacity-0 translate-y-8 transition-all duration-700"
      >
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold text-forest-500 uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="font-display text-4xl font-bold text-stone-800 text-center mb-16">Three steps to grade</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s,i) => (
              <div key={s.n} className="relative">
                {i < steps.length-1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-forest-200 to-transparent z-0" />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-forest-50 border border-forest-100 flex items-center justify-center mb-5">
                    <span className="font-display text-2xl font-bold text-forest-500">{s.n}</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-stone-800 mb-3">{s.title}</h3>
                  <p className="text-stone-500 leading-relaxed text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section ref={featRef} className="py-24 px-6 bg-stone-50 opacity-0 translate-y-8 transition-all duration-700">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-bold text-forest-500 uppercase tracking-widest mb-3">Features</p>
          <h2 className="font-display text-4xl font-bold text-stone-800 text-center mb-16">Everything you need</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title}
                className="p-6 bg-white rounded-2xl border border-stone-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-forest-50 flex items-center justify-center text-2xl mb-4 group-hover:bg-forest-100 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-bold text-stone-800 mb-2">{f.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section ref={aboutRef} className="py-24 px-6 bg-white opacity-0 translate-y-8 transition-all duration-700">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-bold text-forest-500 uppercase tracking-widest mb-3">About</p>
          <h2 className="font-display text-4xl font-bold text-stone-800 mb-8 leading-tight">
            Why automated grading<br/>matters
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-5 text-stone-500 leading-relaxed">
              <p>Traditional arecanut grading is manual, slow, and inconsistent. Subjectivity in quality assessment leads to market unfairness and financial losses for farmers.</p>
              <p>Our system uses a <strong className="text-stone-700">fine-tuned YOLOv8 model</strong> trained on a curated dataset of arecanut images. It classifies nuts based on texture, size, and colour with high accuracy.</p>
              <p>Hyperparameters were optimised via grid search. Data augmentation improved model robustness for varied lighting and tray configurations.</p>
            </div>
            <div className="space-y-4">
              {[
                ['Dataset','Curated, labelled arecanut images with augmentation'],
                ['Model','YOLOv8 fine-tuned for 2-class detection'],
                ['Classes','Grade A (premium) and Grade B (standard)'],
                ['Goal','Scalable, fair, automated market grading'],
              ].map(([k,v]) => (
                <div key={k} className="flex gap-4 p-4 rounded-xl border border-stone-100 bg-stone-50">
                  <span className="text-forest-500 font-bold text-sm w-20 shrink-0">{k}</span>
                  <span className="text-stone-600 text-sm">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-forest-800">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl font-bold text-white mb-4">Ready to grade smarter?</h2>
          <p className="text-forest-200 mb-8">Upload your first arecanut image and see AI grading in action.</p>
          <button onClick={() => navigate('/dashboard')}
            className="px-10 py-4 bg-forest-500 hover:bg-forest-400 text-white font-semibold rounded-xl transition-all hover:-translate-y-1 hover:shadow-glow">
            Go to Dashboard →
          </button>
        </div>
      </section>
    </div>
  );
}
