export default function TopBar() {
  return (
    <>
      <div className="h-[80px] w-full flex gap-4 items-center border-b border-red-600">
        <h2 className="font-yeseva text-2xl w-full relative left-8 text-primary ">
          TONSUYA SUPER HEALTH CENTER
        </h2>
        <div className="flex relative ml-36 w-full justify-evenly">
          <div>
            <p className="font-worksans font-medium"> Emergency</p>
          </div>
          <div>
            <p className="font-worksans font-medium">Workhours</p>
          </div>
          <div>
            <p className="font-worksans font-medium">Emergency</p>
          </div>
        </div>
      </div>
    </>
  );
}
