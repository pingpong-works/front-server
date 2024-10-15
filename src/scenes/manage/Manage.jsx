import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, useTheme, Modal, TextField, Button, Select, MenuItem } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import CircleIcon from '@mui/icons-material/Circle';

const Manage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [departments, setDepartments] = useState([]); // 부서 목록을 저장할 상태
  const [selectedDepartment, setSelectedDepartment] = useState(""); // 선택한 부서를 저장할 상태
  const [ranks, setRanks] = useState([
    { value: 'INTERN', label: '인턴' },
    { value: 'STAFF', label: '사원' },
    { value: 'SENIOR_STAFF', label: '주임' },
    { value: 'ASSISTANT_MANAGER', label: '대리' },
    { value: 'MANAGER', label: '과장' },
    { value: 'SENIOR_MANAGER', label: '차장' },
    { value: 'DIRECTOR', label: '부장' },
  ]); // 직급 목록

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
        employeeRank: employee.employeeRank, // 직급 저장
        status: employee.status
      }));

      setEmployees(formattedEmployees);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // 부서 목록 가져오기
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/departments/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await axios.get(`http://localhost:8081/employees/${employeeId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        }
      });
  
      const employeeData = response.data.data;
  
      // 한글 직급을 영어 직급으로 매핑
      const rankMapping = {
        '인턴': 'INTERN',
        '사원': 'STAFF',
        '주임': 'SENIOR_STAFF',
        '대리': 'ASSISTANT_MANAGER',
        '과장': 'MANAGER',
        '차장': 'SENIOR_MANAGER',
        '부장': 'DIRECTOR'
      };
  
      // 매핑된 직급 적용
      const mappedRank = rankMapping[employeeData.employeeRank] || employeeData.employeeRank;
  
      // 기존 직급을 포함한 직원 정보를 상태에 저장
      setSelectedEmployee({
        ...employeeData,
        employeeRank: mappedRank, // 모달에 표시될 기존 직급
      });
  
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching employee details:", error);
    }
  };
  

  const updateEmployee = async () => {
    try {
      await axios.patch(`http://localhost:8081/employees/${selectedEmployee.employeeId}`, {
        ...selectedEmployee, // 상태에서 수정된 데이터를 전송
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      alert("직원 정보가 성공적으로 업데이트되었습니다.");
      setIsModalOpen(false);
      fetchEmployees(); // 업데이트 후 직원 목록 갱신
    } catch (error) {
      console.error("Error updating employee details:", error);
      alert("직원 정보 업데이트 중 오류가 발생했습니다.");
    }
  };

  const handleInputChange = (e) => {
    setSelectedEmployee({
      ...selectedEmployee,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    fetchEmployees();
    fetchDepartments(); // 부서 목록 가져오기
  }, [page, pageSize, selectedDepartment]);

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
      <Header title="직원 관리" subtitle="부서별 직원 목록 관리" />

      {/* 부서 선택 드롭다운 */}
      <Box mb={3}>
        <Typography variant="h6">부서를 선택하세요:</Typography>
        <Select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">전체 부서</MenuItem>
          {departments.map((dept) => (
            <MenuItem key={dept.id} value={dept.id}>
              {dept.name}
            </MenuItem>
          ))}
        </Select>
      </Box>

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
          onRowClick={(params) => fetchEmployeeDetails(params.row.id)} // 행 클릭 시 모달 열림
        />
      </Box>

      {/* 직원 수정 모달 */}
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
                직원 정보 수정
              </Typography>

              {/* 이름 입력 필드 */}
              <TextField
                fullWidth
                label="이름"
                name="name"
                value={selectedEmployee.name || ""}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />

              {/* 이메일 입력 필드 */}
              <TextField
                fullWidth
                label="이메일"
                name="email"
                value={selectedEmployee.email || ""}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />

              {/* 부서 선택 필드 */}
              <Select
                fullWidth
                value={selectedEmployee.departmentId || ""}
                name="departmentId"
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </MenuItem>
                ))}
              </Select>

              {/* 직급 선택 필드 */}
              <Select
                fullWidth
                value={selectedEmployee.employeeRank || ""}
                name="employeeRank"
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              >
                {ranks.map((rank) => (
                  <MenuItem key={rank.value} value={rank.value}>
                    {rank.label}
                  </MenuItem>
                ))}
              </Select>

              {/* 버튼 */}
              <Box mt={4} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={updateEmployee}
                >
                  저장
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  취소
                </Button>
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

export default Manage;
