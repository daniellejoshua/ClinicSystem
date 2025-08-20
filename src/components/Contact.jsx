import {
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlineClock,
} from "react-icons/hi";

export default function Contact() {
  return (
    <section className="w-screen py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-lg md:text-xl text-secondary font-worksans font-medium uppercase tracking-wider mb-4">
            GET IN TOUCH
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl text-primary font-yeseva mb-8">
            Contact
          </h2>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Emergency Card */}
          <div className="bg-accent text-primary p-4 lg:p-8 rounded-lg text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-3 lg:mb-6">
              <HiOutlinePhone className="text-2xl lg:text-4xl" />
            </div>
            <h3 className="text-sm lg:text-xl font-worksans font-bold mb-2 lg:mb-4 uppercase">
              Emergency
            </h3>
            <div className="space-y-1 lg:space-y-2">
              <p className="font-worksans text-xs lg:text-base">
                (237) 681-812-255
              </p>
              <p className="font-worksans text-xs lg:text-base">
                (237) 666-331-894
              </p>
            </div>
          </div>

          {/* Location Card */}
          <div className="bg-primary text-white p-4 lg:p-8 rounded-lg text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-3 lg:mb-6">
              <HiOutlineLocationMarker className="text-2xl lg:text-4xl" />
            </div>
            <h3 className="text-sm lg:text-xl font-worksans font-bold mb-2 lg:mb-4 uppercase">
              Location
            </h3>
            <div className="space-y-1 lg:space-y-2">
              <p className="font-worksans text-xs lg:text-base">
                0123 Some place
              </p>
              <p className="font-worksans text-xs lg:text-base">
                9876 Some country
              </p>
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-accent text-primary p-4 lg:p-8 rounded-lg text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-3 lg:mb-6">
              <HiOutlineMail className="text-2xl lg:text-4xl" />
            </div>
            <h3 className="text-sm lg:text-xl font-worksans font-bold mb-2 lg:mb-4 uppercase">
              Email
            </h3>
            <div className="space-y-1 lg:space-y-2">
              <p className="font-worksans text-xs lg:text-base">
                justinnabunturan@gmail.com
              </p>
              <p className="font-worksans text-xs lg:text-base">
                justinnabunturan@gmail.com
              </p>
            </div>
          </div>

          {/* Working Hours Card */}
          <div className="bg-accent text-primary p-4 lg:p-8 rounded-lg text-center hover:shadow-lg transition-shadow">
            <div className="flex justify-center mb-3 lg:mb-6">
              <HiOutlineClock className="text-2xl lg:text-4xl" />
            </div>
            <h3 className="text-sm lg:text-xl font-worksans font-bold mb-2 lg:mb-4 uppercase">
              Working Hours
            </h3>
            <div className="space-y-1 lg:space-y-2">
              <p className="font-worksans text-xs lg:text-base">
                Mon-Sat 09:00-20:00
              </p>
              <p className="font-worksans text-xs lg:text-base">
                Sunday Emergency only
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
