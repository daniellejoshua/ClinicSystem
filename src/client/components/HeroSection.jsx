import HeroDoctor from "../../assets/images/heroDoctorBlur.png";
import DoctorTransparent from "../../assets/images/DoctorTransparent.png";
import { IoCalendarSharp } from "react-icons/io5";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <>
      <section className="h-[calc(100vh-160px)] w-screen relative overflow-visible">
        {/* Hero doctor background - responsive */}
        <div
          className="absolute inset-0 bg-cover bg-center md:bg-left bg-no-repeat opacity-90 md:opacity-100"
          style={{ backgroundImage: `url(${HeroDoctor})` }}
        ></div>

        {/* Gradient overlay for better text readability on mobile */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:hidden z-5"></div>

        {/* Decorative circles - improved positioning */}
        <div className="absolute -left-36 -top-0 w-64 h-64 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] bg-accent rounded-full opacity-20 md:opacity-25 z-5"></div>

        {/* Additional decorative element for mobile */}
        <div className="absolute -right-16 top-16 w-32 h-32 md:hidden bg-accent/30 rounded-full z-5"></div>
        <div className="absolute left-8 bottom-20 w-24 h-24 md:hidden bg-accent/20 rounded-full z-5"></div>

        {/* Text content - centered on mobile */}
        <div className="absolute left-1/2 transform -translate-x-1/2 md:left-[24rem] md:transform-none top-1/2 lg:top-1/3 -translate-y-1/2 z-20 max-w-[90%] md:max-w-[750px] px-4 md:px-0 text-center md:text-left">
          <h1 className="text-lg md:text-xl font-bold text-secondary mb-4 font-worksans tracking-[.3rem] md:tracking-[.5rem]">
            CARING FOR LIFE
          </h1>
          <p className="text-[48px] md:text-[66px] text-primary mb-6 font-yeseva leading-tight">
            Leading the Way{" "}
            <>
              <br />
            </>
            in Medical Excellence
          </p>
          <Link to="/appointment">
            {/* Mobile/Tablet - Book Appointment Button */}
            <button className="w-full md:hidden flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-accent/90 transition-colors hover:text-primary font-worksans text-lg shadow-lg">
              BOOK APPOINTMENT
              <IoCalendarSharp className="text-xl" />
            </button>
          </Link>
          {/* Desktop - Our Services Button */}
          <button className="hidden md:block w-auto bg-accent text-primary px-8 py-3 rounded-full font-semibold hover:bg-accent/90 transition-colors font-worksans text-base shadow-lg">
            Our Services
          </button>
        </div>

        {/* Medical icons for mobile decoration */}
        <div className="absolute top-20 right-8 md:hidden z-15">
          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
            <div className="w-6 h-6 bg-accent rounded-sm"></div>
          </div>
        </div>

        <div className="absolute bottom-32 left-8 md:hidden z-15">
          <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <div className="w-4 h-4 bg-accent rounded-full"></div>
          </div>
        </div>

        {/* Bottom decorative wave for mobile */}
        <div className="absolute bottom-0 left-0 right-0 h-20 md:hidden z-5">
          <svg viewBox="0 0 1200 120" className="w-full h-full">
            <path
              d="M0,60 C200,100 400,20 600,60 C800,100 1000,20 1200,60 L1200,120 L0,120 Z"
              fill="rgba(59, 130, 246, 0.1)"
            ></path>
          </svg>
        </div>

        {/* Doctor transparent image - only shows on desktop when properly aligned */}
        <img
          className="hidden md:block absolute inset-0 w-screen h-full object-cover object-left z-10"
          src={DoctorTransparent}
          alt="Doctor"
        />

        {/* Right circle for desktop */}
        <div className="absolute -right-32 -bottom-32 w-96 h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] xl:w-[36rem] xl:h-[36rem] bg-accent rounded-full opacity-25 z-5"></div>

        {/* Desktop Only - Book Appointment button between sections */}
        <div className="hidden md:block absolute -bottom-8 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm px-4">
          <Link to="/appointment">
            <button className="w-full flex items-center justify-center gap-2 bg-primary text-white px-8 py-6 font-semibold hover:bg-accent/90 transition-colors hover:text-primary font-worksans text-lg shadow-xl rounded-md">
              BOOK APPOINTMENT
              <IoCalendarSharp className="text-xl text-accent hover:text-primary" />
            </button>
          </Link>
        </div>
      </section>
    </>
  );
}
