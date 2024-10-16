import { MenuItem } from "react-pro-sidebar";
import { useNavigate, useLocation } from "react-router-dom";

const Item = ({ title, path, icon }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    navigate(path);
  };

  return (
    <MenuItem
      active={path === location.pathname}
      onClick={handleClick}
      icon={icon}
    >
      {title}
    </MenuItem>
  );
};

export default Item;