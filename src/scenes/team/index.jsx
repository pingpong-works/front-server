import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, useTheme, Modal } from "@mui/material"; // Modal 추가
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import CircleIcon from '@mui/icons-material/Circle'; 

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State 변수 선언
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEmployee, setSelectedEmployee] = useState(null); // 선택된 직원
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림/닫힘 상태

  // 직원 데이터를 가져오는 함수
  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/employees/all?page=${page + 1}&size=${pageSize}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });

      const data = response.data.data;

      // 필요한 필드만 추출하고 employeeRank, attendanceStatus 값을 한글로 변환
      const formattedEmployees = data.map((employee) => ({
        id: employee.employeeId,
        name: employee.name,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        departmentName: employee.departmentName,
        employeeRank: translateRank(employee.employeeRank),
        status: employee.status
      }));

      setEmployees(formattedEmployees);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // 직급을 한글로 변환하는 함수
  const translateRank = (rank) => {
    switch (rank) {
      case "INTERN":
        return "인턴";
      case "STAFF":
        return "사원";
      case "SENIOR_STAFF":
        return "주임";
      case "ASSISTANT_MANAGER":
        return "대리";
      case "MANAGER":
        return "과장";
      case "SENIOR_MANAGER":
        return "차장";
      case "DIRECTOR":
        return "부장";
      default:
        return rank;
    }
  };

  // 특정 직원 데이터를 가져오는 함수 (모달에서 사용)
  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await axios.get(`http://localhost:8081/employees/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });

      setSelectedEmployee(response.data.data);
      setIsModalOpen(true); // 모달 열기
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, pageSize]);

  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "name",
      headerName: "이름",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    { field: "email", headerName: "이메일", flex: 1 },
    { field: "phoneNumber", headerName: "전화번호", flex: 1 },
    { field: "departmentName", headerName: "부서명", flex: 1 },
    { field: "employeeRank", headerName: "직급", flex: 1 },
    {
      field: "status",
      headerName: "활동 중",
      flex: 1,
      renderCell: (params) => (
        <CircleIcon
          style={{
            color: params.value === "LOGGED_IN" ? colors.greenAccent[500] : colors.gray[500],
          }}
        />
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="주소록" subtitle="전체 직원 목록" />
      <Box
        mt="40px"
        height="75vh"
        flex={1}
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
        <DataGrid
          rows={employees}
          columns={columns}
          loading={loading}
          pagination
          page={page}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
          checkboxSelection
          onRowClick={(params) => fetchEmployeeDetails(params.row.id)} // 행 클릭 시 직원 정보 조회
        />
      </Box>

      {/* 직원 상세 정보 모달 */}
            <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            bgcolor: "#2d3e50", // 모달 배경을 다크 블루로 변경
            borderRadius: 4,
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
            overflowY: "auto",
            color: "#fff", // 텍스트 색상을 흰색으로 설정
          }}
        >
          {selectedEmployee ? (
            <Box>
              <Typography variant="h5" component="h2" gutterBottom>
                직원 정보
              </Typography>
              <Box mb={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {/* 프로필 이미지가 없으면 기본 이미지 표시 */}
              <img
                src={selectedEmployee.profilePicture || "/src/assets/images/avatar.png"} // null일 경우 avatar.png 사용
                alt="프로필"
                style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover" }}
              />
              </Box>
              <Typography variant="body1">
                <strong>이름:</strong> {selectedEmployee.name}
              </Typography>
              <Typography variant="body1">
                <strong>이메일:</strong> {selectedEmployee.email}
              </Typography>
              <Typography variant="body1">
                <strong>전화번호:</strong> {selectedEmployee.phoneNumber}
              </Typography>
              <Typography variant="body1">
                <strong>부서:</strong> {selectedEmployee.departmentName}
              </Typography>
              <Typography variant="body1">
                <strong>직급:</strong> {selectedEmployee.employeeRank}
              </Typography>

              {/* 관리자일 때만 보여줄 추가 정보 */}
              {localStorage.getItem("username") === "admin@example.com" ? (
                <>
                  <Typography variant="body1">
                    <strong>긴급 연락처:</strong> {selectedEmployee.emergencyNumber || "없음"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>차량 번호:</strong> {selectedEmployee.vehicleNumber || "없음"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>주소:</strong> {selectedEmployee.address || "없음"}
                  </Typography>
                  <Typography variant="body1">
                    <strong>입사 일:</strong> {new Date(selectedEmployee.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1">
                    <strong>상태:</strong> {selectedEmployee.status === "LOGGED_IN" ? "로그인 상태" : "로그아웃 상태"}
                  </Typography>
                </>
              ) : (
                <>
                  {/* 일반 유저에게 보여줄 정보 */}
                  <Typography variant="body1">
                    <strong>내선 번호:</strong> {selectedEmployee.extensionNumber}
                  </Typography>
                  <Typography variant="body1">
                    <strong>긴급 연락처:</strong> {selectedEmployee.emergencyNumber || "없음"}
                  </Typography>
                </>
              )}

              {/* 모달 하단에 버튼 추가 */}
              <Box mt={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  style={{
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    border: "none",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                  onClick={() => setIsModalOpen(false)}
                >
                  확인
                </button>
                
              </Box>
            </Box>
          ) : (
            <Typography>로딩 중...</Typography>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default Team;
