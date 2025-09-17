import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaHeartbeat,
  FaBaby,
  FaSyringe,
  FaUserMd,
  FaBandAid,
  FaBrain,
  FaStethoscope,
  FaComments,
  FaFemale,
  FaUsers,
  FaCalendarAlt,
  FaCertificate,
  FaEllipsisH,
} from "react-icons/fa";
import ServiceBanner from "../../assets/images/ServiceBanner.png";
import DoctorWithPatient from "../../assets/images/DoctorWithPatient.png";

// Define your services data separately for easy management
const servicesData = [
  {
    id: 1,
    icon: FaStethoscope,
    title: "Medical Checkup",
    description:
      "Comprehensive medical checkup to assess your overall health status and detect potential health issues early.",
    image: DoctorWithPatient,
    featured: false,
    serviceId: "medical-checkup",
    buttonText: "Learn More",
  },
  {
    id: 2,
    icon: FaComments,
    title: "Consultation",
    description:
      "Professional medical consultation services providing expert advice, diagnosis, and treatment recommendations.",
    image: DoctorWithPatient,
    featured: false,
    serviceId: "consultation",
    buttonText: "Learn More",
  },
  {
    id: 3,
    icon: FaFemale,
    title: "Maternal and Child Health",
    description:
      "Specialized healthcare services for pregnant women, new mothers, and children to ensure healthy development.",
    image: DoctorWithPatient,
    featured: false,
    serviceId: "maternal-child-health",
    buttonText: "Learn More",
  },
  {
    id: 4,
    icon: FaUsers,
    title: "Family Planning",
    description:
      "Comprehensive family planning services including contraceptive counseling and reproductive health education.",
    image: DoctorWithPatient,
    featured: false,
    serviceId: "family-planning",
    buttonText: "Learn More",
  },
  {
    id: 5,
    icon: FaSyringe,
    title: "Immunization",
    description:
      "Complete immunization programs for all ages including routine vaccines and travel immunizations.",
    image: DoctorWithPatient,
    featured: false,
    serviceId: "immunization",
    buttonText: "Learn More",
  },
  {
    id: 6,
    icon: FaHeartbeat,
    title: "Senior Citizen Care",
    description:
      "Specialized healthcare services designed for senior citizens, focusing on age-related health concerns.",
    image: DoctorWithPatient,
    featured: false,
    serviceId: "senior-citizen-care",
    buttonText: "Learn More",
  },
  {
    id: 7,
    icon: FaBandAid,
    title: "Wound Care",
    description:
      "Specialized wound care services for proper healing, infection prevention, and comprehensive wound management.",
    image: DoctorWithPatient,
    featured: false,
    serviceId: "wound-care",
    buttonText: "Learn More",
  },
  {
    id: 8,
    icon: FaCalendarAlt,
    title: "Follow-Up Visit",
    description:
      "Follow-up consultation services to monitor treatment progress and ensure continuity of care.",
    image: DoctorWithPatient,
    featured: false,
    serviceId: "follow-up-visit",
    buttonText: "Learn More",
  },
  {
    id: 9,
    icon: FaBrain,
    title: "Mental Health",
    description:
      "Mental health services providing professional support, counseling, and treatment for psychological health concerns.",
    image: DoctorWithPatient,
    featured: false,
    serviceId: "mental-health",
    buttonText: "Learn More",
  },
  {
    id: 10,
    icon: FaCertificate,
    title: "Medical Certificate",
    description:
      "Issuance of medical certificates for employment, school, legal requirements, and other official purposes.",
    image: DoctorWithPatient,
    featured: false,
    serviceId: "medical-certificate",
    buttonText: "Learn More",
  },
];

// Then use it in your component
export default function Services() {
  const navigate = useNavigate();

  // Handle click function for dynamic routing
  const handleServiceClick = (serviceId) => {
    navigate(`/services/${serviceId}`);
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
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

        {/* Primary Overlay */}
        <div className="absolute inset-0 bg-primary/60"></div>

        {/* Content */}
        <div className="relative h-full flex flex-col justify-center max-w-7xl mx-auto px-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-white mb-4">
            <button
              onClick={() => navigate("/")}
              className="font-worksans hover:text-accent transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className="font-worksans">Services</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-yeseva text-white mb-6">
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
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {servicesData.map((service) => (
              <div
                key={service.id}
                className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white max-w-sm mx-auto flex flex-col h-full"
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
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-worksans font-bold mb-3 text-primary">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed flex-grow">
                    {service.description}
                  </p>
                  <div className="flex items-center mt-auto">
                    <button
                      onClick={() => handleServiceClick(service.serviceId)}
                      className="text-secondary font-worksans font-medium transition-colors flex items-center gap-1"
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
