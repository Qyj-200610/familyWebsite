import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Project from './pages/Project';
import WetLab from './pages/WetLab';
import HumanPractices from './pages/HumanPractices';
import Attributions from './pages/Attributions';
import AIComputationalMethods from './pages/AIComputationalMethods';
import AIEthicsSafety from './pages/AIEthicsSafety';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/index.html" element={<Home />} />
        <Route path="/Project-Description.html" element={<Project />} />
        <Route path="/Wet-Lab-Experiments.html" element={<WetLab />} />
        <Route path="/Human-Practices.html" element={<HumanPractices />} />
        <Route path="/Attributions.html" element={<Attributions />} />
        <Route path="/AI-Computational-Methods.html" element={<AIComputationalMethods />} />
        <Route path="/AI-Ethics-Safety.html" element={<AIEthicsSafety />} />
      </Routes>
    </BrowserRouter>
  );
}
