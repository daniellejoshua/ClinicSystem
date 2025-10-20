import React from "react";
import HeroSection from "../components/HeroSection";
import HeroSection2 from "../components/HeroSection2";
import OurServices from "../components/OurServices";
import Contact from "../components/Contact";

export default function Home() {
  return (
    <div className="w-full lg:overflow-x-hidden">
      <HeroSection />
      <HeroSection2 />
      <OurServices />
      <Contact />
    </div>
  );
}
