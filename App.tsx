
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import StoryDetail from './pages/StoryDetail';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/story/:id" element={<StoryDetail />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
