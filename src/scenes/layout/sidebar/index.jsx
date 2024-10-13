import { Avatar, Box, IconButton, Typography, useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { tokens } from "../../../theme";
import { Menu, MenuItem, Sidebar } from "react-pro-sidebar";
import {
  BarChartOutlined,
  CalendarTodayOutlined,
  ChatBubbleOutline,
  ContactsOutlined,
  DashboardOutlined,
  DonutLargeOutlined,
  HelpOutlineOutlined,
  MapOutlined,
  MenuOutlined,
  PeopleAltOutlined,
  PersonOutlined,
  ReceiptOutlined,
  TimelineOutlined,
  WavesOutlined,
} from "@mui/icons-material";
import avatar from "../../../assets/images/avatar.png";
import logo from "../../../assets/images/logo.png";
import Item from "./Item";
import { ToggledContext } from "../../../App";
import axios from "axios"; // axios 사용

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { toggled, setToggled } = useContext(ToggledContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // 사용자 정보 상태 관리
  const [userInfo, setUserInfo] = useState({
    name: "",
    departmentName: "",
    employeeRank: "",
  });

  // API 호출하여 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get("http://localhost:8081/employees/my-info", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        console.log(response); // 응답 로그 확인
        const { name, departmentName, employeeRank } = response.data.data; // 정확한 경로 사용
        setUserInfo({ name, departmentName, employeeRank });
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <Sidebar
      backgroundColor={colors.primary[400]}
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
          button: { ":hover": { background: "transparent" } },
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
                  src={logo}
                  alt="PingPong"
                />
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  textTransform="capitalize"
                  color={colors.blueAccent[450]}
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
            alt="avatar"
            src={avatar}
            sx={{ width: "100px", height: "100px" }}
          />
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h3" fontWeight="bold" color={colors.gray[100]}>
              {userInfo.name}
            </Typography>
            <Typography
              variant="h6"
              fontWeight="500"
              color={colors.blueAccent[450]}
            >
              {userInfo.departmentName} | {userInfo.employeeRank}
            </Typography>
          </Box>
        </Box>
      )}

      <Box mb={5} pl={collapsed ? undefined : "5%"}>
        <Menu
          menuItemStyles={{
            button: {
              ":hover": {
                color: "#74ade2",
                background: "transparent",
                transition: ".4s ease",
              },
            },
          }}
        >
          <Item
            title="MainPage"
            path="/"
            colors={colors}
            icon={<DashboardOutlined />}
          />
        </Menu>
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{ m: "15px 0 5px 20px" }}
        >
          {!collapsed ? "Mail" : " "}
        </Typography>
        <Menu
          menuItemStyles={{
            button: {
              ":hover": {
                color: "#74ade2",
                background: "transparent",
                transition: ".4s ease",
              },
            },
          }}
        >
          <Item
            title="메일 작성"
            path="/new"
            colors={colors}
            icon={<PersonOutlined />}
          />
          <Item
            title="전체 메일함"
            path="/mailbox/-1"
            colors={colors}
            icon={<BarChartOutlined />}
          />
          <Item
            title="받은 메일함"
            path="/mailbox/0"
            colors={colors}
            icon={<DonutLargeOutlined />}
          />
          <Item
            title="보낸 메일함"
            path="/mailbox/1"
            colors={colors}
            icon={<TimelineOutlined />}
          />
          <Item
            title="내게 쓴 메일함"
            path="/mailbox/3"
            colors={colors}
            icon={<WavesOutlined />}
          />
          <Item
              title="휴지통"
              path="/mailbox/2"
              colors={colors}
              icon={<MapOutlined />}
          />
        </Menu>
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{ m: "15px 0 5px 20px" }}
        >
          {!collapsed ? "Pages" : " "}
        </Typography>
        <Menu
          menuItemStyles={{
            button: {
              ":hover": {
                color: "#74ade2",
                background: "transparent",
                transition: ".4s ease",
              },
            },
          }}
        >
          <Item
            title="전자결재"
            path="/elec"
            colors={colors}
            icon={<ContactsOutlined />}
          />
          <Item
            title="캘린더"
            path="/calendar"
            colors={colors}
            icon={<CalendarTodayOutlined />}
          />
          <Item
            title="채팅"
            path="/chat"
            colors={colors}
            icon={<ChatBubbleOutline />}
          />
          <Item
            title="게시판"
            path="/boards"
            colors={colors}
            icon={<ReceiptOutlined />}
          />
          <Item
            title="문의사항"
            path="/faq"
            colors={colors}
            icon={<HelpOutlineOutlined />}
          />
        </Menu>
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{ m: "15px 0 5px 20px" }}
        >
          {!collapsed ? "Data" : " "}
        </Typography>{" "}
        <Menu
          menuItemStyles={{
            button: {
              ":hover": {
                color: "#74ade2",
                background: "transparent",
                transition: ".4s ease",
              },
            },
          }}
        >
          <Item
            title="조직도"
            path="/team"
            colors={colors}
            icon={<PeopleAltOutlined />}
          />
          <Item
            title="주소록"
            path="/contacts"
            colors={colors}
            icon={<ContactsOutlined />}
          />
        </Menu>
      </Box>
    </Sidebar>
  );
};

export default SideBar;
