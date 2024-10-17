import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // 페이지 이동을 위한 useNavigate 추가
import axios from "axios";
import { Box, Typography, useTheme, Modal, MenuItem, Select, FormControl } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import CircleIcon from '@mui/icons-material/Circle';

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수 초기화

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert('로그인이 필요합니다.');
        navigate('/login');  // 로그인 페이지로 리다이렉트
    }
  }, [navigate]);

  // 부서 목록 가져오기
  const fetchDepartments = async () => {
    try {
      const response = await axios.get("http://localhost:8081/departments/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });
      setDepartments(response.data);
    } catch (error) {
      console.error("부서 정보를 가져오는 중 오류가 발생했습니다:", error);
    }
  };

  // 직원 목록 가져오기 (부서별 필터링 포함)
  const fetchEmployees = async () => {
    try {
      const url = selectedDepartment
        ? `http://localhost:8081/admin/employees/departments/${selectedDepartment}?page=${page + 1}&size=${pageSize}`
        : `http://localhost:8081/employees/all?page=${page + 1}&size=${pageSize}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });

      const data = response.data.data;
      const formattedEmployees = data.map((employee) => ({
        id: employee.employeeId,
        name: employee.name,
        email: employee.email,
        phoneNumber: employee.phoneNumber,
        departmentName: employee.departmentName,
        employeeRank: employee.employeeRank,
        status: employee.status
      }));

      setEmployees(formattedEmployees);
      setLoading(false);
    } catch (error) {
      console.error("직원 목록을 가져오는 중 오류가 발생했습니다:", error);
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await axios.get(`http://localhost:8081/employees/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });

      setSelectedEmployee(response.data.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error("직원 상세 정보를 가져오는 중 오류가 발생했습니다:", error);
    }
  };

  const deleteEmployee = async () => {
    if (window.confirm("정말로 이 직원을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`http://localhost:8081/employees/${selectedEmployee.employeeId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        alert("직원이 성공적으로 삭제되었습니다.");
        setIsModalOpen(false);
        fetchEmployees();
      } catch (error) {
        console.error("직원 삭제 중 오류가 발생했습니다:", error);
        alert("직원 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  useEffect(() => {
    fetchDepartments(); // 부서 목록 로드
    fetchEmployees(); // 직원 목록 로드
  }, [page, pageSize, selectedDepartment]); // 선택된 부서가 변경될 때마다 재로드

  const handleDepartmentChange = (event) => {
    setSelectedDepartment(event.target.value);
  };

  // 계정 생성 버튼 클릭 시 /signup 페이지로 이동
  const handleCreateAccountClick = () => {
    navigate("/signup");
  };

  // 로그인한 사용자가 관리자(admin@pingpong-works.com)인지 확인
  const isAdmin = localStorage.getItem("username") === "admin@pingpong-works.com";

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
            color: params.value === "로그인" ? colors.greenAccent[500] : colors.gray[500],
          }}
        />
      ),
    },
  ];

  return (
    <Box m="20px">
      <Box display={"flex"} justifyContent="space-between" alignItems="center" mb={-4}>
      <Header title="주소록" subtitle="전체 직원 목록" />
      {isAdmin && (  // 관리자만 계정 생성 버튼이 보이도록 조건 추가
        <button
          style={{
            backgroundColor: colors.blueAccent[500],
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = colors.blueAccent[700])}
          onMouseOut={(e) => (e.target.style.backgroundColor = colors.blueAccent[500])}
          onClick={handleCreateAccountClick}
        >
          계정 생성
        </button>
      )}
    </Box>
      {isAdmin && (
        <Box display="flex" justifyContent="flex-end" mb={2}>
        </Box>
      )}

      {/* 부서 선택 필터 */}
      <FormControl sx={{ minWidth: 200, marginTop: "20px" }}>
        <Select
          value={selectedDepartment}
          onChange={handleDepartmentChange}
          displayEmpty
        >
          <MenuItem value="">전체 부서</MenuItem>
          {departments.map((dept) => (
            <MenuItem key={dept.id} value={dept.id}>
              {dept.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
          onSelectionModelChange={(newSelection) => {
            setSelectedIds(newSelection); // 체크박스 선택 시 ID 업데이트
          }}
          onRowClick={(params) => fetchEmployeeDetails(params.row.id)}
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
            bgcolor: "#2d3e50",
            borderRadius: 4,
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
            overflowY: "auto",
            color: "#fff",
          }}
        >
          {selectedEmployee ? (
            <Box>
              <Typography
                variant="h5"
                component="h2"
                gutterBottom
                sx={{ textAlign: "center", fontWeight: "bold", fontSize: "20px", mb: 3 }}
              >
                직원 정보
              </Typography>

              <Box mb={2} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <img
                  src={selectedEmployee.profilePicture || "/src/assets/images/avatar.png"}
                  alt="프로필"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </Box>

              <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                <strong>이름:</strong> {selectedEmployee.name}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                <strong>이메일:</strong> {selectedEmployee.email}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                <strong>전화번호:</strong> {selectedEmployee.phoneNumber}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                <strong>부서:</strong> {selectedEmployee.departmentName}
              </Typography>
              <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                <strong>직급:</strong> {selectedEmployee.employeeRank}
              </Typography>

              {/* 관리자 전용 정보 */}
              {isAdmin && (
                <>
                  <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                    <strong>긴급 연락처:</strong> {selectedEmployee.emergencyNumber || "없음"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                    <strong>차량 번호:</strong> {selectedEmployee.vehicleNumber || "없음"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                    <strong>주소:</strong> {selectedEmployee.address || "없음"}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                    <strong>입사 일:</strong> {new Date(selectedEmployee.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 1.5, borderBottom: "1px solid #555", paddingBottom: "10px" }}>
                    <strong>상태:</strong> {selectedEmployee.status === "LOGGED_IN" ? "로그인 상태" : "로그아웃 상태"}
                  </Typography>
                </>
              )}

              <Box mt={4} sx={{ display: "flex", justifyContent: "space-between" }}>
                {/* 직원 삭제 버튼 (관리자 전용) */}
                {isAdmin && (
                  <button
                    style={{
                      backgroundColor: colors.blueAccent[500],
                      color: "#fff",
                      padding: "10px 20px",
                      borderRadius: "5px",
                      border: "none",
                      cursor: "pointer",
                      transition: "background-color 0.3s ease",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = colors.blueAccent[700])}
                    onMouseOut={(e) => (e.target.style.backgroundColor = colors.blueAccent[500])}
                    onClick={deleteEmployee}
                  >
                    직원 삭제
                  </button>
                )}

                {/* 확인 버튼 */}
                <button
                  style={{
                    backgroundColor: colors.blueAccent[500],
                    color: "#fff",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    border: "none",
                    cursor: "pointer",
                    transition: "background-color 0.3s ease",
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = colors.blueAccent[700])}
                  onMouseOut={(e) => (e.target.style.backgroundColor = colors.blueAccent[500])}
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


