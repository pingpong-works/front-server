import {
  Button,
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemText, CircularProgress,
} from "@mui/material";
import {
  Header
} from "../../components";
import { useState, useEffect, useCallback } from "react";
import {
  Email
} from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { mockTransactions } from "../../data/mockData";
import DocumentSummaryWithButtons from "../../components/DocumentSummaryWithButtons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@fullcalendar/core";

function Dashboard() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const isXlDevices = useMediaQuery("(min-width: 1260px)");
  const isMdDevices = useMediaQuery("(min-width: 724px)");
  const [errorMessage, setErrorMessage] = useState("");
  const [receivedMails, setReceivedMails] = useState([]);

  const [data, setData] = useState([]);
  const [page, setPage] = useState(0); 
  const [pageInfo, setPageInfo] = useState({ totalElements: 0, totalPages: 1 });
  const [keyword, setKeyword] = useState("");
  const [searchOption, setSearchOption] = useState("title");
  const [category, setCategory] = useState("공지");
  const [sortOption, setSortOption] = useState("createdAt_desc");
  const [loading, setLoading] = useState(false);

  const [currentEvents, setCurrentEvents] = useState([]);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert('로그인이 필요합니다.');
        navigate('/login');  // 로그인 페이지로 리다이렉트
    }
  }, [navigate]);

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

  // 최근 받은 메일 가져오기
  useEffect(() => {
    const fetchReceivedMails = async () => {
      try {
        const response = await axios.get("http://localhost:8083/mail/received?page=1&size=5&sort=receivedAt,DESC"); // 최근 받은 5개의 메일
        setReceivedMails(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("받은 메일함 조회 중 오류 발생: ", error);
        setLoading(false);
      }
    };

    fetchReceivedMails();
  }, []);

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

    const fetchEvents = async () => {
      try {
          const response = await axios.get("http://localhost:8084/calendars", {
              params: {
                departmentId: 1,
              },
            });
        const data = response.data;
  
        const events = data
          .map((item) => {
            const start = new Date(item.startTime);
            const end = new Date(item.endTime);
  
            let backgroundColor = colors.greenAccent[500];
            if (item.carBookId) {
              backgroundColor = colors.redAccent[500];
            } else if (item.roomBookId) {
              backgroundColor = colors.blueAccent[500]; 
            }
  
            return {
              id: item.calendarId,
              title: item.title,
              start: start, 
              end: end,
              allDay: false, 
              content: item.content,
              backgroundColor, 
            };
          })
          .sort((a, b) => a.start - b.start);
  
        setCurrentEvents(events);
      } catch (error) {
        console.error("Error fetching calendar events:", error);
      }
    };

    fetchEvents();
  }, []);
  
  const fetchData = useCallback(async (page) => {
    setLoading(true); 
    try {
      const response = await axios.get("http://localhost:8084/boards", {
        params: {
          keyword: keyword,
          searchOption: searchOption,
          sort: sortOption,
          page: page,
          size: 5,
          category: category,
        },
      });

      const filteredData = response.data.data.map((item) => ({
        id: item.boardId,
        boardId: item.boardId,
        title: `[${item.category}] ${item.title}`,
        employeeName: item.employeeName || '익명',
        category: item.category,
        createdAt: item.createdAt,
        views: item.views,
      }));

      setData(filteredData);
      setPageInfo({
        totalElements: response.data.pageInfo.totalElements,
        totalPages: response.data.pageInfo.totalPages,
      });
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  }, [sortOption, category]);
  
  const handleCategoryChange = () => {
    setCategory((prevCategory) => (prevCategory === "공지" ? "식단" : "공지"));
  };

  useEffect(() => {
    fetchData(page);
  }, [page, fetchData]);

  const handleRowClick = (params) => {
    navigate(`/viewBoard/${params.id}`);
  };

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

  const columns = [
    { field: "boardId", headerName: "No", headerAlign: "center", align: "center" },
    {
      field: "title",
      headerName: "제목",
      flex: 2,
      headerAlign: "center",
      align: "center",
      cellClassName: "name-column--cell",
    },
    {
      field: "employeeName",
      headerName: "작성자",
      flex: 1,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "createdAt",
      headerName: "등록일",
      flex: 1,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => <Typography>{params.row.createdAt.split("T")[0]}</Typography>,
    },
    {
      field: "views",
      headerName: "조회수",
      flex: 0.5,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Typography color={colors.greenAccent[500]}>{params.row.views}</Typography>
      ),
    },
  ];

  const totalPagesToShow = 10;
  const currentPageGroup = Math.floor(page / totalPagesToShow);

  const visiblePages = Array.from(
    { length: Math.min(totalPagesToShow, pageInfo.totalPages - currentPageGroup * totalPagesToShow) },
    (_, i) => currentPageGroup * totalPagesToShow + i
  );

  const handlePageClick = (pageNum) => {
    setPage(pageNum);
  };

  const handlePreviousPageGroup = () => {
    if (currentPageGroup > 0) {
      setPage((currentPageGroup - 1) * totalPagesToShow);
    }
  };

  const handleNextPageGroup = () => {
    if ((currentPageGroup + 1) * totalPagesToShow < pageInfo.totalPages) {
      setPage((currentPageGroup + 1) * totalPagesToShow);
    }
  };

  // 직급 변환 함수 추가
  const getKoreanRank = (rank) => {
    switch (rank) {
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
            backgroundColor: employee.status === '로그인' ? colors.greenAccent[500] : colors.gray[500],
          }}
        />
      </Box>
    ))}
  </Box>


  return (
    <Box m="20px">
      <Box display="flex" flexDirection="column" alignItems="flex-start" mb="10px">
        <Typography variant="h1" sx={{color: colors.primary[100]}}>안녕하세요 {userInfo.name}님 😀</Typography>
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
              {/* 헤더 부분 */}
              <Box display="flex" justifyContent="space-between" p="5px" sx={{ backgroundColor: theme.palette.background.default, borderRadius: "4px" }}>
                <Typography sx={{ minWidth: "120px", width: "120px", fontSize: "0.8rem", color: colors.primary[100] }}>이름</Typography>
                <Typography sx={{ minWidth: "100px", width: "100px", textAlign: "center", fontSize: "0.8rem", color: colors.primary[100]}}>직급</Typography>
                <Typography sx={{ minWidth: "50px", width: "50px", textAlign: "center", fontSize: "0.8rem", color: colors.primary[100]}}>활동중</Typography>
              </Box>

              {/* 본문 부분 */}
              {employees.map((employee) => (
                <Box key={employee.employeeId} display="flex" justifyContent="space-between" p="10px">
                  <Typography sx={{ minWidth: "120px", width: "120px", fontSize: "0.95rem", color: colors.gray[50] }}>{employee.name}</Typography>
                  <Typography sx={{ minWidth: "100px", width: "100px", textAlign: "center", fontSize: "0.95rem", color: colors.gray[50] }}>{getKoreanRank(employee.employeeRank)}</Typography>
                  <Box
                    sx={{
                      minWidth: "50px",
                      width: "50px",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Box
                      sx={{
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: employee.status === "로그인" ? colors.greenAccent[500] : colors.gray[400],
                      }}
                    />
                  </Box>
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
          <Box display="flex" alignItems="flex-start" height="250px" width="100%">
            <DocumentSummaryWithButtons />  
          </Box>
        </Box>

        {/* 최근 받은 메일 */}
        <Box
            gridColumn={isXlDevices ? "span 4" : isMdDevices ? "span 6" : "span 3"}
            gridRow="span 2"
            sx={{ ...cardStyle, maxHeight: "400px", display: "flex", flexDirection: "column" }}
        >
          <Box borderBottom={`2px solid ${colors.primary[900]}`} p="15px" width="100%" sx={{ position: "sticky", top: 0, zIndex: 1 }}>
            <Typography color={colors.primary[100]} variant="h5" fontWeight="600" display="flex" alignItems="center">
              <Email sx={{ color: colors.primary[100], fontSize: "26px", mr: "10px" }} />
              최근 받은 메일
            </Typography>
          </Box>

          <Box width="100%" sx={{ overflowY: "auto", flex: 1 ,padding: "2px"}}>
            {loading ? (
                <CircularProgress />
            ) : (
                receivedMails.length > 0 ? (
                    receivedMails.map((mail, index) => (
                        <Box
                            key={`${mail.mailId}-${index}`}
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                            borderBottom={`2px solid ${colors.primary[900]}`}
                            p="15px"
                            width="100%"
                            sx={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/read/0/${mail.mailId}`)}
                        >
                          <Box>
                            <Typography
                                color={colors.primary[100]}
                                variant="h5"
                                fontWeight="600"
                                noWrap
                            >
                              {mail.senderName || mail.senderEmail}
                            </Typography>
                            <Typography
                                color={colors.primary[100]}
                                variant="h5"
                                fontWeight="600"
                                noWrap>
                              {mail.subject}
                            </Typography>
                          </Box>
                          <Typography color={colors.gray[100]}>
                            {new Date(mail.receivedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                    ))
                ) : (
                    <Typography color={colors.primary[100]} p="15px" textAlign="center">
                      받은 메일이 없습니다.
                    </Typography>
                )
            )}
          </Box>
        </Box>
        {/* ---------------- Row 2 ---------------- */}

        {/* 게시판 */}
        <Box
          gridColumn={isXlDevices ? "span 8" : isMdDevices ? "span 6" : "span 3"}
          gridRow="span 3"
          sx={{ ...cardStyle, paddingBottom: "100px", paddingRight: "0px", paddingLeft: "0px", padding: "40px"}}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" mb={2} marginLeft={"30px"}>
          <Typography variant="h4" fontWeight="600" color={colors.gray[100]}>
            게시판
          </Typography>
          
          <Box display="flex" gap={2}>
            <Button
              variant={category === "공지" ? "contained" : "outlined"}
              onClick={() => setCategory("공지")}
              sx={{
                backgroundColor: category === "공지" ? colors.blueAccent[700] : colors.primary[500],
                color: colors.gray[100],
                "&:hover": {
                  backgroundColor: category === "공지" ? colors.blueAccent[800] : colors.primary[700],
                },
              }}
            >
              공지
            </Button>

            {/* 식단 버튼 */}
            <Button
              variant={category === "식단" ? "contained" : "outlined"}
              onClick={() => setCategory("식단")}
              sx={{
                backgroundColor: category === "식단" ? colors.blueAccent[700] : colors.primary[500],
                color: colors.gray[100], marginRight: 3,
                "&:hover": {
                  backgroundColor: category === "식단" ? colors.blueAccent[800] : colors.primary[700],
                },
              }}
            >
              식단
            </Button>
          </Box>
        </Box>
          <Box sx={{ width: "100%", height: "100%" }}>
            <Box
            height="100%"
            maxWidth="100%"
            sx={{
              "& .MuiDataGrid-root": {
                border: "none",
              },
              "& .MuiDataGrid-cell": {
                border: "none",
              },
              "& .name-column--cell": {
                color: colors.greenAccent[300],
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: colors.blueAccent[500],
                borderBottom: "none",
                color: colors.gray[200],
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: colors.primary[400],
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
                backgroundColor: colors.blueAccent[500],
              },
              "& .MuiCheckbox-root": {
                color: `${colors.greenAccent[200]} !important`,
              },
              "& .MuiDataGrid-iconSeparator": {
                color: colors.primary[100],
              },
            }}
          >
            {loading ? (
              <Typography>Loading...</Typography>
            ) : (
              <DataGrid
                rows={data}
                columns={columns}
                getRowId={(row) => row.boardId}
                sx={{
                  "& .MuiDataGrid-row:hover": {
                    cursor: "pointer",
                  },
                  "& .MuiDataGrid-footerContainer": {
                    display: "none",
                  },
                }}    
                onRowClick={handleRowClick}
              />
              
            )}
          </Box>
          <Box display="flex" justifyContent="center" alignItems="center" mt={2}>
            <Button
              disabled={currentPageGroup === 0}
              onClick={handlePreviousPageGroup}
              sx={{
                backgroundColor: colors.primary[500],
                color: colors.gray[100],
                "&:hover": {
                  backgroundColor: colors.primary[700],
                },
              }}
            >
              이전
            </Button>
            {visiblePages.map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === page ? "contained" : "outlined"}
                onClick={() => handlePageClick(pageNum)}
                sx={{
                  backgroundColor: pageNum === page ? colors.blueAccent[700] : colors.primary[500],
                  color: colors.gray[100],
                  "&:hover": {
                    backgroundColor: pageNum === page ? colors.blueAccent[800] : colors.primary[700],
                  },
                  borderColor: colors.gray[300],
                }}
              >
                {pageNum + 1}
              </Button>
            ))}
            <Button
              disabled={pageInfo.totalPages <= visiblePages[visiblePages.length - 1] + 1}
              onClick={handleNextPageGroup}
              sx={{
                backgroundColor: colors.primary[500],
                color: colors.gray[100],
                "&:hover": {
                  backgroundColor: colors.primary[700],
                },
              }}
            >
              다음
            </Button>
          </Box>
        </Box>
        </Box>

        {/* 달력 */}
        <Box
          gridColumn={isXlDevices ? "span 4" : isMdDevices ? "span 6" : "span 3"}
          gridRow="span 3"
          sx={{ ...cardStyle, padding: "30px" }}
        >
        <Typography variant="h3" fontWeight="600" sx={{ mb: "15px", color: colors.gray[100] }}>
          캘린더
        </Typography>
        <Box display="flex" justifyContent="center" mb={2}>
          <Box display="flex" alignItems="center" mr={3}>
              <Box 
              width={20} 
              height={20} 
              bgcolor={colors.greenAccent[500]} 
              mr={1} 
              borderRadius="50%"
              />
              <Typography color={colors.gray[100]}>일반 일정</Typography>
          </Box>
          <Box display="flex" alignItems="center" mr={3}>
              <Box 
              width={20} 
              height={20} 
              bgcolor={colors.redAccent[500]} 
              mr={1} 
              borderRadius="50%" 
              />
              <Typography color={colors.gray[100]}>차량 예약</Typography>
          </Box>
          <Box display="flex" alignItems="center">
              <Box 
              width={20} 
              height={20} 
              bgcolor={colors.blueAccent[500]} 
              mr={1} 
              borderRadius="50%" 
              />
              <Typography color={colors.gray[100]}>회의실 예약</Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between", maxHeight: "600px", overflowY: "auto" }}>
          {currentEvents
            .filter((event) => event.end > new Date())
            .map((event) => (
              <Box
                key={event.id}
                sx={{
                  width: "calc(32% - 16px)",
                  marginRight: 1,
                  bgcolor: `${event.backgroundColor}`,
                  p: "15px",
                  borderRadius: "8px",
                  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.2)",
                  transition: "transform 0.3s",
                }}
              >
                <Typography variant="h6" fontWeight="bold" color={colors.gray[50]}>
                  {event.title}
                </Typography>
                <Typography variant="body2" color={colors.gray[200]}>
                  {formatDate(event.start, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Typography>
              </Box>
            ))}
        </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
