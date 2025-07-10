import TopBar from "./components/TopBar";
import Navbar from "./components/Navbar";
import { useState } from "react";
export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <TopBar isHidden={isMenuOpen} />
      <Navbar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
    </>
  );
}
