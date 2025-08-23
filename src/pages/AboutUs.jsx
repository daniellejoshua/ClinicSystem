import React from "react";
import MedicalTeam from "../assets/images/MedicalTeam.png";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${MedicalTeam})`,
          }}
        ></div>

        {/* Custom Rectangle Overlay - #BEBEBE */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "#BEBEBE", opacity: 0.5 }}
        ></div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-center max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-primary mb-4">
            <span className="font-worksans">Home</span>
            <span>/</span>
            <span className="font-worksans">About</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-yeseva text-primary mb-6">
            About us
          </h1>
        </div>

        {/* Bottom Accent Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 flex">
          <div className="w-1/3 bg-accent"></div>
          <div className="w-1/3 bg-primary"></div>
          <div className="w-1/3 bg-secondary"></div>
        </div>
      </section>

      {/* About Content Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <p className="text-lg text-secondary font-worksans font-medium uppercase tracking-wider mb-4">
                WHO WE ARE
              </p>
              <h2 className="text-3xl md:text-4xl text-primary font-yeseva mb-6">
                Your Health, Our Priority
              </h2>
              <div className="space-y-4 text-gray-600">
                <p className="font-worksans leading-relaxed">
                  At Tonsuya Super Health Center, we are committed to providing
                  comprehensive healthcare services that prioritize your
                  well-being. Our team of dedicated medical professionals works
                  tirelessly to ensure you receive the best possible care.
                </p>
                <p className="font-worksans leading-relaxed">
                  With years of experience and state-of-the-art facilities, we
                  offer a wide range of medical services designed to meet the
                  diverse healthcare needs of our community.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary">500+</h3>
                  <p className="text-sm text-gray-600">Happy Patients</p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary">10+</h3>
                  <p className="text-sm text-gray-600">Expert Doctors</p>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-primary">5+</h3>
                  <p className="text-sm text-gray-600">Years Experience</p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="bg-primary/10 rounded-lg p-8">
                <div className="bg-white rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-worksans font-semibold text-primary mb-4">
                    Our Mission
                  </h3>
                  <p className="text-gray-600 mb-6">
                    To provide accessible, quality healthcare services while
                    building lasting relationships with our patients and
                    community.
                  </p>

                  <h3 className="text-xl font-worksans font-semibold text-primary mb-4">
                    Our Vision
                  </h3>
                  <p className="text-gray-600">
                    To be the leading healthcare provider in our region, known
                    for excellence, innovation, and compassionate care.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-lg text-secondary font-worksans font-medium uppercase tracking-wider mb-4">
              OUR VALUES
            </p>
            <h2 className="text-3xl md:text-4xl text-primary font-yeseva">
              What We Stand For
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-primary">💙</span>
              </div>
              <h3 className="text-lg font-worksans font-semibold text-primary mb-2">
                Compassion
              </h3>
              <p className="text-gray-600 text-sm">
                We treat every patient with empathy and understanding
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-secondary">⭐</span>
              </div>
              <h3 className="text-lg font-worksans font-semibold text-primary mb-2">
                Excellence
              </h3>
              <p className="text-gray-600 text-sm">
                We strive for the highest standards in everything we do
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-accent">🤝</span>
              </div>
              <h3 className="text-lg font-worksans font-semibold text-primary mb-2">
                Integrity
              </h3>
              <p className="text-gray-600 text-sm">
                We maintain honesty and transparency in all our interactions
              </p>
            </div>

            <div className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-primary">🚀</span>
              </div>
              <h3 className="text-lg font-worksans font-semibold text-primary mb-2">
                Innovation
              </h3>
              <p className="text-gray-600 text-sm">
                We embrace new technologies and methods to improve care
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
