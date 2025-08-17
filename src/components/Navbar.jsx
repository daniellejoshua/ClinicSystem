export default function Navbar({ isMenuOpen, setIsMenuOpen }) {
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div className="bg-primary">
        {/* Desktop Navbar */}
        <div className="min-h-[80px] hidden md:flex p-4 gap-10 items-center xl:justify-center relative xl:left-52 text-white text-[18px] ">
          <span className="font-worksans font-semibold text-accent">Home</span>
          <span className="whitespace-nowrap font-worksans">About us</span>
          <span className="font-worksans">Services</span>
          <span className="font-worksans">Contact</span>
          <div className="flex w-full justify-center relative xl:left-20 right-20 items-center gap-4">
            <button className="text-primary font-worksans font-medium py-3 px-8 rounded-[50px] bg-accent">
              Appointment
            </button>
          </div>
        </div>

        {/* Mobile Navbar */}
        <div className="md:hidden flex justify-between items-center p-4 text-white relative z-[60] bg-primary">
          <h1 className="text-accent font-bold font-yeseva text-2xl">
            TONSUYA SHC
          </h1>
          <div className="flex items-center gap-4">
            {/* Hamburger Menu */}
            <button onClick={toggleMenu} className="text-2xl">
              {isMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-[#BFD2F8] bg-opacity-95 z-50">
            <div className="flex flex-col items-center justify-center h-full gap-8 text-primary text-2xl pt-20 ">
              <span className="font-worksans text-primary font-bold">Home</span>
              <span className="font-worksans font-normal">About us</span>
              <span className="font-worksans font-normal">Services</span>
              <span className="font-worksans font-normal">Contact</span>
              <button className="text-accent font-worksans font-medium py-4 px-12 rounded-[50px] bg-primary border border-accent mt-8"></button>
              Appointment
            </div>
          </div>
        )}
      </div>
    </>
  );
}
