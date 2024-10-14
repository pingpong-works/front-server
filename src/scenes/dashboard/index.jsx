import {
  Button,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Header
} from "../../components";
import { useState, useEffect } from "react";
import {
  Email
} from "@mui/icons-material";
import { tokens } from "../../theme";
import { mockTransactions } from "../../data/mockData";
import DocumentSummaryWithButtons from "../../components/DocumentSummaryWithButtons";
import axios from "axios";

function Dashboard() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isLoading, setIsLoading] = useState(false);
  const isXlDevices = useMediaQuery("(min-width: 1260px)");
  const isMdDevices = useMediaQuery("(min-width: 724px)");
  const [errorMessage, setErrorMessage] = useState("");

  const [userInfo, setUserInfo] = useState({
    employeeId: "",
    name: "",
    employeeRank: "",
  });

  const cardStyle = {
    bgcolor: colors.gray[850],
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(216, 231, 243, 0.178)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    overflow: "hidden",
    justifyContent: "center",
  };

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

  //근태기능
  // 출근 수행
  const checkIn = async () => {
    if (isLoading) return;
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

  return (
    <Box m="20px">
      <Box display="flex" flexDirection="column" alignItems="flex-start" mb="10px">
        <Typography variant="h1">안녕하세요 {userInfo.name}님 !</Typography>
        <Header subtitle="오늘도 행복한 하루 되세요" />
      </Box>
      {/* GRID */}
      <Box
        display="grid"
        gridTemplateColumns={
          isXlDevices
            ? "repeat(12, 1fr)"
            : isMdDevices
              ? "repeat(6, 1fr)"
              : "repeat(3, 1fr)"
        }
        gridAutoRows="140px"
        gap="20px"
      >

        {/* 1-1 근태 */}
        <Box
          gridColumn={isXlDevices ? "span 4" : isMdDevices ? "span 6" : "span 3"}
          gridRow="span 2"
          sx={{
            bgcolor: colors.gray[850],
            borderRadius: "8px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "space-between"
          }}
        >
          <Box>
            {/* 출근/퇴근 버튼 */}
            <Box mt={1} display="flex" justifyContent="center" gap={2}>
              <div> 미리 출근 , <br /> 늦게 퇴근 !</div>
              <p></p>
              <Button
                variant="contained"
                onClick={checkIn}
                sx={{ width: "30%", backgroundColor: colors.blueAccent[500] }}
                disabled={isLoading}
              >
                출근
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={checkOut}
                sx={{ width: "30%", backgroundColor: colors.gray[500] }}
                disabled={isLoading}
              >
                퇴근
              </Button>
            </Box>

          </Box>
          <p></p>
          {/* 부서별 팀원 로그인 상태 */}
          <Box gridColumn={isXlDevices ? "span 4" : isMdDevices ? "span 6" : "span 3"}
            gridRow="span 2"
            sx={{ width: "100%", height: "70%", padding: "30px", backgroundColor: colors.gray[850], borderRadius: "8px" }}>
            <Typography> 우리 부서 활동</Typography>
          </Box>
        </Box>

        {/* 2-1 결재문서함 */}
        <Box
          gridColumn={isXlDevices ? "span 4" : isMdDevices ? "span 6" : "span 3"}
          gridRow="span 2"
          sx={{ ...cardStyle, padding: "30px" }}
        >
          <Typography variant="h5" fontWeight="300" sx={{ mb: "15px" }} mt={1} >
            결재 문서 현황
          </Typography>
          <Box display="flex" alignItems= "center" justifyContent= "center" height= "250px" width= "100%">
            <DocumentSummaryWithButtons />  {/* 문서 요약 컴포넌트 추가 */}
          </Box>
        </Box>

        {/* 최근 메일함 */}
        <Box gridColumn={isXlDevices ? "span 4" : isMdDevices ? "span 6" : "span 3"}
          gridRow="span 2"
          sx={{ ...cardStyle, maxHeight: "400px", display: "flex", flexDirection: "column" }}>
          <Box borderBottom={`2px solid ${colors.primary[900]}`} p="15px" width="100%" sx={{ position: "sticky", top: 0, zIndex: 1 }}>
            <Typography color={colors.primary[100]} variant="h5" fontWeight="600" display="flex" alignItems="center">
              <Email sx={{ color: colors.primary[100], fontSize: "26px", mr: "10px" }} />
              Recent Mail
            </Typography>
          </Box>

          <Box sx={{ overflowY: "auto", flex: 1 }}>
            {mockTransactions.map((transaction, index) => (
              <Box
                key={`${transaction.txId}-${index}`}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                borderBottom={`2px solid ${colors.primary[900]}`}
                p="15px"
                width="100%"
              >
                <Box>
                  <Typography
                    color={colors.primary[100]}
                    variant="h5"
                    fontWeight="600"
                  >
                    {transaction.txId}
                  </Typography>
                  <Typography color={colors.primary[100]}>
                    {transaction.user}
                  </Typography>
                </Box>
                <Typography color={colors.gray[100]}>
                  {transaction.date}
                </Typography>
                <Box
                  bgcolor={colors.blueAccent[500]}
                  p="5px 10px"
                  borderRadius="4px"
                >
                  ${transaction.cost}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
        {/* ---------------- Row 2 ---------------- */}

        {/* 게시판 */}
        <Box
          gridColumn={isXlDevices ? "span 8" : isMdDevices ? "span 6" : "span 3"}
          gridRow="span 3"
          sx={{ ...cardStyle, padding: "30px" }}
        >
          <Typography variant="h5" fontWeight="600">
            공지사항
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            mt="25px"
          >
            <Typography
              textAlign="center"
              variant="h5"
              color={colors.greenAccent[500]}
              sx={{ mt: "15px" }}
            >
              공지/식단
            </Typography>
          </Box>
        </Box>

        {/* 달력 */}
        <Box
          gridColumn={isXlDevices ? "span 4" : isMdDevices ? "span 6" : "span 3"}
          gridRow="span 3"
          sx={{ ...cardStyle, padding: "30px" }}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ mb: "15px" }}
          >
            Calendar (예약/일정)
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="250px"
          >
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;