import SideBarButtonLink from "./SideBarButtonLink"
import HomeIcon from '../assets/home.svg?react';

const SideBarContent = () => {
  return (
      <div className="p-4">
        <SideBarButtonLink link="/" name="Home" img={HomeIcon}/>
        <SideBarButtonLink link="/jobs" name="Jobs" img={""}/>
      </div>
  )
}

export default SideBarContent