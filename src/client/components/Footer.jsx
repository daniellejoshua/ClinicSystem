import {
  FaLinkedinIn,
  FaFacebookF,
  FaInstagram,
  FaPaperPlane,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-screen bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Clinic Info */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-yeseva mb-4">
              TONSUYA SUPER HEALTH CENTER
            </h3>
            <p className="text-gray-300 font-worksans leading-relaxed">
              Leading the Way in Medical Excellence, Trusted Care.
            </p>
          </div>

          {/* Will convert this to use react router */}
          <div>
            <h4 className="text-lg font-worksans font-semibold mb-4">
              Important Links
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-accent transition-colors font-worksans"
                >
                  Appointment
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-accent transition-colors font-worksans"
                >
                  Contacts
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-accent transition-colors font-worksans"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-300 hover:text-accent transition-colors font-worksans"
                >
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="text-lg font-worksans font-semibold mb-4">
              Contact Us
            </h4>
            <div className="space-y-2 text-gray-300 font-worksans">
              <p> (237) 681-812-255</p>
              <p>Email: justinnabunturan@gmail.com</p>
              <p>Address: Ortega St. Tonsuya, Malabon City</p>
              <p>Philippines</p>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-worksans font-semibold mb-4">
              Newsletter
            </h4>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-accent/20 border border-accent/30 rounded-lg px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:border-accent font-worksans"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-accent hover:bg-accent/80 text-white p-2 rounded-md transition-colors">
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-600 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 font-worksans text-sm mb-4 md:mb-0">
            © 2025 Tonsuya Super Health Center All Rights Reserved
          </p>

          {/* Social Media Icons */}
          <div className="flex space-x-4">
            <a
              href="#"
              className="w-10 h-10 bg-accent rounded-full flex items-center justify-center hover:bg-accent/80 transition-colors"
            >
              <FaLinkedinIn className="text-white text-sm" />
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-accent rounded-full flex items-center justify-center hover:bg-accent/80 transition-colors"
            >
              <FaFacebookF className="text-white text-sm" />
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-accent rounded-full flex items-center justify-center hover:bg-accent/80 transition-colors"
            >
              <FaInstagram className="text-white text-sm" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
