import MedicalTeam from "../../assets/images/MedicalTeam.png";

export default function HeroSection2() {
  return (
    <>
      <div className="w-screen h-auto py-16 bg-gray-50">
        {/* Header Section */}
        <div className="flex flex-col justify-center items-center text-center px-4 mb-12">
          <p className="text-lg md:text-xl text-secondary font-worksans font-medium uppercase tracking-wider mb-4">
            Welcome to TONSUYA SUPER HEALTH CENTER
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-primary font-yeseva mb-6 max-w-2xl">
            A Great Place to Receive Care
          </h2>
          <p className="text-gray-600 font-worksans text-base md:text-lg max-w-2xl leading-relaxed mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
            placerat scelerisque tortor ornare ornare. Convallis felis vitae
            tortor augue. Velit neque proin massa in. Consequat mauris rhoncus
            feugiat porttitor eniet.
          </p>
          <button className="text-secondary font-worksans font-medium text-lg hover:text-accent/80 transition-colors flex items-center gap-2">
            Learn More
            <span className="text-xl text-primary">→</span>
          </button>
        </div>

        {/* Medical Team Image - Responsive */}
        <div className="flex justify-center px-0 md:px-4">
          <div className="relative w-full md:max-w-7xl">
            <img
              src={MedicalTeam}
              alt="Medical Team at TONSUYA SUPER HEALTH CENTER"
              className="w-full h-auto md:rounded-lg shadow-lg object-cover"
            />
            {/* Optional decorative border accent - only on desktop */}
            <div className="hidden md:block absolute -bottom-2 -right-2 w-full h-full border-4 border-accent rounded-lg -z-10"></div>
          </div>
        </div>
      </div>
    </>
  );
}
