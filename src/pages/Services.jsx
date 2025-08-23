import React from "react";
import {
  FaHeartbeat,
  FaDna,
  FaTint,
  FaBaby,
  FaSyringe,
  FaUserMd,
  FaBandAid,
  FaCalendarCheck,
  FaBrain,
  FaCertificate,
} from "react-icons/fa";
import ServiceBanner from "../assets/images/ServiceBanner.png";
import DoctorWithPatient from "../assets/images/DoctorWithPatient.png";

// Define your services data separately for easy management
const servicesData = [
  {
    id: 1,
    icon: FaHeartbeat,
    title: "Cardiology",
    description:
      "Comprehensive heart care services including diagnostics, treatment, and preventive care for all cardiac conditions.",
    image: DoctorWithPatient,
    featured: false, // Changed from true to false
    link: "/services/cardiology",
    buttonText: "Learn More", // Changed to "Learn More"
  },
  {
    id: 2,
    icon: FaBaby,
    title: "Pediatric Care",
    description:
      "Specialized medical care for infants, children, and adolescents with experienced pediatric specialists.",
    image: DoctorWithPatient,
    featured: false,
    link: "/services/pediatrics",
    buttonText: "Learn More", // Changed to "Learn More"
  },
  {
    id: 3,
    icon: FaSyringe,
    title: "Vaccination Services",
    description:
      "Complete immunization programs for all ages including travel vaccines and routine immunizations.",
    image: DoctorWithPatient,
    featured: false,
    link: "/services/vaccination",
    buttonText: "Learn More", // Changed to "Learn More"
  },
  {
    id: 4,
    icon: FaUserMd,
    title: "General Medicine",
    description:
      "Comprehensive primary healthcare services for routine check-ups, diagnosis, and treatment.",
    image: DoctorWithPatient,
    featured: false,
    link: "/services/general-medicine",
    buttonText: "Learn More",
  },
  {
    id: 5,
    icon: FaBrain,
    title: "Mental Health",
    description: "Mental Health Care for Patients",
    image: DoctorWithPatient,
    featured: false,
    link: "/services/neurology",
    buttonText: "Learn More", // Changed to "Learn More"
  },
  {
    id: 6,
    icon: FaBandAid,
    title: "Emergency Care",
    description:
      "24/7 emergency medical services with rapid response team and state-of-the-art emergency facilities.",
    image: DoctorWithPatient,
    featured: false,
    link: "/services/emergency",
    buttonText: "Learn More", // Changed to "Learn More"
  },
];

// Then use it in your component
export default function Services() {
  // Handle click function for dynamic routing
  const handleServiceClick = (link) => {
    // You can use React Router here
    // navigate(link);
    console.log(`Navigating to: ${link}`);
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
            <span className="font-worksans">Home</span>
            <span>/</span>
            <span className="font-worksans">Services</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-yeseva text-primary mb-6">
            Our Services
          </h1>
        </div>

        {/* Bottom Accent Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-2 flex">
          <div className="w-1/3 bg-accent"></div>
          <div className="w-1/3 bg-primary"></div>
          <div className="w-1/3 bg-secondary"></div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {servicesData.map((service) => (
              <div
                key={service.id}
                className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white max-w-xs mx-auto"
              >
                {/* Card Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  {/* All cards now have the same black overlay */}
                  <div className="absolute inset-0 bg-black/40"></div>

                  {/* Icon - Hidden on hover */}
                  <div className="absolute top-4 right-4 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                      <service.icon className="text-xl text-accent" />
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                      <service.icon className="text-2xl text-accent" />
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <h3 className="text-xl font-worksans font-bold mb-3 text-primary">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleServiceClick(service.link)}
                      className="text-secondary font-worksans font-medium  transition-colors flex items-center gap-1"
                    >
                      {service.buttonText}
                      <span className="text-primary">→</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      {/*     <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-yeseva text-white mb-6">
            Need Medical Assistance?
          </h2>
          <p className="text-xl text-white/90 mb-8 font-worksans">
            Our experienced medical team is here to provide you with the best
            healthcare services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-accent text-primary px-8 py-3 rounded-full font-worksans font-semibold hover:bg-accent/90 transition-colors">
              Book Appointment
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-worksans font-semibold hover:bg-white hover:text-primary transition-colors">
              Emergency Contact
            </button>
          </div>
        </div>
      </section> */}
    </div>
  );
}
