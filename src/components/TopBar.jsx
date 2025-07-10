import { FiPhoneCall, FiClock, FiMapPin } from "react-icons/fi";
export default function TopBar() {
  return (
    <>
      <div className="min-h-[80px] w-full flex flex-col xl:flex-row gap-4 items-center border-b border-red-600 p-4 xl:p-0">
        <h2 className="font-yeseva text-2xl text-primary hidden xl:block xl:w-full xl:relative xl:left-8">
          TONSUYA SUPER HEALTH CENTER
        </h2>
        <div className="flex flex-wrap xl:flex-row xl:relative xl:ml-36 gap-4 w-full justify-center xl:justify-evenly">
          <div className="flex gap-4 items-center">
            <FiPhoneCall className="text-2xl xl:text-3xl text-primary flex-shrink-0" />
            <div className="flex flex-col">
              <p className="font-worksans font-medium text-sm xl:text-base">
                Emergency
              </p>
              <p className="text-secondary text-sm xl:text-base">
                (237) 681-812-255
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <FiClock className="text-2xl xl:text-3xl text-primary flex-shrink-0" />
            <div className="flex flex-col">
              <p className="font-worksans font-medium text-primary text-sm xl:text-base">
                WORK HOUR
              </p>
              <p className="text-secondary text-sm xl:text-base">
                08:00 - 20:00 Everyday
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <FiMapPin className="text-2xl xl:text-3xl text-primary flex-shrink-0" />
            <div className="flex flex-col">
              <p className="font-worksans font-medium text-primary text-sm xl:text-base">
                LOCATION
              </p>
              <p className="text-secondary text-sm xl:text-base">
                Ortega St, Malabon City
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
