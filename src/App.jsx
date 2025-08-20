import TopBar from "./components/TopBar";
import Navbar from "./components/Navbar";
import { useState } from "react";
import HeroSection from "./components/HeroSection";
import HeroSection2 from "./components/HeroSection2";
import OurServices from "./components/OurServices";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <div className="overflow-hidden">
        <TopBar isHidden={isMenuOpen} />
        <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <HeroSection />
        <HeroSection2 />
        <OurServices />
        <Contact />
        <Footer />
      </div>
    </>
  );
}
