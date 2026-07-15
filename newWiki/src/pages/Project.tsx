import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import RingNav from '../components/RingNav';
import './Project.css';

export default function Project() {
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
          <div className="eyebrow">Project</div>
          <h1>From waste cotton to wearable structural color</h1>
          <p className="lede">
            Diǎn Cuì (点翠) is a centuries-old Chinese craft that inlaid kingfisher feathers for their brilliant, iridescent blue.
            That colour comes from nanostructure, not pigment, and the craft's popularity historically cost thousands of birds their feathers.
            We are engineering a cruelty-free, biology-made replacement for that same physics, built entirely from waste textile cellulose.
            This page covers what we're building, why each route was chosen over its alternatives, the modelling behind those choices, and where the work is headed next.
          </p>
        </div>
      </section>

      <div className="page-body">
        <div className="container">
          {/* The pipeline */}
          <section>
            <h2>The pipeline, in one line</h2>
            <p>Waste cotton fabric → glucose → bacterial cellulose (BC) → cellulose nanocrystal (CNC) iridescent film → an optional reflectin-nanoparticle layer for extra, tunable structural color → a wearable photonic accessory.</p>
            <div className="ph-image wide">
              <div className="ph-label">[ Image placeholder ]</div>
              <div className="ph-hint">Hero photo or diagram of the full pipeline: waste cotton swatch, BC pellicle, iridescent film, finished accessory, side by side.</div>
            </div>
          </section>

          {/* Why Diǎn Cuì */}
          <section>
            <h2>Why Diǎn Cuì</h2>
            <p>Traditional Diǎn Cuì's colour isn't a dye. It is <em>structural colour</em>: nanoscale keratin structures in kingfisher barbules scatter and interfere with light to produce a saturated blue that never fades. We are rebuilding that same principle synthetically, using a cellulose nanocrystal chiral-nematic film as the structural-colour layer and an engineered squid reflectin as an optional second layer of tunability. See <Link to="/Human-Practices.html">Human Practices</Link> for the stakeholder conversations that shaped this framing.</p>
          </section>

          {/* Four modules */}
          <section>
            <h2>Four modules, one supply chain</h2>
            <p>The project is organised as four modules that build on each other upstream-to-downstream, with two of them able to run independently as a fallback story if the more ambitious modules fall behind schedule.</p>

            <h3>Module 1: Cellulose recovery <span className="credit-tag">upstream · safety-net</span></h3>
            <p>A four-enzyme cocktail (Cel5A, Cel6B, BglC, LPMO10A, all from <em>Thermobifida fusca</em> YX) degrades waste cotton fabric into glucose in <em>E. coli</em> BL21(DE3), carried on two co-transformed plasmids. This is both the project's feedstock and its safety net, since on its own it already tells a complete "waste to sugar" story.</p>

            <h3>Module 2: Pigment-cellulose film <span className="credit-tag">midstream · undertone</span></h3>
            <p>An engineered indigo pathway (tnaA + FMO, tryptophan → indole → indigo) in <em>E. coli</em> feeds leuco-indigo into <em>Komagataeibacter xylinus</em> cellulose during fermentation. The resulting blue-violet undertone suppresses stray wavelengths and boosts the saturation of the structural-colour layers above it, playing the same role the dark lacquer base plays under real Diǎn Cuì feathers.</p>

            <h3>Module 3: CNC iridescent film <span className="credit-tag">core structural colour</span></h3>
            <p>Bacterial cellulose is hydrolysed into cellulose nanocrystals (CNC), either with 64% H₂SO₄ or, more sustainably, with the Module 1 Cel5A enzyme acting only on the amorphous regions. Evaporation-induced self-assembly (EISA) then lets the CNC rods spontaneously form a chiral-nematic liquid crystal whose helical pitch Bragg-reflects a single, angle-dependent colour. This is the project's primary source of structural colour and, together with Modules 1–2, forms a complete fallback storyline: <em>waste cotton → BC → CNC iridescent film → wearable accessory</em>.</p>

            <h3>Module 4: Reflectin layer <span className="credit-tag">innovation layer</span></h3>
            <p>The most ambitious module. A truncated squid reflectin fragment, refCBA (from <em>Euprymna scolopes</em> reflectin 1a), is secreted by <em>Yarrowia lipolytica</em> and self-assembles into ~30 nm nanoparticles under pH/salt control, the same electrostatic-switch mechanism cephalopods use to dynamically tune their skin colour. Those nanoparticles are infused into the pre-formed CNC film, adding a second, independently tunable structural-colour contribution.</p>

            <div className="callout fallback">
              <p><strong>Fallback logic.</strong> Modules 2 and 3 can run in parallel; Module 4 depends on the CNC film from Module 3. If Module 4's protein-assembly work runs behind, Modules 1–3 alone already close the loop: <em>waste cellulose → BC → CNC iridescent film → wearable accessory</em>. See the design rationale below for the full engineering logic.</p>
            </div>
          </section>

          {/* Design Rationale */}
          <section id="design-rationale">
            <h2>Design rationale: why we built it this way</h2>
            <p>Every chassis, plasmid, and route choice below was made against a specific alternative. The wet-bench steps live on <Link to="/Wet-Lab-Experiments.html">Wet Lab</Link>; the DBTL loop that revised some of these decisions lives further down this page, under <a href="#engineering-cycle">Engineering Cycle</a>.</p>

            <h3>Module 1: one gene, two jobs</h3>
            <p>Cel5A is an endoglucanase used in <em>two different strains for two different purposes</em>, a deliberate design choice rather than a duplication.</p>
            <table>
              <thead>
                <tr><th>Strain</th><th>Construct</th><th>Role</th></tr>
              </thead>
              <tbody>
                <tr><td>Strain A (degradation)</td><td>BL21 + pET-Cel5A + pCDF-Cel6B-BglC(-LPMO10A)</td><td>Full enzyme cocktail acting in concert; complete degradation of waste cotton to glucose</td></tr>
                <tr><td>Strain B (CNC prep)</td><td>BL21 + pET-Cel5A only</td><td>Endoglucanase alone, selectively hydrolyses the <em>amorphous</em> regions of bacterial cellulose while leaving the crystalline core intact, yielding CNC directly</td></tr>
              </tbody>
            </table>
            <p>Running the same gene in two roles keeps the part count low while giving Module 3 a greener alternative to acid hydrolysis (see below).</p>

            <h3>Module 2: three ways to load pigment</h3>
            <p>Indigo's absorption maximum (≈610–620 nm, orange-red) is complementary to our blue-green target, so even a small amount meaningfully boosts perceived saturation. Three loading strategies were designed, in priority order.</p>
            <ol>
              <li><strong>Strategy A, in-situ leuco-indigo (primary).</strong> Indigo is reduced to water-soluble leuco-indigo with Na₂S₂O₄, added directly to the HS growth medium, and diffuses into the bacterial-cellulose network as it forms; harvesting and air exposure re-oxidises it in place, giving uniform in-fibre colour.</li>
              <li><strong>Strategy B, post-hoc soak adsorption (backup).</strong> A purified BC membrane is soaked in leuco-indigo solution and then oxidised. Simpler, but less uniform than in-situ loading.</li>
              <li><strong>Strategy C, co-expression.</strong> Pigment and cellulose synthesis genes expressed simultaneously in one <em>K. xylinus</em> strain. The most elegant option, held as a stretch goal.</li>
            </ol>

            <h3>Module 3: enzymatic vs. acid CNC, and why yield matters first</h3>
            <h4 className="project-h4">Two hydrolysis routes</h4>
            <table>
              <thead>
                <tr><th></th><th>Route 1: Cel5A enzymatic (preferred)</th><th>Route 2: 64% H₂SO₄ acid (baseline)</th></tr>
              </thead>
              <tbody>
                <tr><td>Conditions</td><td>37–50 °C aqueous buffer</td><td>64% w/w H₂SO₄, 45 °C</td></tr>
                <tr><td>Safety</td><td>Aqueous, mild</td><td>Concentrated hot acid</td></tr>
                <tr><td>Environmental footprint</td><td>Biodegradable enzyme, no acid waste stream</td><td>Acid neutralisation waste</td></tr>
                <tr><td>Selectivity</td><td>Preferentially clears amorphous regions</td><td>Less selective</td></tr>
                <tr><td>Process fit</td><td>Can chain directly onto BC fermentation as one continuous bioprocess</td><td>Separate unit operation</td></tr>
              </tbody>
            </table>
            <p>The acid route is retained as the literature-standard baseline and control for characterisation comparisons, but the enzymatic route is the one we are trying to make work end-to-end.</p>

            <h4>BC yield comes before film quality</h4>
            <p>Bacterial-cellulose titre is optimised first via a synthetic RBS library (targeting <em>pgm</em>, <em>galU</em>, <em>ndp</em>) screened by FACS. A key design constraint comes from <strong>Hur et al. 2020</strong>: the strongest RBS variant (R6) actually <em>reduced</em> BC output because it drove Ndp into insoluble inclusion bodies. More translation isn't always better. A mid-strength RBS (R15, 5′-TAATGAGAGGCC-3′) was optimal across all three genes, which is why our library screen targets a <em>range</em> of RBS strengths rather than maximising each one.</p>

            <h3>Module 4: why reflectin, and why <em>Yarrowia lipolytica</em></h3>
            <h4 className="project-h4">Why reflectin</h4>
            <ul>
              <li><strong>Proven photonic function:</strong> in cephalopod iridophores, reflectin forms periodic lamellar assemblies that produce tunable Bragg reflection.</li>
              <li><strong>Engineering-friendly:</strong> reflectin is an intrinsically disordered protein (IDP) with no fixed tertiary structure, which tolerates sequence modification far better than a folded protein would.</li>
              <li><strong>Tunable by design:</strong> assembly is triggered by charge neutralisation (pH, ionic strength) and aromatic interactions (imidazole, π–π stacking), giving several independent experimental handles for tuning it.</li>
              <li><strong>Designable sequence:</strong> a conserved octapeptide motif (G-X-M-X-D-X-X-X) hints at a modular repeat architecture that is amenable to truncation and domain-swap experiments.</li>
            </ul>
            <h4>Why a secretion host instead of the usual inclusion-body route</h4>
            <p>Every published recombinant reflectin has been produced either as <em>E. coli</em> inclusion bodies (6 M GdnHCl solubilisation plus dialysis refolding) or in HEK-293 cells, both slow, denaturant-heavy pipelines. Our lab already has a working <em>Y. lipolytica</em> secretion-expression platform, so we route refCBA (~7 kDa, the C+B+A tri-domain fragment of <em>Euprymna scolopes</em> reflectin 1a, ~64 aa, previously shown by <strong>Dennis et al. 2017</strong> to self-assemble and scatter light) through <em>Y. lipolytica</em> Po1f under a pTEF-SP2 secretion construct instead, trading a denaturant-refolding step for a secretion and concentration step.</p>

            <h4>Five protein-engineering directions</h4>
            <ol>
              <li><strong>Truncation series.</strong> refCBA (~64 aa) vs. refB (~25 aa, B-domain only) vs. the 8-aa YMDMSGYQ protopeptide (Dias et al. 2023) vs. full-length RfA1 (350 aa, positive control), used to find the minimal self-assembling unit.</li>
              <li><strong>Two-domain split design.</strong> Separates a self-assembly domain (refSAD = refCBA) from a cellulose-binding domain (refCBD, a positively-charged short peptide or CBM fragment) with a flexible GGGGS×3 linker, so pH-triggered assembly and CNC-surface electrostatic binding (Zeta ≈ −36 mV) can be engineered independently instead of competing.</li>
              <li><strong>pH / salt gradient tuning.</strong> Exploits the assembly's reversibility (Levenson et al. 2016) to build a pH 4.0–7.5 × [NaCl] 0–500 mM assembly-state and optical-response calibration curve.</li>
              <li><strong>MD-guided design.</strong> All-atom MD reproduces the assembly-critical residues found by Umerani et al. (2020); coarse-grained colloidal MD reproduces the SA–LR phase-diagram model of Huang et al. (2024). Modelling results feed directly back into the wet-lab DOE (see <a href="#modelling">Model</a>).</li>
              <li><strong>Mutant panel.</strong> refCBA-6E (six inserted Glu residues, reduces net positive charge to promote assembly, reproducing Levenson 2019); refCBA-RR (N-terminal di-arginine tag for stronger CNC adsorption); refCBA-CBD (fused cellulose-binding domain for directed CNC binding).</li>
            </ol>

            <h3>Integration: why we don't just mix the two suspensions</h3>
            <p>The literature is fairly blunt about this: directly blending a positively-charged protein with negatively-charged CNC causes micron-scale electrostatic aggregation that destroys the chiral-nematic structural-colour order (<strong>De France 2020</strong>, <strong>Severini 2022</strong>). Our workaround lets the reflectin fold first.</p>
            <div className="callout">
              <p>Reflectin nanoparticles are pre-assembled under pH/salt control (~30 nm, Levenson 2016) <em>before</em> ever meeting the CNC film. Once folded, most of the positively-charged residues are buried inside the nanoparticle by π–π and hydrophobic interactions, so the exposed surface charge density is far too low to trigger bulk aggregation.</p>
            </div>
            <table>
              <thead>
                <tr><th>Route</th><th>Approach</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>A, sequential deposition</strong></td><td>Pre-form the CNC film by EISA → dialyse secreted protein to pH 4.0 + 150 mM NaCl to trigger nanoparticle formation → soak the CNC film in the nanoparticle suspension</td><td>Recommended, following the general "protein-infusion into a pre-formed CNC template" platform established by Bast et al. (2021)</td></tr>
                <tr><td><strong>B, low-loading co-assembly</strong></td><td>Reflectin nanoparticles blended at &lt;5 wt% into the CNC suspension before a single EISA run</td><td>Backup, only if Route A fails</td></tr>
              </tbody>
            </table>

            <h3>Modelling shaped these choices too</h3>
            <p>Optical modelling (Berreman 4×4 and de Vries equation, Mie scattering, transfer-matrix method) and synthetic-biology modelling (enzyme kinetics, flux-balance analysis, amino-acid supply and demand for refCBA secretion) ran alongside the wet-lab design decisions above, not after them. Full detail is under <a href="#modelling">Model</a>.</p>

            <h3>Safety by design</h3>
            <p>All engineered chassis carry a temperature-controlled kill switch (cI857/λPR → mazF) from the outset. See <Link to="/Wet-Lab-Experiments.html#safety">Wet Lab, Biosafety</Link> for the containment-validation data.</p>
          </section>

          {/* Model */}
          <section id="modelling">
            <h2>Model</h2>
            <p>Three modelling tracks (optical, synthetic-biology, protein), the sensitivity analysis that ties every model back to a wet-lab decision, cross-checks against real data, and the DBTL loop that came out of one of those cross-checks failing. The design decisions these fed into are documented above, under <a href="#design-rationale">Design Rationale</a>.</p>

            <h3>Optical modelling</h3>
            <div className="credit-tags"><span className="credit-tag">Dry Lab Member 1</span><span className="credit-tag">Dry Lab Member 2</span></div>

            <h4>1.1 CNC chiral-nematic Bragg reflection simulation</h4>
            <p><strong>Theory:</strong> Berreman 4×4 matrix method / de Vries equation. <strong>Inputs:</strong> helical pitch P, average refractive index n_avg = 1.55, incidence angle θ, film thickness d. <strong>Outputs:</strong> reflectance spectrum R(λ), CIE (L*, a*, b*) coordinates. <strong>Explored range:</strong> pitch P 250–800 nm, [NaCl] 0–15 mM, incidence angle 0–60°.</p>
            <p className="tool-line">Tools: Python numpy / scipy &nbsp;|&nbsp; Difficulty: ★★★</p>

            <h4>1.2 Reflectin nanoparticle Mie-scattering model</h4>
            <p><strong>Theory:</strong> Mie scattering + coherent scattering. <strong>Inputs:</strong> particle-size distribution (~20–50 nm), refractive-index contrast Δn, packing density φ. <strong>Outputs:</strong> scattering spectrum, angle dependence. <strong>Key question:</strong> can Mie scattering alone generate enough reflectance in the visible band?</p>
            <p className="tool-line">Tools: Python miepython / PyMieScatt &nbsp;|&nbsp; Difficulty: ★★</p>

            <h4>1.3 Composite-film transfer-matrix method (TMM)</h4>
            <p>A three-layer system (indigo-BC absorbing base + CNC chiral-nematic layer + reflectin scattering layer), each with its own complex refractive index (n + ik), computes the total reflectance spectrum and CIE coordinates. Answers: how does colour change when the two layers stack? How much does indigo contribute to saturation? How thickness-tolerant is the result? Which layer order works better?</p>
            <p className="tool-line">Tools: Python tmm &nbsp;|&nbsp; Difficulty: ★★★</p>

            <h4>1.4 Inverse design</h4>
            <p><strong>Goal:</strong> given a target colour coordinate, back out the optimal parameters. <strong>Method:</strong> genetic algorithm / Bayesian optimization. <strong>Variables:</strong> P_CNC, pigment concentration, protein particle size, protein-layer thickness.</p>
            <p className="tool-line">Tools: scikit-optimize / BoTorch &nbsp;|&nbsp; Difficulty: ★★★★</p>

            <h3>Synthetic-biology modelling</h3>
            <div className="credit-tags"><span className="credit-tag">Dry Lab Member 3</span><span className="credit-tag">Dry Lab Member 4</span><span className="credit-tag">Dry Lab Member 5</span></div>

            <h4>2.1 Cellulase synergistic-degradation kinetics</h4>
            <p>Four enzymes (Cel5A/Cel6B/BglC/LPMO10A) modelled by Michaelis–Menten kinetics plus a synergy factor S. Each enzyme independently: v = V_max·[S]/(K_m+[S]); synergy term v_syn = S × min(v₁,v₂,v₃,v₄); BglC is subject to competitive product inhibition by glucose (K_i).</p>
            <p className="tool-line">Tools: scipy.integrate.odeint / COPASI &nbsp;|&nbsp; Difficulty: ★★</p>

            <h4>2.3 Full-chain carbon flux <span className="badge-revised">REVISED</span>: added a dynamic time dimension</h4>
            <div className="why why-callout">
              <strong>Why we changed it:</strong> the original version was a static, multiplicative-yield calculation only. Reviewers will ask "how many hours does fermentation take?" Adding a time axis doesn't require a new model; it just chains the outputs of models we already built.
            </div>
            <p><strong>How:</strong> run the 2.1 ODE to extract the cumulative glucose-release curve η_degrad(t); run the 2.4 Monod+logistic-production ODE to extract the cumulative BC-yield curve η_BC(t); take η_CNC as a constant from the acid-route experimental yield; chain the three in a Python script → plot time vs. membrane-area. Headline stat: <em>"one A4-sized film needs roughly X g of waste cotton and Y hours."</em></p>

            <h4>2.4 <em>K. xylinus</em> BC-synthesis Monod model</h4>
            <p>Growth: μ = μ_max·[G]/(K_s+[G]); BC production: dP/dt = α·dX/dt + β·X; overexpression of pgm/galU/ndp shifts μ_max. <strong>Outputs:</strong> optimal glucose concentration, best harvest time.</p>

            <h4>2.5 refCBA amino-acid supply/demand model</h4>
            <p>Compares refCBA's (~64 aa) amino-acid composition against the average <em>Y. lipolytica</em> proteome. Focus: refCBA has a high Tyr/Met/Arg/Trp ratio but a low absolute residue count at 64 aa, so bottleneck risk should be lower than for a full-length protein. <strong>Outputs:</strong> theoretical production ceiling (mg/L) + predicted bottleneck amino acid.</p>

            <h4>2.6 <em>Y. lipolytica</em> metabolic-network FBA <span className="badge-new">NEW</span></h4>
            <div className="why why-callout">
              <strong>Why we added it:</strong> refCBA's amino-acid composition is extreme, and which biosynthetic pathway gets drained first is not something wet-lab experiments alone can answer. FBA answers it directly, and the iYali4 model is mature enough to run in half a day.
            </div>
            <p><strong>Data source:</strong> iYali4 (BiGG Models or GitHub, JSON/SBML).</p>
            <ol>
              <li>Load the model: <code>import cobra; model = cobra.io.load_json_model('iYali4.json'); model.medium = model.minimal_medium</code></li>
              <li>Create a refCBA drain reaction: count each amino acid's frequency from the refCBA sequence (~64 aa), build a <code>cobra.Reaction('refCBA_drain')</code>, add per-metabolite stoichiometry (e.g. <code>tyr__L_c: -count_tyr</code>), then <code>model.add_reactions([drain])</code></li>
              <li>FBA for the production ceiling: objective = biomass (fixed at 90% μ_max); progressively raise the refCBA_drain flux upper bound; record the synthesis rate at which growth drops to 90% of max; convert to mg/L</li>
              <li>Rank amino-acid bottlenecks: halve each amino acid's supply flux in turn and observe which cuts refCBA output the most</li>
              <li>Compare against the static 2.5 analysis. 2.5 says "Met is abundant → possible bottleneck"; 2.6 says "Met's flux ceiling is X, and it is indeed drained first." Show both plots side by side as evidence of modelling depth.</li>
            </ol>
            <p className="tool-line">Tools: COBRApy &nbsp;|&nbsp; Difficulty: ★★★</p>

            <h4>2.7 RBS Calculator: rational translation-strength design <span className="badge-new">NEW</span></h4>
            <p><strong>Tool:</strong> De Novo DNA RBS Calculator, salislab.net/software (free).</p>
            <ol>
              <li>Take the 35 bp sequence upstream of the refCBA CDS start codon</li>
              <li>Enter it into the RBS Calculator → get predicted translation-initiation rate (TIR)</li>
              <li>Generate 10–20 RBS variants spanning a range of TIRs → pick low/medium/high, synthesize three</li>
              <li>Express and test all three (SDS-PAGE / Western) → scatter plot: x = predicted TIR, y = expression level → compute correlation r</li>
            </ol>
          </section>

          {/* Validation */}
          <section id="validation">
            <h2>Results: model ↔ experiment cross-checks</h2>
            <p>Every model above exists to be checked against real data, not just to run once. These are the specific comparisons we track.</p>
            <table>
              <thead>
                <tr><th>Prediction</th><th>Model</th><th>Validated against</th></tr>
              </thead>
              <tbody>
                <tr><td>refCBA production ceiling &amp; bottleneck amino acid</td><td>2.5 static supply/demand analysis</td><td>2.6 <em>Y. lipolytica</em> FBA (iYali4)</td></tr>
                <tr><td>refCBA assembly phase boundary</td><td>3.2 coarse-grained colloidal MD</td><td>4.5 wet-lab LLPS phase-diagram DOE (Module 4)</td></tr>
                <tr><td>refCBA-6E / refCBA-RR assembly-size shift</td><td>3.3 NCD–pH sequence analysis</td><td>4.7 mutant-panel wet-lab assembly tests</td></tr>
                <tr><td>π–π stacking hotspot residues</td><td>3.4 MD trajectory analysis</td><td>Proposed Tyr→Phe / Tyr→Ala point mutants, tested in 4.7</td></tr>
                <tr><td>Reflectance peak vs. film pitch/thickness</td><td>1.1 Bragg / de Vries model</td><td>3.6 angle-resolved reflectance spectroscopy</td></tr>
                <tr><td>BC theoretical yield ceiling</td><td>2.8.2 <em>K. xylinus</em> FBA</td><td>2.4 Monod+logistic fit to real fermentation curves; 3.1 RBS-library titres</td></tr>
              </tbody>
            </table>
            <div className="callout">
              <p>See the worked DBTL example directly below for what happened when one of these cross-checks <em>disagreed</em>: the 3.2 assembly-concentration prediction did not match the actual 4.5 DOE result, and how that discrepancy fed back into a revised model.</p>
            </div>
          </section>

          {/* Engineering Cycle */}
          <section id="engineering-cycle">
            <h2>Engineering cycle: a worked DBTL loop</h2>
            <p>A believable engineering cycle shows the loop closing more than once, including at least one round where the model was wrong and had to be corrected. The example below was chosen deliberately because it <em>didn't</em> work on the first pass, which is more convincing than a clean success story.</p>
            <div className="dbtl-row">
              <div className="dbtl-card">
                <h4 className="dbtl-card-title">Design</h4>
                <p className="dbtl-card-text">Coarse-grained SA–LR force field (§3.2) predicts the refCBA aggregation-onset concentration at ≈ 5 mg/mL.</p>
              </div>
              <div className="dbtl-card">
                <h4 className="dbtl-card-title">Test</h4>
                <p className="dbtl-card-text">Wet-lab LLPS assay (<Link to="/Wet-Lab-Experiments.html">Wet Lab §4.5</Link>) measures the real onset at ≈ 12 mg/mL; the model was 2.4× too aggressive.</p>
              </div>
              <div className="dbtl-card learn">
                <h4 className="dbtl-card-title">Learn</h4>
                <p className="dbtl-card-text">The force field did not account for the orientation-dependence of imidazole-mediated π–π stacking; it over-counted weak, poorly-oriented contacts as favourable.</p>
              </div>
              <div className="dbtl-card">
                <h4 className="dbtl-card-title">Design′</h4>
                <p className="dbtl-card-text">An orientation-dependent short-range interaction term is added to the force field.</p>
              </div>
            </div>
            <div className="dbtl-card-wrapper">
              <div className="dbtl-card">
                <h4 className="dbtl-card-title">Test′</h4>
                <p className="dbtl-card-text">Revised model predicts ≈ 11 mg/mL vs. the measured 12 mg/mL, within a defensible margin. ✓</p>
              </div>
            </div>
            <div className="callout">
              <p><strong>Wiki presentation:</strong> the two phase-diagram versions (pre- and post-correction) are shown side by side, with a small version-comparison table directly underneath.</p>
            </div>
            <div className="ph-row">
              <div className="ph-image wide"><div className="ph-label">Phase diagram v1 (pre-correction)</div></div>
              <div className="ph-image wide"><div className="ph-label">Phase diagram v2 (post-correction)</div></div>
            </div>
            <p className="engineering-note"><strong>Minimum bar we're holding ourselves to:</strong> at least two full DBTL rounds documented on this page, at least one of which shows a failure-then-correction rather than an uninterrupted success.</p>
          </section>

          {/* Applications */}
          <section id="applications">
            <h2>Applications: final product &amp; demonstration</h2>
            <p><strong>Primary track: sustainable fashion.</strong> Hairpins, earrings, brooches and other wearable prototypes, brought to the iGEM jamboree to demonstrate live angle- and lighting-dependent colour shift, displayed side by side with traditional Diǎn Cuì imagery and plain-pigment controls.</p>
            <div className="ph-row">
              <div className="ph-image square"><div className="ph-label">Wearable prototype photo</div></div>
              <div className="ph-image square"><div className="ph-label">Side-by-side vs. traditional Diǎn Cuì</div></div>
              <div className="ph-image square"><div className="ph-label">Angle-dependent colour shift series</div></div>
            </div>
            <h3>Extension directions</h3>
            <ul>
              <li><strong>Biomimetic camouflage material:</strong> the CNC–reflectin composite film is translucent with a controllable reflectance spectrum, opening a path toward multispectral (visible + IR) camouflage.</li>
              <li><strong>Pixelated photonic-film array:</strong> mimicking the three-layer architecture of cephalopod skin (chromatophore → iridophore → leucophore), a bottom indigo–BC layer, a middle PDMS microwell array individually filled with CNC–reflectin suspension, and a NaCl-gradient colour control could produce four to six distinct reflected colours from a single EISA run.</li>
            </ul>
          </section>

          {/* Contribution */}
          <section id="contribution">
            <h2>Contribution to the iGEM community</h2>
            <p>What this project hands forward to future teams, beyond its own result:</p>
            <ul>
              <li><strong>Registry parts.</strong> Every construct on this page and on <Link to="/Wet-Lab-Experiments.html#parts">Wet Lab: Part Collection</Link> is slated for Registry submission.</li>
              <li><strong>A documented enzymatic route to CNC.</strong> Most published CNC protocols rely on concentrated acid hydrolysis; the Cel5A enzymatic route is written up in enough protocol detail for another team to reproduce it.</li>
              <li><strong>Open modelling scripts.</strong> The optical, synthetic-biology, and protein-modelling code under <a href="#modelling">Model</a> is intended for release alongside the wiki.</li>
            </ul>
          </section>
        </div>
      </div>

      <Footer />
      <RingNav />
    </>
  );
}
