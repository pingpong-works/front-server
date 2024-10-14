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
    departmentId: "",
  });

  const [employees, setEmployees] = useState([]);

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
        const userData = response.data.data;
        setUserInfo(userData);

        // departmentId가 유효한지 확인 후 부서별 직원 목록을 가져옵니다.
        if (userData.departmentId) {
          fetchDepartmentEmployees(userData.departmentId);
        } else {
          console.error("사용자 정보에 departmentId가 없습니다.");
        }
      } catch (error) {
        console.error("사용자 정보 가져오기 오류:", error);
        setErrorMessage("사용자 정보를 가져오는 데 실패했습니다.");
      }
    };

    fetchUserInfo();
  }, []);


  // 부서별 직원 정보 불러오기
  const fetchDepartmentEmployees = async (departmentId) => {
    try {
      const response = await axios.get(
        `http://localhost:8081/user/employees/departments/${departmentId}`, 
        {
          params: {
            page: 1,
            size: 100
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setEmployees(response.data.data);
    } catch (error) {
      console.error("부서 직원 정보를 가져오는 중 오류 발생:", error);
    }
  };

  // 출근 수행
  const checkIn = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await axios.post("http://localhost:8082/attendances/check-in", null, {
        params: {
          employeeId: Number(userInfo.employeeId)
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      // 출근 후 동작 (필요하면 추가)
    } catch (error) {
      console.error("출근 오류:", error.response?.data || error);
      setErrorMessage("출근에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  // 퇴근 수행
  const checkOut = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await axios.post("http://localhost:8082/attendances/check-out", null, {
        params: {
          employeeId: Number(userInfo.employeeId)
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      // 퇴근 후 동작 (필요하면 추가)
    } catch (error) {
      console.error("퇴근 오류:", error.response?.data || error);
      setErrorMessage("퇴근에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };


  // 직급 변환 함수 추가
const getKoreanRank = (rank) => {
  switch(rank) {
    case 'INTERN':
      return '인턴';
    case 'STAFF':
      return '사원';
    case 'SENIOR_STAFF':
      return '주임';
    case 'ASSISTANT_MANAGER':
      return '대리';
    case 'MANAGER':
      return '과장';
    case 'SENIOR_MANAGER':
      return '차장';
    case 'DIRECTOR':
      return '부장';
    default:
      return rank; // 매칭되지 않는 경우 기본 값으로 반환
  }
};

<Box sx={{ mt: "10px" }}>
  {employees.map((employee) => (
    <Box key={employee.employeeId} display="flex" justifyContent="space-between" p="10px">
      <Typography>{employee.name}</Typography>
      <Typography>{getKoreanRank(employee.employeeRank)}</Typography> {/* 직급을 한국어로 변환 */}
      <Box
        sx={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: employee.status === 'LOGGED_IN' ? colors.greenAccent[500] : colors.gray[500],
        }}
      />
    </Box>
  ))}
</Box>


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
          <Box 
            gridColumn={isXlDevices ? "span 4" : isMdDevices ? "span 6" : "span 3"}
            gridRow="span 2"
            sx={{ 
              width: "100%", 
              height: "200px",  // 높이 설정
              padding: "10px", 
              backgroundColor: colors.gray[850], 
              borderRadius: "8px", 
              overflowY: "scroll" // 스크롤 기능 추가
            }}>
            <Box sx={{ mt: "10px" }}>
              {/* 헤더 부분 디자인 추가 */}
                <Box display="flex" justifyContent="space-between" p="10px" sx={{ backgroundColor: colors.gray[700], borderRadius: "4px" }}>
                  <Typography sx={{ color: colors.primary[100], fontWeight: "bold", fontSize: "1rem", marginLeft: "8px" }}>이름</Typography>
                  <Typography sx={{ color: colors.primary[100], fontWeight: "bold", fontSize: "1rem", textAlign: "center", width: "100px", marginLeft: "45px" }}>직급</Typography> {/* 오른쪽으로 10px 이동 */}
                  <Typography sx={{ color: colors.primary[100], fontWeight: "bold", fontSize: "1rem", textAlign: "right" }}>활동중</Typography>
                </Box>
              {employees.map((employee) => (
                <Box key={employee.employeeId} display="flex" justifyContent="space-between" p="10px">
                  <Typography sx={{ fontSize: "0.95rem", color: colors.gray[50] }}>{employee.name}</Typography>
                  <Typography sx={{ textAlign: "center", width: "120px", fontSize: "0.95rem", color: colors.gray[50] }}>{getKoreanRank(employee.employeeRank)}</Typography>
                  <Box
                    sx={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: employee.status === 'LOGGED_IN' ? colors.greenAccent[500] : colors.gray[300],
                    }}
                  />
                </Box>
              ))}
            </Box>

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
