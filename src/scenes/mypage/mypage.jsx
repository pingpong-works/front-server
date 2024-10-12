import { 
  Box, 
  Typography, 
  Avatar, 
  Grid, 
  Paper, 
  Button, 
  Stack, 
  useTheme, 
  useMediaQuery,
  Snackbar,
  Alert,
  Tabs,
  Tab
} from "@mui/material";
import { Header } from "../../components";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { tokens } from "../../theme";

const Mypage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isXsDevices = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmDevices = useMediaQuery(theme.breakpoints.down('md'));

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
  });

  const [attendanceEvents, setAttendanceEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // To handle button loading state
  const [errorMessage, setErrorMessage] = useState(""); // For Snackbar
  const [tabValue, setTabValue] = useState(0); // For managing tab selection
  const [attendanceStatistics, setAttendanceStatistics] = useState([]); // For storing attendance statistics

  const navigate = useNavigate();

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get("http://localhost:8081/employees/my-info", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setUserInfo(response.data.data);
        // 사용자 정보를 가져온 후 출근/퇴근 데이터 불러오기
        fetchAttendanceData(Number(response.data.data.employeeId));
        // 월별 근무 시간 통계 데이터 가져오기
        fetchMonthlyAttendanceStatistics(Number(response.data.data.employeeId));
      } catch (error) {
        console.error("사용자 정보 가져오기 오류:", error);
        setErrorMessage("사용자 정보를 가져오는 데 실패했습니다.");
      }
    };

    fetchUserInfo();
  }, []);

  // 출근/퇴근 데이터 가져오기
  const fetchAttendanceData = async (employeeId) => {
    try {
      console.log("fetchAttendanceData 호출됨, employeeId:", employeeId);
      const response = await axios.get("http://localhost:8082/attendances/my-attendance", {
        params: {
          employeeId: employeeId, 
          page: 1,
          size: 100, // 적절한 크기로 조정
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      const events = response.data.data.map(attendance => {
        const checkIn = new Date(attendance.checkInTime);
        const checkOut = attendance.checkOutTime ? new Date(attendance.checkOutTime) : null;
        const workingHours = attendance.dailyWorkingTime || 'N/A'; // 서버에서 계산된 근무시간 사용

        return {
          title: `출근: ${checkIn.toLocaleTimeString()} 퇴근: ${checkOut ? checkOut.toLocaleTimeString() : 'N/A'} 근무시간: ${workingHours} 시간`,
          start: checkIn,
          end: checkOut,
          display: 'block',
          backgroundColor: colors.primary[500],
          borderColor: colors.primary[700],
          textColor: colors.gray[100],
          extendedProps: {
            checkOutTime: checkOut ? checkOut.toLocaleTimeString() : 'N/A',
            workingHours: workingHours,
          }
        };
      });

      setAttendanceEvents(events);
      console.log("attendanceEvents 업데이트됨:", events);
    } catch (error) {
      console.error("출근/퇴근 데이터 가져오기 오류:", error);
      setErrorMessage("출근/퇴근 데이터를 가져오는 데 실패했습니다.");
    }
  };

  // 월별 근무 시간 통계 데이터 가져오기
  const fetchMonthlyAttendanceStatistics = async (employeeId) => {
    try {
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const response = await axios.get("http://localhost:8082/attendances/monthly", {
        params: {
          employeeId: employeeId,
          year: year,
          month: month,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      setAttendanceStatistics(response.data);
    } catch (error) {
      console.error("월별 근무 시간 통계 가져오기 오류:", error);
      setErrorMessage("월별 근무 시간 통계를 가져오는 데 실패했습니다.");
    }
  };

  // 출근 수행
  const checkIn = async () => {
    if (isLoading) return; // Prevent multiple clicks
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8082/attendances/check-in", null, {
        params: { 
          employeeId: Number(userInfo.employeeId) 
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      fetchAttendanceData(userInfo.employeeId);
    } catch (error) {
      console.error("출근 오류:", error.response?.data || error);
      setErrorMessage("출근에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 퇴근 수행
  const checkOut = async () => {
    if (isLoading) return; // Prevent multiple clicks
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:8082/attendances/check-out", null, {
        params: { 
          employeeId: Number(userInfo.employeeId) 
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      fetchAttendanceData(userInfo.employeeId);
    } catch (error) {
      console.error("퇴근 오류:", error.response?.data || error);
      setErrorMessage("퇴근에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    alert(`출근 시간: ${event.start.toLocaleTimeString()}
퇴근 시간: ${event.extendedProps.checkOutTime}
총 근무 시간: ${event.extendedProps.workingHours} 시간`);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box m="20px">
      <Header title="마이페이지" subtitle="My Page" />
      <Box component={Paper} p={3} mt={2} elevation={3}>
        <Grid container spacing={2} justifyContent="center">
          {/* 프로필 사진 및 이름 */}
          <Grid item xs={12} md={3} align="center">
            <Avatar
              alt={userInfo.name}
              src={userInfo.profilePicture || "/path-to-default-avatar.png"}
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
            </Grid>
          </Grid>
        </Grid>

        {/* 출근/퇴근 버튼 */}
        <Box mt={4} display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            color="success"
            onClick={checkIn}
            sx={{ width: "200px" }}
            disabled={isLoading} // Disable button while loading
          >
            출근
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={checkOut}
            sx={{ width: "200px" }}
            disabled={isLoading} // Disable button while loading
          >
            퇴근
          </Button>
        </Box>
      </Box>

      {/* 근태 기록 및 통계 탭 */}
      <Box mt={10}>
        <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab label="근무 기록" />
          <Tab label="월별 통계" />
        </Tabs>

        {tabValue === 0 && (
          <Box mt={2} component={Paper} p={3} elevation={3}>
            <FullCalendar
              height="75vh"
              plugins={[
                dayGridPlugin,
                timeGridPlugin,
                interactionPlugin,
                listPlugin,
              ]}
              headerToolbar={{
                left: `${isSmDevices ? "prev,next" : "prev,next today"}`,
                center: "title",
                right: `${isXsDevices
                  ? ""
                  : isSmDevices
                    ? "dayGridMonth,listMonth"
                    : "dayGridMonth,timeGridWeek,timeGridDay,listMonth"
                  }`,
              }}
              initialView="dayGridMonth"
              editable={false}
              selectable={false}
              selectMirror={true}
              dayMaxEvents={false} // 모든 이벤트를 칸 안에 표시
              eventClick={handleEventClick}
              events={attendanceEvents}
              eventTimeFormat={{
                hour: '2-digit',
                minute: '2-digit',
                meridiem: false,
              }}
            />
          </Box>
        )}

        {tabValue === 1 && (
          <Box mt={2} component={Paper} p={3} elevation={3}>
            <Typography variant="h6" mb={2}>월별 근무 시간 통계</Typography>
            <ul>
              {attendanceStatistics.map((stat, index) => (
                <li key={index}>
                  <Typography variant="body1">
                    {stat.date}: 근무시간 {stat.workingHours}시간, 초과근무 {stat.overtimeHours}시간, 조기퇴근 {stat.earlyLeaveHours}시간
                  </Typography>
                </li>
              ))}
            </ul>
          </Box>
        )}
      </Box>

      {/* Snackbar for Error Messages */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={() => setErrorMessage("")}
      >
        <Alert onClose={() => setErrorMessage("")} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Mypage;