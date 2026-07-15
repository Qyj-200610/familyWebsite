import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NODES = [
  { href: '/', label: 'Home', pos: 'pos-top' },
  { href: '/Project-Description.html', label: 'Project', pos: 'pos-upper-left' },
  { href: '/Human-Practices.html', label: 'Human Practices', pos: 'pos-upper-right' },
  { href: '/Wet-Lab-Experiments.html', label: 'Lab', pos: 'pos-lower-left' },
  { href: '/Attributions.html', label: 'Team', pos: 'pos-lower-right' },
];

export default function RingNav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const ringRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const currentPath = location.pathname;

  const openRing = () => {
    setOpen(true);
    setTimeout(() => {
      const firstNode = ringRef.current?.querySelector('.ring-node') as HTMLElement;
      firstNode?.focus();
    }, 100);
  };

  const closeRing = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) closeRing();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        className="ring-nav-trigger"
        id="ringNavTrigger"
        type="button"
        aria-label="Open site navigator"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openRing}
      >
        <span className="rnt-dot"></span>
      </button>

      <div
        ref={ringRef}
        className={`ring-nav ${open ? 'open' : ''}`}
        id="ringNav"
        role="dialog"
        aria-modal="true"
        aria-label="Site navigator"
        aria-hidden={!open}
        onClick={(e) => { if (e.target === ringRef.current) closeRing(); }}
      >
        <button
          className="ring-nav-close"
          id="ringNavClose"
          type="button"
          aria-label="Close navigator"
          onClick={closeRing}
        >
          &times;
        </button>

        <div className="ring-nav-stage">
          <div className="ring-nav-circle"></div>
          <div className="ring-nav-center">
            <div className="rnc-brand"><span className="swatch"></span> 点翠 · Diǎn Cuì</div>
            <p className="rnc-tagline">"Colour that needs no pigment at all."</p>
            <p className="rnc-hint">Select a node on the ring to explore the wiki.</p>
          </div>

          {NODES.map(node => (
            <Link
              key={node.href}
              className={`ring-node ${node.pos} ${currentPath === node.href ? 'active' : ''}`}
              to={node.href}
              onClick={closeRing}
            >
              <span className="rn-dot"></span>
              <span className="rn-label">{node.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
