import SideBarButtonLink from "./SideBarButtonLink";
import HomeIcon from "../assets/home.svg?react";
import JobIcon from "../assets/suitcase.svg?react";

const SideBarContent = () => {
  return (
    <div className="p-4 relative w-full">
      <SideBarButtonLink link="/" name="Home" img={HomeIcon} />
      <SideBarButtonLink link="/jobs" name="Jobs" img={JobIcon} />
      <SideBarButtonLink link="/messages" name="Messages" img={JobIcon} />
    </div>
  );
};

export default SideBarContent;
