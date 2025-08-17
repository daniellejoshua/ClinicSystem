import TopBar from "./components/TopBar";
import Navbar from "./components/Navbar";
import { useState } from "react";
import HeroSection from "./components/HeroSection";
export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <div className="overflow-hidden">
        <TopBar isHidden={isMenuOpen} />
        <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
        <HeroSection />
      </div>
    </>
  );
}
