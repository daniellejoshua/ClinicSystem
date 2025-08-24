import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaHeartbeat,
  FaBaby,
  FaSyringe,
  FaUserMd,
  FaBrain,
  FaBandAid,
  FaCheckCircle,
  FaClock,
  FaUsers,
  FaStethoscope,
  FaComments,
  FaFemale,
  FaCalendarAlt,
  FaCertificate,
  FaEllipsisH,
} from "react-icons/fa";
import DoctorWithPatient from "../../assets/images/DoctorWithPatient.png";

// Service data with detailed information
const servicesDetailData = {
  "medical-checkup": {
    id: 1,
    icon: FaStethoscope,
    title: "Medical Checkup",
    subtitle: "Comprehensive Health Assessment",
    description:
      "Comprehensive medical checkup to assess your overall health status, detect potential health issues early, and provide preventive care recommendations.",
    image: DoctorWithPatient,
    features: [
      "Complete Physical Examination",
      "Vital Signs Monitoring",
      "Blood Pressure Check",
      "Health History Review",
      "Basic Laboratory Tests",
      "Health Risk Assessment",
    ],
    benefits: [
      "Early Disease Detection",
      "Preventive Healthcare",
      "Health Status Monitoring",
      "Personalized Health Recommendations",
    ],
  },
  consultation: {
    id: 2,
    icon: FaComments,
    title: "Consultation",
    subtitle: "Professional Medical Advice",
    description:
      "Professional medical consultation services providing expert advice, diagnosis, and treatment recommendations for various health concerns.",
    image: DoctorWithPatient,
    features: [
      "Medical History Review",
      "Symptom Assessment",
      "Professional Diagnosis",
      "Treatment Planning",
      "Medication Prescription",
      "Follow-up Recommendations",
    ],
    benefits: [
      "Expert Medical Guidance",
      "Accurate Diagnosis",
      "Personalized Treatment Plans",
      "Peace of Mind",
    ],
  },
  "maternal-child-health": {
    id: 3,
    icon: FaFemale,
    title: "Maternal and Child Health",
    subtitle: "Comprehensive Care for Mothers and Children",
    description:
      "Specialized healthcare services for pregnant women, new mothers, and children to ensure healthy development and wellbeing.",
    image: DoctorWithPatient,
    features: [
      "Prenatal Care",
      "Postnatal Care",
      "Child Development Monitoring",
      "Nutritional Counseling",
      "Breastfeeding Support",
      "Growth Assessment",
    ],
    benefits: [
      "Healthy Pregnancy Outcomes",
      "Child Development Support",
      "Expert Maternal Care",
      "Family Health Education",
    ],
  },
  "family-planning": {
    id: 4,
    icon: FaUsers,
    title: "Family Planning",
    subtitle: "Reproductive Health Services",
    description:
      "Comprehensive family planning services including contraceptive counseling, reproductive health education, and family planning consultations.",
    image: DoctorWithPatient,
    features: [
      "Contraceptive Counseling",
      "Reproductive Health Assessment",
      "Family Planning Education",
      "Birth Control Methods",
      "Fertility Consultation",
      "Sexual Health Guidance",
    ],
    benefits: [
      "Informed Family Planning",
      "Reproductive Health Support",
      "Personalized Contraceptive Options",
      "Family Health Planning",
    ],
  },
  immunization: {
    id: 5,
    icon: FaSyringe,
    title: "Immunization",
    subtitle: "Vaccination and Immunization Services",
    description:
      "Complete immunization programs for all ages including routine vaccines, travel immunizations, and special vaccination requirements.",
    image: DoctorWithPatient,
    features: [
      "Childhood Vaccination Schedule",
      "Adult Immunizations",
      "Travel Vaccines",
      "Flu Vaccinations",
      "COVID-19 Vaccines",
      "Immunization Records Management",
    ],
    benefits: [
      "Disease Prevention",
      "Community Health Protection",
      "Travel Safety",
      "Vaccination Documentation",
    ],
  },
  "senior-citizen-care": {
    id: 6,
    icon: FaHeartbeat,
    title: "Senior Citizen Care",
    subtitle: "Specialized Care for Elderly Patients",
    description:
      "Specialized healthcare services designed for senior citizens, focusing on age-related health concerns and maintaining quality of life.",
    image: DoctorWithPatient,
    features: [
      "Geriatric Health Assessment",
      "Chronic Disease Management",
      "Medication Review",
      "Fall Prevention Counseling",
      "Nutrition Assessment",
      "Mental Health Support",
    ],
    benefits: [
      "Age-Appropriate Healthcare",
      "Quality of Life Improvement",
      "Chronic Condition Management",
      "Comprehensive Elderly Care",
    ],
  },
  "wound-care": {
    id: 7,
    icon: FaBandAid,
    title: "Wound Care",
    subtitle: "Professional Wound Treatment and Management",
    description:
      "Specialized wound care services for proper healing, infection prevention, and comprehensive wound management for all types of injuries.",
    image: DoctorWithPatient,
    features: [
      "Wound Assessment and Cleaning",
      "Dressing Application",
      "Infection Prevention",
      "Healing Progress Monitoring",
      "Pain Management",
      "Wound Care Education",
    ],
    benefits: [
      "Proper Wound Healing",
      "Infection Prevention",
      "Reduced Scarring",
      "Professional Care Standards",
    ],
  },
  "follow-up-visit": {
    id: 8,
    icon: FaCalendarAlt,
    title: "Follow-Up Visit",
    subtitle: "Continued Care and Monitoring",
    description:
      "Follow-up consultation services to monitor treatment progress, adjust medications, and ensure continuity of care for ongoing health conditions.",
    image: DoctorWithPatient,
    features: [
      "Treatment Progress Assessment",
      "Medication Adjustment",
      "Symptom Monitoring",
      "Care Plan Updates",
      "Health Status Review",
      "Next Steps Planning",
    ],
    benefits: [
      "Continuity of Care",
      "Treatment Optimization",
      "Health Progress Tracking",
      "Ongoing Medical Support",
    ],
  },
  "mental-health": {
    id: 9,
    icon: FaBrain,
    title: "Mental Health",
    subtitle: "Comprehensive Mental Health Services",
    description:
      "Mental health services providing professional support, counseling, and treatment for various psychological and emotional health concerns.",
    image: DoctorWithPatient,
    features: [
      "Mental Health Assessment",
      "Counseling Services",
      "Stress Management",
      "Depression Treatment",
      "Anxiety Support",
      "Mental Wellness Programs",
    ],
    benefits: [
      "Improved Mental Wellbeing",
      "Professional Support",
      "Stress Reduction",
      "Emotional Health Support",
    ],
  },
  "medical-certificate": {
    id: 10,
    icon: FaCertificate,
    title: "Medical Certificate",
    subtitle: "Official Medical Documentation",
    description:
      "Issuance of medical certificates for employment, school, legal requirements, and other official purposes requiring medical documentation.",
    image: DoctorWithPatient,
    features: [
      "Employment Medical Clearance",
      "Fitness to Work Certificate",
      "School Health Certificate",
      "Travel Medical Certificate",
      "Disability Assessment",
      "Legal Medical Documentation",
    ],
    benefits: [
      "Official Medical Documentation",
      "Employment Requirements",
      "Legal Compliance",
      "Professional Certification",
    ],
  },
  other: {
    id: 11,
    icon: FaEllipsisH,
    title: "Other Services",
    subtitle: "Additional Healthcare Services",
    description:
      "Various other healthcare services and medical procedures not covered in standard categories, customized to meet specific patient needs.",
    image: DoctorWithPatient,
    features: [
      "Specialized Procedures",
      "Custom Health Services",
      "Medical Referrals",
      "Health Education",
      "Community Health Programs",
      "Emergency Medical Services",
    ],
    benefits: [
      "Comprehensive Healthcare",
      "Customized Medical Solutions",
      "Specialized Care Access",
      "Community Health Support",
    ],
  },
};

export default function ServiceDetail() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const service = servicesDetailData[serviceId];

  // Get all available services except the current one
  const allServices = Object.entries(servicesDetailData).filter(
    ([key]) => key !== serviceId
  );

  // Randomly shuffle and select 5 services for sidebar
  const getRandomSidebarServices = () => {
    const shuffled = [...allServices].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5).map(([key, service]) => ({
      icon: service.icon,
      title: service.title,
      link: key,
    }));
  };

  const sidebarServices = getRandomSidebarServices();

  const handleSidebarNavigation = (serviceLink) => {
    navigate(`/services/${serviceLink}`);
    setTimeout(() => {
      window.scrollTo(0, 0);
    }, 100);
  };

  // If service not found, redirect to services page
  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">
            Service Not Found
          </h1>
          <button
            onClick={() => navigate("/services")}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[400px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${service.image})`,
          }}
        ></div>
        <div className="absolute inset-0 bg-primary/70"></div>

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
            <button
              onClick={() => navigate("/services")}
              className="font-worksans hover:text-accent transition-colors"
            >
              Services
            </button>
            <span>/</span>
            <span className="font-worksans">{service.title}</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-yeseva text-white mb-4">
            {service.title}
          </h1>
          <p className="text-xl text-white/90 font-worksans">
            {service.subtitle}
          </p>
        </div>
      </section>

      {/* Service Details Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Sidebar - Service Categories */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-primary text-white p-8">
                  <div className="flex items-center gap-4">
                    <service.icon className="text-accent text-3xl" />
                    <span className="font-worksans font-semibold text-xl">
                      {service.title}
                    </span>
                  </div>
                </div>
                <div className="space-y-0">
                  {sidebarServices.map((sidebarService, index) => (
                    <div
                      key={index}
                      onClick={() =>
                        handleSidebarNavigation(sidebarService.link)
                      }
                      className="flex items-center gap-5 p-7 hover:bg-gray-50 cursor-pointer border-b transition-all hover:shadow-sm"
                    >
                      <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                        <sidebarService.icon className="text-2xl text-secondary" />
                      </div>
                      <span className="font-worksans text-gray-700 text-lg font-medium">
                        {sidebarService.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* View All Services Button */}
                <div className="p-8 bg-gray-50 border-t">
                  <button
                    onClick={() => navigate("/services")}
                    className="w-full bg-primary text-white px-8 py-4 rounded-lg font-worksans font-semibold hover:bg-primary/90 transition-colors text-lg"
                  >
                    View All Services
                  </button>
                </div>
              </div>
            </div>

            {/* Right Content - Service Details */}
            <div className="lg:col-span-2">
              <div className="space-y-8">
                {/* Service Title */}
                <div>
                  <h2 className="text-4xl font-yeseva text-primary mb-2">
                    {service.title}
                  </h2>
                  <p className="text-xl text-gray-600 font-worksans">
                    {service.subtitle}
                  </p>
                </div>

                {/* Wide Service Image */}
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10"></div>
                </div>

                {/* What's Included Section */}
                <div>
                  <h3 className="text-2xl font-yeseva text-primary mb-6">
                    What's Included
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-secondary rounded-full flex-shrink-0"></div>
                        <span className="text-gray-700 font-worksans">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description Section */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-yeseva text-primary mb-4">
                    A passion for putting patients first
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-worksans">
                    {service.description}
                  </p>
                  <p className="text-gray-600 leading-relaxed font-worksans">
                    Our experienced medical team is dedicated to providing
                    comprehensive healthcare services with a focus on
                    patient-centered care and clinical excellence.
                  </p>
                </div>

                {/* Service Information Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border-2 border-gray-100 p-6 rounded-lg hover:shadow-lg transition-all text-center">
                    <div className="flex justify-center mb-3">
                      <FaClock className="text-2xl text-accent" />
                    </div>
                    <h4 className="font-worksans font-semibold text-primary mb-2">
                      Avalaibility
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Monday - Friday
                      <br />
                      8:00 AM - 5:00 PM
                    </p>
                  </div>

                  <div className="bg-primary text-white p-6 rounded-lg hover:shadow-lg transition-all text-center">
                    <div className="flex justify-center mb-3">
                      <FaUsers className="text-2xl text-accent" />
                    </div>
                    <h4 className="font-worksans font-semibold mb-2">
                      Expert Team
                    </h4>
                    <p className="text-white/90 text-sm">
                      Professional
                      <br />
                      Medical Staff
                    </p>
                  </div>

                  <div className="bg-white border-2 border-gray-100 p-6 rounded-lg hover:shadow-lg transition-all text-center">
                    <div className="flex justify-center mb-3">
                      <FaCheckCircle className="text-2xl text-accent" />
                    </div>
                    <h4 className="font-worksans font-semibold text-primary mb-2">
                      Quality Care
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Certified
                      <br />
                      Healthcare Services
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-20">
                <button className="bg-primary text-white px-8 py-3 rounded-full font-worksans font-semibold hover:bg-primary/90 transition-colors">
                  Book Appointment
                </button>
                <button
                  onClick={() => navigate("/contact")}
                  className="bg-accent text-primary px-8 py-3 rounded-full font-worksans font-semibold hover:bg-accent/90 transition-colors"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
