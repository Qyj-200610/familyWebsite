import { Link } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import RingNav from '../components/RingNav';
import './Attributions.css';

function PlaceholderTeamCards({ count, role }: { count: number; role: string }) {
  return (
    <div className="team-grid">
      {Array.from({ length: count }, (_, i) => (
        <div className="team-card" key={i}>
          <div className="photo-ph">Photo</div>
          <div className="name-plate">
            <div className="tc-name">Team Member</div>
            <div className="tc-role">{role}</div>
          </div>
          <div className="info-overlay">
            <div className="tc-name2">Team Member {i + 1}</div>
            <div className="tc-role2">{role}</div>
            <div className="tc-k">Contribution</div>
            <div className="tc-v">TODO: one or two sentences on what this person actually did.</div>
            <div className="tc-k">What others say</div>
            <div className="tc-v quote">TODO: a short peer quote.</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const DRY_LAB_MEMBERS = [
  { name: 'Dry Lab Member 1', role: 'Optical Modelling', role2: 'Optical Modelling', contribution: 'Bragg reflection / TMM / inverse-design work. See Dry Lab §1.' },
  { name: 'Dry Lab Member 2', role: 'Optical Modelling', role2: 'Optical Modelling', contribution: 'Bragg reflection / TMM / inverse-design work. See Dry Lab §1.' },
  { name: 'Dry Lab Member 3', role: 'Synbio Modelling', role2: 'Synthetic-Biology Modelling', contribution: 'Enzyme kinetics, FBA, RBS-strength design. See Dry Lab §2.' },
  { name: 'Dry Lab Member 4', role: 'Synbio Modelling', role2: 'Synthetic-Biology Modelling', contribution: 'Enzyme kinetics, FBA, RBS-strength design. See Dry Lab §2.' },
  { name: 'Dry Lab Member 5', role: 'Synbio Modelling', role2: 'Synthetic-Biology Modelling', contribution: 'Enzyme kinetics, FBA, RBS-strength design. See Dry Lab §2.' },
  { name: 'Dry Lab Member 6', role: 'Protein Modelling', role2: 'Protein Modelling', contribution: 'refCBA MD simulation, NCD analysis, π–π stacking, electrostatics. See Dry Lab §3.' },
  { name: 'Dry Lab Member 7', role: 'Protein Modelling', role2: 'Protein Modelling', contribution: 'refCBA MD simulation, NCD analysis, π–π stacking, electrostatics. See Dry Lab §3.' },
];

export default function Attributions() {
  return (
    <>
      <Nav />
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Attributions</div>
          <h1>Who built what</h1>
          <p className="lede">Hover (or tap, on touch devices) any card to see that person's contribution and peer feedback. Photos and names below are placeholders; the seven Dry-Lab cards carry real, non-anonymized contribution text pulled directly from the modelling document, with names withheld pending the team's decision on public attribution.</p>
        </div>
      </section>

      <div className="page-body">
        <div className="container">

          <section>
            <h2>Wet Lab <span className="credit-tag">10 members</span></h2>
            <p className="section-note">Placeholder cards: swap in real names, photos, roles and contributions.</p>
            <PlaceholderTeamCards count={10} role="Wet Lab" />
          </section>

          <section>
            <h2>Dry Lab <span className="credit-tag">7 members</span></h2>
            <p className="section-note">These seven contributions are real, pulled from the computational-methods document's per-section credits (see <Link to="/Project-Description.html#modelling">Project: Model</Link>); names are anonymized here pending the team's decision on public attribution. Note: this is 7 people, not the 4 originally quoted, which is worth reconciling with the actual roster.</p>
            <div className="team-grid">
              {DRY_LAB_MEMBERS.map((m, i) => (
                <div className="team-card" key={i}>
                  <div className="photo-ph">Photo</div>
                  <div className="name-plate">
                    <div className="tc-name">{m.name}</div>
                    <div className="tc-role">{m.role}</div>
                  </div>
                  <div className="info-overlay">
                    <div className="tc-name2">{m.name}</div>
                    <div className="tc-role2">{m.role2}</div>
                    <div className="tc-k">Contribution</div>
                    <div className="tc-v">{m.contribution}</div>
                    <div className="tc-k">What others say</div>
                    <div className="tc-v quote">TODO: add peer feedback</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>Human Practices <span className="credit-tag">6 members</span></h2>
            <p className="section-note">Placeholder cards.</p>
            <PlaceholderTeamCards count={6} role="Human Practices" />
          </section>

          <section>
            <h2>Advisors <span className="credit-tag">3</span></h2>
            <PlaceholderTeamCards count={3} role="Advisor" />
          </section>

          <section>
            <h2>Principal Investigators <span className="credit-tag">2</span></h2>
            <PlaceholderTeamCards count={2} role="Principal Investigator" />
          </section>

          <section id="verifiability">
            <h2>Verifiability</h2>
            <p>A claim only counts if someone outside the team could reproduce it. This section collects, in one place, exactly what we're releasing and where: protocols, raw data, analysis code, and registry parts.</p>

            <h3>What's reproducible right now</h3>
            <table>
              <thead>
                <tr><th>Artifact</th><th>Where it lives</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr><td>Full bench protocols, all four modules</td><td><Link to="/Wet-Lab-Experiments.html">Wet Lab</Link></td><td>Published on wiki</td></tr>
                <tr><td>Live notebook entries</td><td><Link to="/Wet-Lab-Experiments.html#notebook">Wet Lab: Live notebook</Link></td><td>Updated as experiments run</td></tr>
                <tr><td>Modelling methods &amp; tool versions</td><td><Link to="/Project-Description.html#modelling">Project: Model</Link></td><td>Published on wiki</td></tr>
                <tr><td>Analysis / simulation code</td><td>Repository link: <span style={{ background: 'var(--ph-bg)', border: '1px dashed var(--ph-border)', borderRadius: '4px', padding: '2px 10px' }}>TODO: add GitHub link</span></td><td>Pending release</td></tr>
                <tr><td>Raw characterization data</td><td>Data repository link: <span style={{ background: 'var(--ph-bg)', border: '1px dashed var(--ph-border)', borderRadius: '4px', padding: '2px 10px' }}>TODO: add link</span></td><td>Pending release</td></tr>
                <tr><td>Registry parts &amp; sequences</td><td><Link to="/Wet-Lab-Experiments.html#parts">Wet Lab: Parts</Link></td><td>In progress</td></tr>
              </tbody>
            </table>

            <h3>How to reproduce a result end-to-end</h3>
            <ol>
              <li>Start from <Link to="/Project-Description.html#design-rationale">Project: Design Rationale</Link> to understand <em>why</em> a route was chosen over its alternative.</li>
              <li>Follow the matching protocol on <Link to="/Wet-Lab-Experiments.html">Wet Lab</Link>, where every buffer recipe, DOE matrix, and instrument setting is listed exactly as run.</li>
              <li>Cross-check any modelled prediction on <Link to="/Project-Description.html#modelling">Project: Model</Link>, where tool name, package, and difficulty are all listed so the computational side can be re-run independently.</li>
              <li>Compare your result against our pass/fail criteria on <Link to="/Wet-Lab-Experiments.html#validation">Wet Lab: Validation Checkpoints</Link> and <Link to="/Project-Description.html#validation">Project: Results</Link>.</li>
            </ol>

            <h3>Data &amp; code release plan</h3>
            <div className="ph-block">
              <div className="ph-label">TODO</div>
              <div className="ph-hint">Confirm hosting (GitHub repo for code, Zenodo/OSF or similar for raw data + DOI), licensing, and the release timeline before the wiki freeze deadline.</div>
            </div>

            <h3>Standards followed</h3>
            <ul>
              <li>All plasmid maps and part sequences will be submitted to the iGEM Registry; see <Link to="/Wet-Lab-Experiments.html#parts">Wet Lab: Parts</Link>.</li>
              <li>Characterization follows standard instrument protocols noted inline (e.g. integrating-sphere UV-Vis, Segal-method XRD crystallinity, Malvern DLS/Zeta) so results are comparable to literature values cited on <Link to="/Project-Description.html#design-rationale">Project: Design Rationale</Link>.</li>
            </ul>
          </section>

          <section>
            <h2>Software, tools &amp; external resources</h2>
            <p>Attribution for every third-party tool, package, model, or dataset used; expand as items are finalized.</p>
            <table>
              <thead>
                <tr><th>Resource</th><th>Used for</th></tr>
              </thead>
              <tbody>
                <tr><td>iYali4 (BiGG Models)</td><td><em>Y. lipolytica</em> genome-scale metabolic model: Dry Lab §2.6, §2.8.3</td></tr>
                <tr><td>iML1515 (BiGG Models)</td><td><em>E. coli</em> genome-scale metabolic model: Dry Lab §2.8.1</td></tr>
                <tr><td>De Novo DNA RBS Calculator (salislab.net)</td><td>RBS translation-strength prediction: Dry Lab §2.7</td></tr>
                <tr><td>CIDER (pappulab.wustl.edu)</td><td>IDP charge/hydropathy analysis: Dry Lab §3.3</td></tr>
                <tr><td>APBS</td><td>Electrostatic surface potential mapping: Dry Lab §3.5</td></tr>
                <tr><td>AlphaFold2</td><td>Initial protein structure prediction ahead of MD: Dry Lab §3.1</td></tr>
                <tr><td>COBRApy, SALib, MDTraj/MDAnalysis, scikit-optimize/BoTorch, tmm, miepython/PyMieScatt</td><td>Modelling toolchain: see <Link to="/Project-Description.html#modelling">Project: Model</Link> for per-model tool listings</td></tr>
              </tbody>
            </table>
          </section>

        </div>
      </div>

      <Footer />
      <RingNav />
    </>
  );
}
