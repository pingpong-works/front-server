import { Box, Typography, Avatar, Grid, Paper, Button, Stack } from "@mui/material";
import { Header } from "../../components";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Mypage = () => {
  const [userInfo, setUserInfo] = useState({
    employeeId: "",
    name: "",
    email: "",
    profilePicture: "",
    departmentName: "",
    phoneNumber: "",
    extensionNumber: "",
    emergencyNumber: "",
    address: "",
    vehicleNumber: "",
    createdAt: "",
    employeeRank: "",
    attendanceStatus: "",
  });

  const navigate = useNavigate();

  // 출근/퇴근 상태 변경
  const toggleAttendanceStatus = async () => {
    try {
      const newStatus = userInfo.attendanceStatus === "출근" ? "퇴근" : "출근";

      const requestData = {
        employeeId: userInfo.employeeId,
        status: newStatus,
      };

      const response = await axios.post("http://localhost:50000/employees/attendance", requestData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      // 영문 상태를 한글로 변환하는 로직
      const translatedStatus = response.data.data.attendanceStatus === "CLOCKED_IN" ? "출근" : "퇴근";

      setUserInfo((prevState) => ({
        ...prevState,
        attendanceStatus: translatedStatus,
      }));
    } catch (error) {
      console.error("Error toggling attendance status:", error.response?.data || error);
    }
  };

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get("http://localhost:50000/employees/my-info", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setUserInfo(response.data.data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <Box m="20px">
      <Header title="마이페이지" subtitle="직원 정보" />
      <Box component={Paper} p={3} mt={2} elevation={3}>
        <Grid container spacing={2} justifyContent="center">
          {/* 프로필 사진 및 이름 */}
          <Grid item xs={12} md={3} align="center">
            <Avatar
              alt={userInfo.name}
              src={userInfo.profilePicture || "/path-to-default-avatar.png"} // 기본 아바타 경로 설정
              sx={{ width: 120, height: 120 }}
            />
            <Typography variant="h5" mt={2}>
              {userInfo.name}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {userInfo.departmentName} | {userInfo.employeeRank}
            </Typography>

            {/* 버튼들 */}
            <Stack spacing={2} mt={3} direction="column">
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/my-info/edit")}
              >
                내 정보 수정
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => navigate("/change-password")}
              >
                비밀번호 변경
              </Button>
            </Stack>
          </Grid>

          {/* 사용자 세부 정보 */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold">
                  연락 정보
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>이메일:</strong> {userInfo.email}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>휴대폰 번호:</strong> {userInfo.phoneNumber}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>내선 번호:</strong> {userInfo.extensionNumber || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>비상 연락처:</strong> {userInfo.emergencyNumber || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" fontWeight="bold" mt={2}>
                  추가 정보
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>주소:</strong> {userInfo.address || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>차량 번호:</strong> {userInfo.vehicleNumber || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>입사일:</strong> {new Date(userInfo.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body1">
                  <strong>출퇴근 상태:</strong> {userInfo.attendanceStatus}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* 출근/퇴근 버튼 */}
        <Box mt={4} display="flex" justifyContent="center">
          <Button
            variant="contained"
            color={userInfo.attendanceStatus === "출근" ? "error" : "success"}
            onClick={toggleAttendanceStatus}
            sx={{ width: "200px" }}
          >
            {userInfo.attendanceStatus === "출근" ? "퇴근" : "출근"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Mypage;
