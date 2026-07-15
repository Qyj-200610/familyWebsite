import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import RingNav from '../components/RingNav';

export default function AIComputationalMethods() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/Project-Description.html#modelling');
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <Nav />
      <section className="page-hero plain">
        <div className="container">
          <div className="eyebrow">Dry Lab</div>
          <h1>This content now lives on Project, under Model</h1>
          <p className="lede">Modelling, validation, and the engineering cycle are consolidated into the Project page rather than split out separately. Redirecting automatically, or jump there now:</p>
          <p><Link to="/Project-Description.html#modelling" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Project → Model →</Link></p>
        </div>
      </section>
      <Footer />
      <RingNav />
    </>
  );
}
