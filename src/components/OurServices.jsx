import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHeartbeat,
  FaDna,
  FaTint,
  FaEye,
  FaBaby,
  FaSyringe,
  FaUserMd,
  FaBandAid,
  FaCalendarCheck,
  FaBrain,
  FaCertificate,
} from "react-icons/fa";
import MedicalTeam2 from "../assets/images/MedicalTeam2.png";
import DoctorWithPatient from "../assets/images/DoctorWithPatient.png";

export default function OurServices() {
  const navigate = useNavigate();

  // Service mapping for navigation
  const serviceRoutes = {
    "Medical Checkup": "medical-checkup",
    "Maternal & Child Health": "maternal-child-health",
    Immunization: "immunization",
    Consultation: "consultation",
    "Family Planning": "family-planning",
    "Senior Citizen Care": "senior-citizen-care",
    "Wound Care": "wound-care",
    "Follow-Up Visit": "follow-up-visit",
    "Mental Health": "mental-health",
    "Medical Certificates": "medical-certificate",
  };

  const handleServiceClick = (serviceName) => {
    const route = serviceRoutes[serviceName];
    if (route) {
      navigate(`/services/${route}`);
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 10);
    }
  };

  const handleViewAllClick = () => {
    navigate("/services");
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };

  return (
    <section className="w-screen py-16 bg-white relative overflow-hidden">
      {/* Decorative circles - made more visible */}
      <div className="absolute -left-32 top-20 w-64 h-64 bg-primary rounded-full opacity-20 -z-10"></div>
      <div className="absolute -right-32 -bottom-32 w-96 h-96 bg-secondary rounded-full opacity-25 -z-10"></div>
      <div className="absolute left-1/2 -top-16 w-32 h-32 bg-accent rounded-full opacity-30 -z-10"></div>
      <div className="absolute right-1/4 top-10 w-20 h-20 bg-primary rounded-full opacity-15 -z-10"></div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-lg md:text-xl text-secondary font-worksans font-medium uppercase tracking-wider mb-4">
            CARE YOU CAN BELIEVE IN
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-primary font-yeseva mb-8">
            Our Services
          </h2>
        </div>

        {/* Mobile Version - Service Cards Only */}
        <div className="block lg:hidden mb-16">
          <div className="space-y-4">
            {/* Medical Checkup Card */}
            <div
              onClick={() => handleServiceClick("Medical Checkup")}
              className="bg-white/20 rounded-lg p-6 border hover:shadow-lg transition-all cursor-pointer hover:bg-primary group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                  <FaHeartbeat className="text-2xl text-secondary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-lg font-worksans font-semibold text-primary group-hover:text-white transition-colors">
                  Medical Checkup
                </h3>
              </div>
            </div>

            {/* Maternal & Child Health Card */}
            <div
              onClick={() => handleServiceClick("Maternal & Child Health")}
              className="bg-white/20 rounded-lg p-6 border hover:shadow-lg transition-all cursor-pointer hover:bg-primary group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                  <FaBaby className="text-2xl text-secondary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-lg font-worksans font-semibold text-primary group-hover:text-white transition-colors">
                  Maternal & Child Health
                </h3>
              </div>
            </div>

            {/* Immunization Card */}
            <div
              onClick={() => handleServiceClick("Immunization")}
              className="bg-white/20 rounded-lg p-6 border hover:shadow-lg transition-all cursor-pointer hover:bg-primary group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                  <FaSyringe className="text-2xl text-secondary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-lg font-worksans font-semibold text-primary group-hover:text-white transition-colors">
                  Immunization
                </h3>
              </div>
            </div>

            {/* Consultation Card */}
            <div
              onClick={() => handleServiceClick("Consultation")}
              className="bg-white/20 rounded-lg p-6 border hover:shadow-lg transition-all cursor-pointer hover:bg-primary group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                  <FaUserMd className="text-2xl text-secondary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-lg font-worksans font-semibold text-primary group-hover:text-white transition-colors">
                  Consultation
                </h3>
              </div>
            </div>

            {/* View All Button - Centered */}
            <div className="flex justify-center">
              <button
                onClick={handleViewAllClick}
                className="w-1/2 bg-primary text-white py-4 rounded-lg font-worksans font-semibold hover:bg-primary/90 hover:scale-105 transition-all duration-300"
              >
                View All
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Version - Full 3-Column Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8 mb-16">
          {/* Left Column - Service Cards */}
          <div className="space-y-4">
            {/* Medical Checkup Card */}
            <div
              onClick={() => handleServiceClick("Medical Checkup")}
              className="bg-white/20 rounded-lg p-6 border hover:shadow-lg transition-all cursor-pointer hover:bg-primary group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                  <FaHeartbeat className="text-2xl text-secondary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-lg font-worksans font-semibold text-primary group-hover:text-white transition-colors">
                  Medical Checkup
                </h3>
              </div>
            </div>

            {/* Maternal & Child Health Card */}
            <div
              onClick={() => handleServiceClick("Maternal & Child Health")}
              className="bg-white/20 rounded-lg p-6 border hover:shadow-lg transition-all cursor-pointer hover:bg-primary group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                  <FaBaby className="text-2xl text-secondary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-lg font-worksans font-semibold text-primary group-hover:text-white transition-colors">
                  Maternal & Child Health
                </h3>
              </div>
            </div>

            {/* Immunization Card */}
            <div
              onClick={() => handleServiceClick("Immunization")}
              className="bg-white/20 rounded-lg p-6 border hover:shadow-lg transition-all cursor-pointer hover:bg-primary group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                  <FaSyringe className="text-2xl text-secondary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-lg font-worksans font-semibold text-primary group-hover:text-white transition-colors">
                  Immunization
                </h3>
              </div>
            </div>

            {/* Consultation Card */}
            <div
              onClick={() => handleServiceClick("Consultation")}
              className="bg-white/20 rounded-lg p-6 border hover:shadow-lg transition-all cursor-pointer hover:bg-primary group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center group-hover:bg-primary transition-colors">
                  <FaUserMd className="text-2xl text-secondary group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-lg font-worksans font-semibold text-primary group-hover:text-white transition-colors">
                  Consultation
                </h3>
              </div>
            </div>
            {/* View All Button */}
            <button
              onClick={handleViewAllClick}
              className="w-full bg-primary text-white py-4 rounded-lg font-worksans font-semibold hover:bg-primary/90 hover:scale-105 transition-all duration-300"
            >
              View All
            </button>
          </div>

          {/* Middle Column - Content */}
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl text-primary font-yeseva leading-tight">
              A passion for putting patients first.
            </h3>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-secondary rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 font-worksans">
                  Care for Your Little Ones
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-secondary rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 font-worksans">
                  Care for Mothers
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-secondary rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 font-worksans">
                  All our best
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-secondary rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 font-worksans">
                  Believe in Us
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-secondary rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 font-worksans">
                  A Legacy of Excellence
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-secondary rounded-full flex-shrink-0"></div>
                <span className="text-gray-700 font-worksans">
                  Always Caring
                </span>
              </div>
            </div>

            {/* Description Paragraphs */}
            <div className="space-y-4">
              <p className="text-gray-600 font-worksans leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                placerat scelerisque tortor ornare ornare. Quisque placerat
                scelerisque tortor ornare ornare Convallis felis vitae tortor
                augue. Velit nascetur proin massa in. Consequat faucibus
                porttitor enim et.
              </p>
              <p className="text-gray-600 font-worksans leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
                placerat scelerisque. Convallis felis vitae tortor augue. Velit
                nascetur proin massa in.
              </p>
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="space-y-4">
            {/* Top Image - Doctor with Patient */}
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={DoctorWithPatient}
                alt="Doctor with patient"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              {/* 3-color border bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-2 flex">
                <div className="w-1/4 bg-accent"></div>
                <div className="w-1/2 bg-primary"></div>
                <div className="w-1/4 bg-secondary"></div>
              </div>
            </div>

            {/* Bottom Image - Medical Team */}
            <div className="relative rounded-lg overflow-hidden">
              <img
                src={MedicalTeam2}
                alt="Medical team"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              {/* 3-color border bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-2 flex">
                <div className="w-1/4 bg-accent"></div>
                <div className="w-1/2 bg-primary"></div>
                <div className="w-1/4 bg-secondary"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Clinic Services Header */}
        <div className="text-center mb-12">
          <p className="text-lg md:text-xl text-secondary font-worksans font-medium uppercase tracking-wider mb-4">
            ALWAYS CARING
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-primary font-yeseva mb-8">
            Clinic Services
          </h2>
        </div>

        {/* Mobile Clinic Services - 2 Column Grid with Cards */}
        <div className="block lg:hidden">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Medical Checkup */}
            <div
              onClick={() => handleServiceClick("Medical Checkup")}
              className="bg-white border-2 border-gray-100 p-4 rounded-lg text-center hover:shadow-lg hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer transform group"
            >
              <div className="flex justify-center mb-3">
                <FaHeartbeat className="text-2xl text-accent group-hover:text-white hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-sm font-worksans font-semibold text-black group-hover:text-white transition-colors duration-300">
                Medical Checkup
              </h3>
            </div>

            {/* Maternal & Child Health */}
            <div
              onClick={() => handleServiceClick("Maternal & Child Health")}
              className="bg-white border-2 border-gray-100 p-4 rounded-lg text-center hover:shadow-lg hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer transform group"
            >
              <div className="flex justify-center mb-3">
                <FaBaby className="text-2xl text-accent group-hover:text-white hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-sm font-worksans font-semibold text-primary group-hover:text-white transition-colors duration-300">
                Maternal & Child Health
              </h3>
            </div>

            {/* Immunization */}
            <div
              onClick={() => handleServiceClick("Immunization")}
              className="bg-white border-2 border-gray-100 p-4 rounded-lg text-center hover:shadow-lg hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer transform group"
            >
              <div className="flex justify-center mb-3">
                <FaSyringe className="text-2xl text-accent group-hover:text-white hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-sm font-worksans font-semibold text-primary group-hover:text-white transition-colors duration-300">
                Immunization
              </h3>
            </div>

            {/* Consultation */}
            <div
              onClick={() => handleServiceClick("Consultation")}
              className="bg-white border-2 border-gray-100 p-4 rounded-lg text-center hover:shadow-lg hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer transform group"
            >
              <div className="flex justify-center mb-3">
                <FaUserMd className="text-2xl text-accent group-hover:text-white hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-sm font-worksans font-semibold text-primary group-hover:text-white transition-colors duration-300">
                Consultation
              </h3>
            </div>

            {/* Family Planning */}
            <div
              onClick={() => handleServiceClick("Family Planning")}
              className="bg-white border-2 border-gray-100 p-4 rounded-lg text-center hover:shadow-lg hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer transform group"
            >
              <div className="flex justify-center mb-3">
                <FaHeartbeat className="text-2xl text-accent group-hover:text-white hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-sm font-worksans font-semibold text-primary group-hover:text-white transition-colors duration-300">
                Family Planning
              </h3>
            </div>

            {/* Senior Citizen Care */}
            <div
              onClick={() => handleServiceClick("Senior Citizen Care")}
              className="bg-white border-2 border-gray-100 p-4 rounded-lg text-center hover:shadow-lg hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer transform group"
            >
              <div className="flex justify-center mb-3">
                <FaUserMd className="text-2xl text-accent group-hover:text-white hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-sm font-worksans font-semibold text-primary group-hover:text-white transition-colors duration-300">
                Senior Citizen Care
              </h3>
            </div>
          </div>

          {/* View All Button for Mobile Clinic Services - Centered */}
          <div className="flex justify-center">
            <button
              onClick={handleViewAllClick}
              className="w-1/2 bg-primary text-white py-4 rounded-lg font-worksans font-semibold hover:bg-primary/90 hover:scale-105 transition-all duration-300"
            >
              View All
            </button>
          </div>
        </div>

        {/* Desktop Services Grid - 4 Column Layout */}
        <div className="hidden lg:grid lg:grid-cols-4 gap-6">
          {/* Medical Checkup - Featured */}
          <div
            onClick={() => handleServiceClick("Medical Checkup")}
            className="bg-white border-2 border-gray-100 p-8 rounded-lg text-center hover:shadow-xl hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer transform group h-48 flex flex-col justify-center"
          >
            <div className="flex justify-center mb-4">
              <FaHeartbeat className="text-4xl text-accent hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-worksans font-semibold mb-2 text-primary group-hover:text-white transition-colors duration-300">
              Medical Checkup
            </h3>
            <p className="text-sm opacity-0 group-hover:opacity-90 transition-opacity duration-300">
              "For BP, general screening"
            </p>
          </div>

          {/* Maternal & Child Health */}
          <div
            onClick={() => handleServiceClick("Maternal & Child Health")}
            className="bg-white border-2 border-gray-100 p-8 rounded-lg text-center hover:shadow-xl hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer transform group h-48 flex flex-col justify-center"
          >
            <div className="flex justify-center mb-4">
              <FaBaby className="text-4xl text-accent hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-worksans font-semibold mb-2 text-primary group-hover:text-white transition-colors duration-300">
              Maternal & Child Health
            </h3>
            <p className="text-sm opacity-0 group-hover:opacity-90 transition-opacity duration-300">
              "Prenatal and postnatal care"
            </p>
          </div>

          {/* Immunization */}
          <div
            onClick={() => handleServiceClick("Immunization")}
            className="bg-white border-2 border-gray-100 p-8 rounded-lg text-center hover:shadow-xl hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer transform group h-48 flex flex-col justify-center"
          >
            <div className="flex justify-center mb-4">
              <FaSyringe className="text-4xl text-accent hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-worksans font-semibold mb-2 text-primary group-hover:text-white transition-colors duration-300">
              Immunization
            </h3>
            <p className="text-sm opacity-0 group-hover:opacity-90 transition-opacity duration-300">
              "Vaccines for all ages"
            </p>
          </div>

          {/* Consultation */}
          <div
            onClick={() => handleServiceClick("Consultation")}
            className="bg-white border-2 border-gray-100 p-8 rounded-lg text-center hover:shadow-xl hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer transform group h-48 flex flex-col justify-center"
          >
            <div className="flex justify-center mb-4">
              <FaUserMd className="text-4xl text-accent hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-worksans font-semibold mb-2 text-primary group-hover:text-white transition-colors duration-300">
              Consultation
            </h3>
            <p className="text-sm opacity-0 group-hover:opacity-90 transition-opacity duration-300">
              "Expert medical advice"
            </p>
          </div>

          {/* Family Planning */}
          <div
            onClick={() => handleServiceClick("Family Planning")}
            className="bg-white border-2 border-gray-100 p-8 rounded-lg text-center hover:shadow-xl hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer transform group h-48 flex flex-col justify-center"
          >
            <div className="flex justify-center mb-4">
              <FaHeartbeat className="text-4xl text-accent hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-worksans font-semibold mb-2 text-primary group-hover:text-white transition-colors duration-300">
              Family Planning
            </h3>
            <p className="text-sm opacity-0 group-hover:opacity-90 transition-opacity duration-300">
              "Reproductive health services"
            </p>
          </div>

          {/* Senior Citizen Care */}
          <div
            onClick={() => handleServiceClick("Senior Citizen Care")}
            className="bg-white border-2 border-gray-100 p-8 rounded-lg text-center hover:shadow-xl hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer transform group h-48 flex flex-col justify-center"
          >
            <div className="flex justify-center mb-4">
              <FaUserMd className="text-4xl text-accent hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-worksans font-semibold mb-2 text-primary group-hover:text-white transition-colors duration-300">
              Senior Citizen Care
            </h3>
            <p className="text-sm opacity-0 group-hover:opacity-90 transition-opacity duration-300">
              "Specialized elderly care"
            </p>
          </div>

          {/* Wound Care */}
          <div
            onClick={() => handleServiceClick("Wound Care")}
            className="bg-white border-2 border-gray-100 p-8 rounded-lg text-center hover:shadow-xl hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer transform group h-48 flex flex-col justify-center"
          >
            <div className="flex justify-center mb-4">
              <FaBandAid className="text-4xl text-accent hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-worksans font-semibold mb-2 text-primary group-hover:text-white transition-colors duration-300">
              Wound Care
            </h3>
            <p className="text-sm opacity-0 group-hover:opacity-90 transition-opacity duration-300">
              "Professional wound treatment"
            </p>
          </div>

          {/* Follow-Up Visit */}
          <div
            onClick={() => handleServiceClick("Follow-Up Visit")}
            className="bg-white border-2 border-gray-100 p-8 rounded-lg text-center hover:shadow-xl hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer transform group h-48 flex flex-col justify-center"
          >
            <div className="flex justify-center mb-4">
              <FaCalendarCheck className="text-4xl text-accent hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-worksans font-semibold mb-2 text-primary group-hover:text-white transition-colors duration-300">
              Follow-Up Visit
            </h3>
            <p className="text-sm opacity-0 group-hover:opacity-90 transition-opacity duration-300">
              "Continued care monitoring"
            </p>
          </div>

          {/* Mental Health */}
          <div
            onClick={() => handleServiceClick("Mental Health")}
            className="bg-white border-2 border-gray-100 p-8 rounded-lg text-center hover:shadow-xl hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer transform group h-48 flex flex-col justify-center"
          >
            <div className="flex justify-center mb-4">
              <FaBrain className="text-4xl text-accent hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-worksans font-semibold mb-2 text-primary group-hover:text-white transition-colors duration-300">
              Mental Health
            </h3>
            <p className="text-sm opacity-0 group-hover:opacity-90 transition-opacity duration-300">
              "Psychological support services"
            </p>
          </div>

          {/* Medical Certificates */}
          <div
            onClick={() => handleServiceClick("Medical Certificates")}
            className="bg-white border-2 border-gray-100 p-8 rounded-lg text-center hover:shadow-xl hover:scale-105 hover:border-primary/30 hover:bg-primary hover:text-white transition-all duration-300 cursor-pointer transform group h-48 flex flex-col justify-center"
          >
            <div className="flex justify-center mb-4">
              <FaCertificate className="text-4xl text-accent hover:scale-110 transition-transform duration-300" />
            </div>
            <h3 className="text-xl font-worksans font-semibold mb-2 text-primary group-hover:text-white transition-colors duration-300">
              Medical Certificates
            </h3>
            <p className="text-sm opacity-0 group-hover:opacity-90 transition-opacity duration-300">
              "Official medical documentation"
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
