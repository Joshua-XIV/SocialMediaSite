import { Link } from "react-router-dom";
import { useThemeStyles } from "../hooks/useThemeStyles";
import type React from "react";

interface SideBarButtonLinkProps {
  name: string;
  img?: string;
  link: string;
}

const SideBarButtonLink = ({name, img : Icon, link} : SideBarButtonLinkProps) => {
  const { textColor, bgAntiColor } = useThemeStyles()
  return (
    <Link to={link} className={`hover:bg-gray-500/20 ${textColor} rounded-3xl p-4 flex`}>
      <div className="flex items-center gap-x-4">
        {Icon && <Icon {...{fill: bgAntiColor, width: 24, height: 24 } as React.SVGProps<SVGSVGElement>}/>}
        {name}
      </div>
    </Link>
  )
}

export default SideBarButtonLink