import React, { useContext, useEffect, useState } from "react";
import { Avatar, Box, IconButton, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../theme";
import { Menu, MenuItem, Sidebar, SubMenu } from "react-pro-sidebar";
import {
  CalendarTodayOutlined,
  ChatBubbleOutline,
  ContactsOutlined,
  DashboardOutlined,
  DonutLargeOutlined,
  MapOutlined,
  MenuOutlined,
  PeopleAltOutlined,
  PersonOutlined,
  ReceiptOutlined,
  TimelineOutlined,
  WavesOutlined,
  MailOutline as MailOutlineIcon,
  Logout as LogoutIcon,
  Description,
  PeopleAltRounded,
  DirectionsCar,
  MeetingRoom,
  Business as BusinessIcon, DraftsOutlined, SendOutlined, InboxOutlined, CreateOutlined, DeleteOutline,
} from "@mui/icons-material";
import Item from "./Item";
import { ToggledContext } from "../../../App";
import axios from "axios";
import defaultAvatar from "../../../assets/images/avatar.png";
import { useNavigate } from "react-router-dom";

const SideBar = ({onUserInfoUpdate, setUserInfoUpdated }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { toggled, setToggled } = useContext(ToggledContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  // 사용자 정보 상태 관리
  const [userInfo, setUserInfo] = useState({
    name: "",
    departmentName: "",
    employeeRank: "",
    profilePicture: "",  // 프로필 사진 추가
    email: "", // 이메일 추가
  });

  const [avatar, setAvatar] = useState(defaultAvatar);  // 기본 이미지

  // API 호출하여 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get("http://localhost:8081/employees/my-info", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const { name, departmentName, employeeRank, profilePicture, email } = response.data.data;
      setUserInfo({ name, departmentName, employeeRank, profilePicture, email });

      // 프로필 사진이 있으면 설정, 없으면 기본 이미지 사용
      setAvatar(profilePicture || defaultAvatar);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    if (onUserInfoUpdate) {
      fetchUserInfo();
      setUserInfoUpdated(false);
    }
  }, [onUserInfoUpdate]);

  // isAdmin 체크 시 userInfo.email이 존재할 때만
  const isAdmin = userInfo.email === "admin@pingpong-works.com";

  const handleLogout = async () => {
    try {
      await axios.patch(
        "http://localhost:8081/employees/update-status",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      localStorage.removeItem("accessToken");
      localStorage.removeItem("username");
      window.location.href = "/login";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const getStyles = (mode) => ({
    menuButton: {
      backgroundColor: mode === "dark" ? colors.primary[400] : '#edf9ff',
      color: mode === "dark" ? colors.gray[100] : colors.gray[900],
      "&:hover": {
        backgroundColor: mode === "dark" ? "#0c2a40" : "#dbe8f2",
        color: mode === "dark" ? "#86ccff" : colors.primary[200],
      },
    },
    menuLabel: {
      color: mode === "dark" ? colors.gray[300] : colors.gray[600],
      "&:hover": {
        backgroundColor: mode === "dark" ? colors.primary[500] : colors.primary[200],
        color: mode === "dark" ? colors.blueAccent[400] : colors.blueAccent[600],
      },
    },
  });

  const styles = getStyles(theme.palette.mode);

  const handleImageError = () => {
    setAvatar(defaultAvatar);
  };

  return (
    <Sidebar
      backgroundColor={theme.palette.mode === "dark" ? colors.primary[400] : "#edf9ff"}
      rootStyles={{
        border: 0,
        height: "100%",
      }}
      collapsed={collapsed}
      onBackdropClick={() => setToggled(false)}
      toggled={toggled}
      breakPoint="md"
    >
      <Menu
        menuItemStyles={{
          button: {
            ...styles.menuButton,
          },
        }}
      >
        <MenuItem
          rootStyles={{
            margin: "10px 0 20px 0",
            color: colors.gray[100],
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {!collapsed && (
              <Box
                display="flex"
                alignItems="center"
                gap="12px"
                sx={{ transition: ".3s ease" }}
              >
                <img
                  style={{ width: "30px", height: "30px", borderRadius: "8px" }}
                  src="https://img.icons8.com/3d-fluency/94/ping-pong.png"
                  alt="PingPong"
                />
                <Typography
                  onClick={() => navigate("/dashboard")}  // onClick 이벤트 추가
                  variant="h4"
                  fontWeight="bold"
                  textTransform="capitalize"
                  color={colors.blueAccent[450]}
                  style={{ textDecoration: 'none', cursor: 'pointer' }}  // cursor 스타일 추가
                >
                  PingPong
                </Typography>
              </Box>
            )}
            <IconButton onClick={() => setCollapsed(!collapsed)}>
              <MenuOutlined />
            </IconButton>
          </Box>
        </MenuItem>
      </Menu>
      {!collapsed && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            mb: "25px",
          }}
        >
          <Avatar
            alt={userInfo.name}
            src={avatar}  // 프로필 사진 또는 기본 이미지
            sx={{ width: "100px", height: "100px" }}
            onError={handleImageError}
          />
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h3" fontWeight="bold" color={colors.gray[100]}>
              {userInfo.name}
            </Typography>

            {!isAdmin && (  // 관리자가 아닌 경우에만 부서명과 직급을 표시
              <Typography
                variant="h6"
                fontWeight="500"
                color={colors.blueAccent[450]}
              >
                {userInfo.departmentName} | {userInfo.employeeRank}
              </Typography>
            )}

            <IconButton onClick={handleLogout} color="inherit">
              <LogoutIcon />
            </IconButton>
          </Box>
        </Box>
      )}

      <Box pl={collapsed ? undefined : "5%"}>
        <Menu
          menuItemStyles={{
            button: {
              ...styles.menuButton,
            },
          }}
        >
          <Item title="MainPage" path="/" icon={<DashboardOutlined />} />
        </Menu>
        <Typography
          variant="h6"
          sx={{ m: "15px 0 5px 20px" }}
        >
          {!collapsed ? "Communication" : " "}
        </Typography>
        <Menu
          menuItemStyles={{
            button: {
              ...styles.menuButton,
            },
          }}
        >
          <SubMenu
            title="메일"
            label="메일"
            icon={<MailOutlineIcon />}
            rootStyles={{
              ...styles.menuButton,
            }}
          >
            <Item
              title="메일 작성"
              path="/new"
              colors={colors}
              icon={<CreateOutlined  />}
            />
            <Item
              title="받은 메일함"
              path="/mailbox/0"
              colors={colors}
              icon={<InboxOutlined  />}
            />
            <Item
              title="보낸 메일함"
              path="/mailbox/1"
              colors={colors}
              icon={<SendOutlined  />}
            />
            <Item
              title="내게 쓴 메일함"
              path="/mailbox/3"
              colors={colors}
              icon={<DraftsOutlined  />}
            />
            <Item
              title="휴지통"
              path="/mailbox/2"
              colors={colors}
              icon={<DeleteOutline  />}
            />
          </SubMenu>
          <Item title="메신저" path="/chat" icon={<ChatBubbleOutline />} />
        </Menu>
        <Typography
          variant="h6"
          sx={{ m: "15px 0 5px 20px" }}
        >
          {!collapsed ? "Pages" : " "}
        </Typography>
        <Menu
          menuItemStyles={{
            button: {
              ...styles.menuButton,
            },
          }}
        >
          <Item title="전자결재" path="/elec" icon={<ContactsOutlined />} />
          <Item title="캘린더" path="/calendar" icon={<CalendarTodayOutlined />} />
          <Item title="게시판" path="/boards" icon={<ReceiptOutlined />} />
        </Menu>
        <Typography
          variant="h6"
          sx={{ m: "15px 0 5px 20px" }}
        >
          {!collapsed ? "Resource" : " "}
        </Typography>
        <Menu
          menuItemStyles={{
            button: {
              ...styles.menuButton,
            },
          }}
        >
          <Item title="주소록" path="/team" icon={<PeopleAltOutlined />} />
          {userInfo.email && isAdmin && ( // email이 있을 때만 렌더링
            <>
              <Item title="부서 관리" path="/department-management" icon={<BusinessIcon />} />
              <Item title="결재 문서 관리" path="/document" icon={<Description />} />
              <Item title="직원 관리" path="/manage" icon={<PeopleAltRounded />} />
              <Item title="차량 관리" path="/car" icon={<DirectionsCar />} />
              <Item title="회의실 관리" path="/room" icon={<MeetingRoom />} />
            </>
          )}
        </Menu>
      </Box>
    </Sidebar>
  );
};

export default SideBar;
