import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container">
        <div>© {year} Team Diǎn Cuì · iGEM</div>
        <div>
          <Link to="/Attributions.html">Attributions</Link>
          {' · '}
          <Link to="/Wet-Lab-Experiments.html#safety">AI &amp; Safety</Link>
        </div>
      </div>
    </footer>
  );
}
