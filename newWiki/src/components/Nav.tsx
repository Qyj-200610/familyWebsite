import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';

interface NavProps {
  dark?: boolean;
  fixed?: boolean;
}

export default function Nav({ dark = false, fixed = false }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  const currentPage = location.pathname.split('/').pop() || '';

  const isActive = (path: string) => {
    const target = path.split('/').pop();
    return target === currentPage || (currentPage === '' && path === 'index.html');
  };

  const isDropdownActive = (paths: string[]) => {
    return paths.some(p => isActive(p));
  };

  const handleDropdownClick = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setOpenDropdown(null);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const navClass = [
    'site-nav',
    dark ? 'on-dark' : '',
    fixed ? 'home-topbar' : '',
  ].filter(Boolean).join(' ');

  const overlayClass = [
    'mobile-nav-overlay',
    dark ? 'on-dark' : '',
  ].filter(Boolean).join(' ');

  const dropItems = {
    project: [
      { href: '/Project-Description.html', icon: '🧵', title: 'Project Description', sub: 'Pipeline & four modules' },
      { href: '/Project-Description.html#modelling', icon: '📈', title: 'Model', sub: 'Optical, synbio & protein modelling' },
      { href: '/Project-Description.html#engineering-cycle', icon: '🔁', title: 'Engineering', sub: 'The DBTL loop, worked example' },
      { href: '/Project-Description.html#validation', icon: '📊', title: 'Results', sub: 'Model vs. wet-lab cross-checks' },
      { href: '/Project-Description.html#applications', icon: '💍', title: 'Applications', sub: 'Wearable prototypes & extensions' },
      { href: '/Project-Description.html#contribution', icon: '🧩', title: 'Contribution', sub: 'Parts, protocols & open models' },
    ],
    lab: [
      { href: '/Wet-Lab-Experiments.html', icon: '🧪', title: 'Experiments', sub: 'Bench protocols, module by module' },
      { href: '/Wet-Lab-Experiments.html#notebook', icon: '📓', title: 'Notebook', sub: 'Live, dated entries' },
      { href: '/Wet-Lab-Experiments.html#parts', icon: '🧩', title: 'Part Collection', sub: 'Registry parts used' },
      { href: '/Wet-Lab-Experiments.html#safety', icon: '🛡️', title: 'Safety', sub: 'Biocontainment & AI use' },
    ],
    hp: [
      { href: '/Human-Practices.html', icon: '🤝', title: 'Human Practices', sub: 'Why Diǎn Cuì, why now' },
      { href: '/Human-Practices.html#public-engagement', icon: '🗣️', title: 'Public Engagement', sub: 'Jamboree & heritage-craft outreach' },
      { href: '/Human-Practices.html#education', icon: '🎓', title: 'Education', sub: 'Workshops & school outreach' },
    ],
  };

  const mobileMenu = (
    <div className={overlayClass} onClick={(e) => { if (e.target === e.currentTarget) closeMenu(); }}>
      <div className="mobile-nav-panel">
        <button className="mobile-nav-close" type="button" onClick={closeMenu} aria-label="Close menu">← back</button>
        <Link to="/" className={currentPage === '' ? 'active' : ''} onClick={closeMenu}>Home</Link>

        <div className={`nav-dropdown ${openDropdown === 'project' ? 'open' : ''}`}>
          <button
            className={`nav-drop-trigger ${isDropdownActive(['Project-Description.html']) ? 'active' : ''}`}
            type="button"
            onClick={() => handleDropdownClick('project')}
          >
            Project
          </button>
          <div className="nav-drop-menu">
            {dropItems.project.map(item => (
              <Link key={item.href} className="nav-drop-item" to={item.href} onClick={() => { setOpenDropdown(null); closeMenu(); }}>
                <span className="ndi-icon">{item.icon}</span>
                <span className="ndi-text">
                  <span className="ndi-title">{item.title}</span>
                  <span className="ndi-sub">{item.sub}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className={`nav-dropdown ${openDropdown === 'lab' ? 'open' : ''}`}>
          <button
            className={`nav-drop-trigger ${isDropdownActive(['Wet-Lab-Experiments.html']) ? 'active' : ''}`}
            type="button"
            onClick={() => handleDropdownClick('lab')}
          >
            Lab
          </button>
          <div className="nav-drop-menu">
            {dropItems.lab.map(item => (
              <Link key={item.href} className="nav-drop-item" to={item.href} onClick={() => { setOpenDropdown(null); closeMenu(); }}>
                <span className="ndi-icon">{item.icon}</span>
                <span className="ndi-text">
                  <span className="ndi-title">{item.title}</span>
                  <span className="ndi-sub">{item.sub}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className={`nav-dropdown ${openDropdown === 'hp' ? 'open' : ''}`}>
          <button
            className={`nav-drop-trigger ${isDropdownActive(['Human-Practices.html']) ? 'active' : ''}`}
            type="button"
            onClick={() => handleDropdownClick('hp')}
          >
            Human Practices
          </button>
          <div className="nav-drop-menu">
            {dropItems.hp.map(item => (
              <Link key={item.href} className="nav-drop-item" to={item.href} onClick={() => { setOpenDropdown(null); closeMenu(); }}>
                <span className="ndi-icon">{item.icon}</span>
                <span className="ndi-text">
                  <span className="ndi-title">{item.title}</span>
                  <span className="ndi-sub">{item.sub}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <Link to="/Attributions.html" className={isActive('Attributions.html') ? 'active' : ''} onClick={closeMenu}>Team</Link>
      </div>
    </div>
  );

  return (
    <>
      <header className={navClass} ref={navRef} style={fixed ? { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 501 } : {}}>
        <div className="container">
          <Link className="brand" to="/"><span className="swatch"></span> 点翠 · Diǎn Cuì</Link>
          <button className="nav-toggle" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : 'Menu'}
          </button>
          <nav>
            <Link to="/" className={currentPage === '' ? 'active' : ''} onClick={closeMenu}>Home</Link>

            <div className={`nav-dropdown ${openDropdown === 'project' ? 'open' : ''}`}>
              <button
                className={`nav-drop-trigger ${isDropdownActive(['Project-Description.html']) ? 'active' : ''}`}
                type="button"
                onClick={() => handleDropdownClick('project')}
              >
                Project
              </button>
              <div className="nav-drop-menu">
                {dropItems.project.map(item => (
                  <Link key={item.href} className="nav-drop-item" to={item.href} onClick={() => { setOpenDropdown(null); closeMenu(); }}>
                    <span className="ndi-icon">{item.icon}</span>
                    <span className="ndi-text">
                      <span className="ndi-title">{item.title}</span>
                      <span className="ndi-sub">{item.sub}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className={`nav-dropdown ${openDropdown === 'lab' ? 'open' : ''}`}>
              <button
                className={`nav-drop-trigger ${isDropdownActive(['Wet-Lab-Experiments.html']) ? 'active' : ''}`}
                type="button"
                onClick={() => handleDropdownClick('lab')}
              >
                Lab
              </button>
              <div className="nav-drop-menu">
                {dropItems.lab.map(item => (
                  <Link key={item.href} className="nav-drop-item" to={item.href} onClick={() => { setOpenDropdown(null); closeMenu(); }}>
                    <span className="ndi-icon">{item.icon}</span>
                    <span className="ndi-text">
                      <span className="ndi-title">{item.title}</span>
                      <span className="ndi-sub">{item.sub}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className={`nav-dropdown ${openDropdown === 'hp' ? 'open' : ''}`}>
              <button
                className={`nav-drop-trigger ${isDropdownActive(['Human-Practices.html']) ? 'active' : ''}`}
                type="button"
                onClick={() => handleDropdownClick('hp')}
              >
                Human Practices
              </button>
              <div className="nav-drop-menu">
                {dropItems.hp.map(item => (
                  <Link key={item.href} className="nav-drop-item" to={item.href} onClick={() => { setOpenDropdown(null); closeMenu(); }}>
                    <span className="ndi-icon">{item.icon}</span>
                    <span className="ndi-text">
                      <span className="ndi-title">{item.title}</span>
                      <span className="ndi-sub">{item.sub}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/Attributions.html" className={isActive('Attributions.html') ? 'active' : ''} onClick={closeMenu}>Team</Link>
          </nav>
        </div>
      </header>

      {menuOpen && createPortal(mobileMenu, document.body)}
    </>
  );
}
