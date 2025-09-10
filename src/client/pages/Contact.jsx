import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPhone, FaMapMarkerAlt, FaEnvelope, FaClock } from "react-icons/fa";
import ServiceBanner from "../../assets/images/ServiceBanner.png";

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form submitted:", formData);

    alert("Message sent successfully!");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        {/* Background Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${ServiceBanner})`,
          }}
        ></div>

        {/* White Rectangle Overlay - 50% Opacity */}
        <div className="absolute inset-0 bg-white/50"></div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-center max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-primary mb-4">
            <button
              onClick={() => navigate("/")}
              className="font-worksans hover:text-accent transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className="font-worksans">Contact</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-yeseva text-primary mb-6">
            Our Contacts
          </h1>
        </div>

        {/* Bottom Accent Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 flex">
          <div className="w-1/3 bg-accent"></div>
          <div className="w-1/3 bg-primary"></div>
          <div className="w-1/3 bg-secondary"></div>
        </div>
      </section>

      {/* Google Maps Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d964.9685980038888!2d120.95740707568592!3d14.663068894258798!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397b44f1fc47e0d%3A0x7046080a1d2df264!2sTonsuya%20Super%20Health%20Center%20(Malabon)!5e0!3m2!1sen!2sph!4v1755956314348!5m2!1sen!2sph"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Tonsuya Super Health Center - Malabon Location"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Contact Form and Information Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Contact Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-xl p-6 relative overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-accent/10 rounded-full"></div>
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-primary/10 rounded-full"></div>

                {/* Header Section */}
                <div className="relative mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <p className="text-sm font-worksans font-medium text-secondary uppercase tracking-wider">
                      GET IN TOUCH
                    </p>
                  </div>
                  <h2 className="text-3xl font-yeseva text-primary mb-3">
                    Contact Us
                  </h2>

                  {/* Decorative Line */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-1 bg-accent"></div>
                    <div className="w-3 h-1 bg-primary"></div>
                    <div className="w-2 h-1 bg-secondary"></div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name and Email Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-worksans font-medium text-primary mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-gray-50 text-primary placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-accent transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-worksans font-medium text-primary mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="Your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 bg-gray-50 text-primary placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-accent transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-worksans font-medium text-primary mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      placeholder="What's this about?"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-50 text-primary placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-accent transition-all duration-300"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-worksans font-medium text-primary mb-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      placeholder="Tell us how we can help..."
                      rows="4"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-50 text-primary placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:border-accent transition-all duration-300 resize-none"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full bg-primary text-white px-4 py-3 rounded-lg font-worksans font-semibold hover:bg-primary/90 hover:shadow-md transform hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <span>SEND MESSAGE</span>
                        <div className="w-1.5 h-1.5 bg-accent rounded-full group-hover:scale-110 transition-transform"></div>
                      </span>
                      <div className="absolute inset-0 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column - Contact Information Cards */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {/* Emergency Contact */}
                <div className="bg-accent rounded-lg p-3 sm:p-4 md:p-6 text-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                    <FaPhone className="text-primary text-sm sm:text-lg md:text-xl" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-worksans font-bold text-primary mb-1 sm:mb-2">
                    EMERGENCY
                  </h3>
                  <p className="text-primary font-worksans text-xs sm:text-sm md:text-base mb-1">
                    (237) 681-812-255
                  </p>
                </div>

                {/* Location */}
                <div className="bg-primary rounded-lg p-3 sm:p-4 md:p-6 text-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                    <FaMapMarkerAlt className="text-accent text-sm sm:text-lg md:text-xl" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-worksans font-bold text-white mb-1 sm:mb-2">
                    LOCATION
                  </h3>
                  <p className="text-white font-worksans text-xs sm:text-sm md:text-base mb-1">
                    MX75+6CH, Ortega St
                  </p>
                  <p className="text-white font-worksans text-xs sm:text-sm md:text-base">
                    Malabon, 1470 Metro Manila
                  </p>
                </div>

                {/* Email */}
                <div className="bg-accent rounded-lg p-3 sm:p-4 md:p-6 text-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                    <FaEnvelope className="text-primary text-sm sm:text-lg md:text-xl" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-worksans font-bold text-primary mb-1 sm:mb-2">
                    EMAIL
                  </h3>

                  <p className="text-primary font-worksans text-xs sm:text-sm md:text-base">
                    myebstudios@gmail.com
                  </p>
                </div>

                {/* Working Hours */}
                <div className="bg-accent rounded-lg p-3 sm:p-4 md:p-6 text-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3 md:mb-4">
                    <FaClock className="text-primary text-sm sm:text-lg md:text-xl" />
                  </div>
                  <h3 className="text-sm sm:text-base md:text-lg font-worksans font-bold text-primary mb-1 sm:mb-2">
                    WORKING HOURS
                  </h3>
                  <p className="text-primary font-worksans text-xs sm:text-sm md:text-base mb-1">
                    Mon-Sat 08:00-20:00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
