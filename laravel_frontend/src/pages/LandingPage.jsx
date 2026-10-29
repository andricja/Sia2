import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Statistics from '../components/Statistics';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import SystemPreview from '../components/SystemPreview';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <Statistics />
      <Features />
      <HowItWorks />
      <SystemPreview />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}

export default LandingPage;
