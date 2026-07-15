import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import RingNav from '../components/RingNav';

export default function AIEthicsSafety() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/Wet-Lab-Experiments.html#safety');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <Nav />
      <section className="page-hero plain">
        <div className="container">
          <div className="eyebrow">AI Ethics &amp; Safety</div>
          <h1>This content now lives on Wet Lab</h1>
          <p className="lede">Biocontainment (kill-switch design + validation protocol) and our AI-use disclosure are consolidated into the Wet-Lab page rather than split out separately. Redirecting automatically, or jump there now:</p>
          <p><Link to="/Wet-Lab-Experiments.html#safety" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Wet Lab → Biosafety &amp; Responsible AI Use →</Link></p>
        </div>
      </section>
      <Footer />
      <RingNav />
    </>
  );
}
