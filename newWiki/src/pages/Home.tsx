import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import RingNav from '../components/RingNav';
import './Home.css';

const MODULES = [
  {
    title: 'Module 1: Cellulose Recovery',
    tagline: 'Upstream · safety-net',
    what: "Waste cotton fabric is broken down by a four-enzyme cocktail (Cel5A, Cel6B, BglC, LPMO10A from Thermobifida fusca YX) into glucose, the project's feedstock.",
    methods: 'Two-plasmid E. coli BL21(DE3) system (pETDuet-Cel5A-Cel6B + pCDFDuet-BglC-LPMO10A); Box–Behnken RSM optimizes pH, temperature, substrate load, enzyme dose and time.',
    consequence: 'Even if the protein-assembly modules lag, this module alone supports the fallback story: waste cotton → sugar → bacterial cellulose → photonic film.',
  },
  {
    title: 'Module 2: Pigment Film',
    tagline: 'Midstream · undertone',
    what: 'An engineered indigo-producing E. coli feeds a blue-violet undertone into the bacterial-cellulose scaffold, suppressing stray wavelengths and boosting color saturation.',
    methods: 'tnaA + FMO pathway (tryptophan → indole → indigo) in BL21(DE3); leuco-indigo diffused in-situ into HS-medium-grown Komagataeibacter xylinus cellulose, then air-oxidized.',
    consequence: "Provides the dark 'underpainting' that traditional Diǎn Cuì gets from a lacquer base; without it, the structural-color layer alone can look washed out.",
  },
  {
    title: 'Module 3: CNC Iridescent Film',
    tagline: 'Midstream · core structural color',
    what: 'Cellulose nanocrystals self-assemble into a chiral-nematic liquid crystal that Bragg-reflects a single color, the project\'s primary source of structural color and a stand-in for the kingfisher feather itself.',
    methods: 'Bacterial cellulose hydrolyzed by acid or by the Module 1 Cel5A enzyme, then evaporation-induced self-assembly (EISA) under controlled humidity, temperature and [NaCl].',
    consequence: "This module alone reproduces the full 'waste cotton → BC → iridescent film → wearable' arc, our fallback if the reflectin module is delayed.",
  },
  {
    title: 'Module 4: Reflectin Layer',
    tagline: 'Innovation layer',
    what: 'A truncated squid reflectin (refCBA) secreted by Yarrowia lipolytica self-assembles into nanoparticles under pH/salt control, layering a second, tunable structural-color contribution onto the CNC film.',
    methods: 'pTEF-SP2-refCBA-His6 in Y. lipolytica Po1f; pH/NaCl-triggered LLPS assembly; sequential infusion into the pre-formed CNC film (Route A).',
    consequence: "The hardest, highest-reward module: if it lands, it turns 'a nice iridescent film' into an engineered, tunable echo of real reflectin biology.",
  },
];

const TOTEMS = [
  {
    href: '/Project-Description.html',
    title: 'Project',
    badge: '',
    desc: "The full story: from landfill-bound cotton to a wearable Diǎn Cuì-inspired photonic film. Four modules, one supply chain, plus the modelling and results behind it.",
  },
  {
    href: '/Wet-Lab-Experiments.html',
    title: 'Wet Lab',
    badge: '',
    desc: 'Every plasmid, strain, buffer and DOE matrix across all four modules: the bench-level record, including live notebook entries.',
  },
  {
    href: '/Human-Practices.html',
    title: 'Human Practices',
    badge: '',
    desc: 'Why Diǎn Cuì, why now: stakeholder conversations shaping a cruelty-free, sustainable alternative to a feather-based craft.',
  },
  {
    href: '/Attributions.html',
    title: 'Team',
    badge: '',
    desc: 'Who built what: wet lab, dry lab, human practices, advisors, and PIs, with individual contributions.',
  },
];

export default function Home() {
  const [activeModule, setActiveModule] = useState(0);
  const [fadingModule, setFadingModule] = useState(false);
  const [activeTotem, setActiveTotem] = useState<number | null>(null);
  const [displayLabel, setDisplayLabel] = useState('Project');
  const bgWashRef = useRef<HTMLDivElement>(null);
  const glowCircleRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const wheelTrackRef = useRef<HTMLDivElement>(null);
  const totemGroupRef = useRef<HTMLDivElement>(null);
  const totemsRef = useRef<(HTMLAnchorElement | null)[]>([]);

  // Scroll-driven preface glow effect
  useEffect(() => {
    const EFFECT_DISTANCE_PX = 450;

    const onScroll = () => {
      const raw = Math.min(1, Math.max(0, window.scrollY / EFFECT_DISTANCE_PX));
      const progress = 1 - Math.pow(1 - raw, 2);

      if (glowCircleRef.current) {
        const scale = 1 + progress * 0.22;
        const glowSpread = 60 + progress * 90;
        glowCircleRef.current.style.transform = `scale(${scale.toFixed(3)})`;
        glowCircleRef.current.style.boxShadow = `0 0 ${glowSpread}px ${10 + progress * 20}px rgba(244,236,216,${0.35 + progress * 0.35})`;
      }

      if (bgWashRef.current) {
        bgWashRef.current.style.opacity = (progress * 0.45).toFixed(3);
      }

      if (scrollCueRef.current) {
        scrollCueRef.current.style.opacity = progress > 0.05 ? '0' : '1';
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Scroll-driven intro wheel
  useEffect(() => {
    const WHEEL_STEP_PX = 300;
    const FADE_MS = 160;
    let currentIndex = 0;

    const onScroll = () => {
      const track = document.querySelector('.wheel-scroll-track');
      if (!track) return;
      const top = track.getBoundingClientRect().top;
      const scrolledIntoTrack = top > 0 ? 0 : -top;
      const index = Math.min(MODULES.length - 1, Math.max(0, Math.floor(scrolledIntoTrack / WHEEL_STEP_PX)));

      if (index !== currentIndex) {
        currentIndex = index;
        setFadingModule(true);
        setTimeout(() => {
          setActiveModule(index);
          setFadingModule(false);
        }, FADE_MS);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Clicking a wheel stop
  const handleWheelStopClick = useCallback((index: number) => {
    setFadingModule(true);
    setTimeout(() => {
      setActiveModule(index);
      setFadingModule(false);
    }, 160);
  }, []);

  // TOC totems
  const handleTotemEnter = useCallback((index: number) => {
    setActiveTotem(index);
    setDisplayLabel(TOTEMS[index].title);
  }, []);

  const handleTotemLeave = useCallback(() => {
    setActiveTotem(null);
    setDisplayLabel('Project');
  }, []);

  // Add "home" class to body
  useEffect(() => {
    document.body.classList.add('home');
    return () => document.body.classList.remove('home');
  }, []);

  const module = MODULES[activeModule];

  return (
    <div className="home-page">
      <div id="bg-wash" ref={bgWashRef} aria-hidden="true"></div>

      <Nav dark fixed />

      {/* ============ 1. PREFACE ============ */}
      <section id="preface">
        <div className="preface-sticky">
          <div className="glow-circle" ref={glowCircleRef}>
            <div className="quote-mark">
              <h2>"Colour that needs<br />no pigment at all."</h2>
              <p className="attribution">— on Diǎn Cuì, and the physics we borrowed from it</p>
            </div>
          </div>
          <div className="scroll-cue" ref={scrollCueRef}><span>scroll</span><span className="chevron"></span></div>
        </div>
      </section>

      {/* ============ 2. INTRO WHEEL ============ */}
      <section id="intro-wheel">
        <div className="wheel-scroll-track" ref={wheelTrackRef}>
          <div className="wheel-sticky">
            <div className="container">
              <div className="eyebrow">Introduction</div>
              <h2>Four modules, one supply chain</h2>
              <div className="wheel-layout">
                <div className="wheel-track" aria-hidden="true">
                  {MODULES.map((m, i) => (
                    <button
                      key={i}
                      className={`wheel-stop ${i === activeModule ? 'active' : ''}`}
                      tabIndex={-1}
                      data-title={m.title}
                      onClick={() => handleWheelStopClick(i)}
                    >
                      <span className="n">{String(i + 1).padStart(2, '0')}</span>
                      <span className="label">{m.title.replace(/^Module \d: /, '')}</span>
                    </button>
                  ))}
                </div>

                <div className="wheel-panel">
                  <div className={`wp-content ${fadingModule ? 'fade-out' : ''}`}>
                    <h3 className="wp-title">{module.title}</h3>
                    <p className="tagline wp-tagline">{module.tagline}</p>
                    <div className="wp-row">
                      <div className="wp-k">What is it</div>
                      <div className="wp-v wp-what">{module.what}</div>
                    </div>
                    <div className="wp-row">
                      <div className="wp-k">Methods</div>
                      <div className="wp-v wp-methods">{module.methods}</div>
                    </div>
                    <div className="wp-row">
                      <div className="wp-k">Consequence</div>
                      <div className="wp-v wp-consequence">{module.consequence}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 3. TABLE OF CONTENTS ============ */}
      <section id="toc">
        <div className="container">
          <div className="eyebrow">Explore the wiki</div>
          <h2>Hover a totem, then step inside</h2>

          <div className="toc-stage">
            <div className="totem-display-wrap">
              <div className="totem-display" aria-hidden="true">
                <div className="totem-display-label">{displayLabel}</div>
              </div>

              <div className={`toc-preview ${activeTotem !== null ? '' : 'idle'}`}>
                <span className="req-badge tp-badge" style={{ display: 'none' }}></span>
                <h3 className="tp-title">{activeTotem !== null ? TOTEMS[activeTotem].title : 'Hover a totem'}</h3>
                <p className="tp-desc">
                  {activeTotem !== null
                    ? TOTEMS[activeTotem].desc
                    : 'Project · Wet Lab · Human Practices · Team: hover one to preview it here.'}
                </p>
                {activeTotem !== null && (
                  <Link className="go tp-link" to={TOTEMS[activeTotem].href}>
                    Open {TOTEMS[activeTotem].title} →
                  </Link>
                )}
              </div>

              <div className="toc-totems" ref={totemGroupRef}>
                {TOTEMS.map((t, i) => (
                  <Link
                    key={t.href}
                    ref={el => { totemsRef.current[i] = el; }}
                    className={`totem ${i === activeTotem ? 'active' : ''}`}
                    to={t.href}
                    aria-label={t.title}
                    onMouseEnter={() => handleTotemEnter(i)}
                    onFocus={() => handleTotemEnter(i)}
                    onMouseLeave={handleTotemLeave}
                    onBlur={handleTotemLeave}
                  >
                    <span className="totem-figure"></span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <RingNav />
    </div>
  );
}
