import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import RingNav from '../components/RingNav';

export default function HumanPractices() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.hash]);

  return (
    <>
      <Nav />
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Human Practices</div>
          <h1>Why Diǎn Cuì, why now</h1>
          <p className="lede">This page is a working scaffold: the framing below is grounded in real historical and material context, but the specific stakeholder conversations, dates, and quotes are placeholders until those activities actually happen. Public engagement and education activities are consolidated at the bottom of this page.</p>
        </div>
      </section>

      <div className="page-body">
        <div className="container">

          <section>
            <h2>The heritage problem</h2>
            <p>Diǎn Cuì (点翠) is a Chinese ornamental craft using kingfisher feathers, prized for a brilliant blue that never fades and inlaid onto metal hairpins, headdresses, and jewelry. That blue is not a dye: it is <em>structural colour</em>, produced by nanoscale keratin architecture in the feather barbs scattering and interfering with light. The craft's popularity historically drove overharvesting of kingfishers, and it is now widely phased out for exactly that reason.</p>
            <p>Our project asks a narrower, more tractable question than "should this craft exist": <strong>can the same physical phenomenon, structural colour from engineered nanostructure, be reproduced without a bird, using waste textile cellulose and a bacterial fermentation process instead?</strong></p>
            <div className="ph-image wide">
              <div className="ph-label">[ Image placeholder ]</div>
              <div className="ph-hint">Historical Diǎn Cuì artifact photo (museum-sourced, credited) alongside our structural-colour film, for direct visual comparison.</div>
            </div>
          </section>

          <section>
            <h2>Integrated Human Practices: the feedback loop we're building</h2>
            <p>Good HP changes the project, not just the write-up. We're structuring stakeholder input around three questions that map directly onto real design decisions in <Link to="/Project-Description.html#design-rationale">Project: Design Rationale</Link>:</p>
            <ol>
              <li><strong>Heritage &amp; craft accuracy:</strong> does our colour target, texture, and mounting style actually read as "Diǎn Cuì" to someone who works with the real material, or does it need adjustment?</li>
              <li><strong>Sustainability claims:</strong> are we actually more sustainable than the alternatives (synthetic dye, plastic-based structural-colour films), or are we trading one environmental cost for another?</li>
              <li><strong>Biosafety &amp; public perception:</strong> how do people outside biology feel about a fashion accessory grown from engineered bacteria and yeast, and what containment/labelling expectations does that raise? See <Link to="/Wet-Lab-Experiments.html#safety">Wet Lab: Biosafety</Link> for the technical side of this.</li>
            </ol>
          </section>

          <section>
            <h2>Stakeholders: planned engagement</h2>
            <div className="ph-row">
              <div className="ph-image square">
                <div className="ph-label">Heritage craft practitioner<br /><span style={{ fontWeight: 400 }}>(Diǎn Cuì / kingfisher-feather conservation)</span></div>
              </div>
              <div className="ph-image square">
                <div className="ph-label">Sustainable-materials researcher<br /><span style={{ fontWeight: 400 }}>(bio-based textiles / CNC films)</span></div>
              </div>
              <div className="ph-image square">
                <div className="ph-label">Fashion / accessories designer<br /><span style={{ fontWeight: 400 }}>(wearability, market fit)</span></div>
              </div>
              <div className="ph-image square">
                <div className="ph-label">Biosafety / public-engagement contact<br /><span style={{ fontWeight: 400 }}>(engineered-organism products)</span></div>
              </div>
            </div>
            <div className="ph-block" style={{ marginTop: '22px' }}>
              <div className="ph-label">TODO: fill in as conversations happen</div>
              <div className="ph-hint">Who we spoke to, when, what they said, and, critically, what we changed in the project as a result. A conversation that didn't change anything isn't integrated HP, it's a citation.</div>
            </div>
          </section>

          <section>
            <h2>Timeline</h2>
            <table>
              <thead>
                <tr><th>Phase</th><th>Activity</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr><td>Early</td><td>Literature review: Diǎn Cuì history, kingfisher conservation status, existing biomimetic structural-colour work</td><td>Done (see <Link to="/Project-Description.html#design-rationale">Project: Design Rationale</Link> references)</td></tr>
                <tr><td>Mid</td><td>Stakeholder interviews (heritage, sustainability, design)</td><td>Planned</td></tr>
                <tr><td>Mid</td><td>Public perception survey: engineered-organism fashion products</td><td>Planned</td></tr>
                <tr><td>Late</td><td>Design revision based on feedback, documented explicitly</td><td>Planned</td></tr>
                <tr><td>Late</td><td>Jamboree demonstration: side-by-side with traditional Diǎn Cuì imagery and plain-pigment controls</td><td>Planned</td></tr>
              </tbody>
            </table>
          </section>

          <section id="public-engagement">
            <h2>Public engagement</h2>
            <p>Reaching people outside the lab, and outside a classroom setting, with what structural colour is and why we're rebuilding Diǎn Cuì's version of it without a bird. Activities below are planned; specifics get filled in as they're delivered.</p>
            <table>
              <thead>
                <tr><th>Audience</th><th>Format</th><th>Core idea</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr><td>General public / jamboree visitors</td><td>Live demo</td><td>Angle-tilt a finished film and watch the colour shift, with no dye involved</td><td>Planned</td></tr>
                <tr><td>Heritage-craft community</td><td>Conversation / exhibit</td><td>What Diǎn Cuì's physics has in common with, and how it differs from, our engineered film</td><td>Planned, ties into the stakeholder work above</td></tr>
              </tbody>
            </table>
            <div className="ph-row" style={{ marginTop: '18px' }}>
              <div className="ph-image square"><div className="ph-label">Outreach event photos</div></div>
            </div>
          </section>

          <section id="education">
            <h2>Education</h2>
            <p>Structural colour is an unusually good teaching entry point: it connects physics (thin-film interference, Bragg reflection), materials science (self-assembly), and synthetic biology in one visually striking phenomenon. Activities below are planned; specifics get filled in as they're delivered.</p>
            <table>
              <thead>
                <tr><th>Audience</th><th>Format</th><th>Core idea</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr><td>Secondary-school students</td><td>Workshop / take-home kit concept</td><td>Build intuition for structural colour with everyday materials (soap film, CDs) before introducing CNC self-assembly</td><td>Planned</td></tr>
                <tr><td>University peers</td><td>Talk / poster</td><td>The engineering-design trade-offs across four interacting modules</td><td>Planned</td></tr>
              </tbody>
            </table>
            <div className="ph-row" style={{ marginTop: '18px' }}>
              <div className="ph-image square"><div className="ph-label">Explainer diagram: structural colour 101</div></div>
              <div className="ph-image square"><div className="ph-label">Workshop worksheet / slide deck</div></div>
            </div>
            <div className="ph-block" style={{ marginTop: '22px' }}>
              <div className="ph-label">TODO</div>
              <div className="ph-hint">Attach finished outreach materials, attendance numbers, and feedback here once activities have run.</div>
            </div>
          </section>

        </div>
      </div>

      <Footer />
      <RingNav />
    </>
  );
}
