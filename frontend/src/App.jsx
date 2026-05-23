import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Publisher from './pages/Publisher';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/feed" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/publisher" element={<Publisher />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
