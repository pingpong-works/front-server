import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, useTheme } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";

const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // State 변수 선언
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

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
        id: employee.employeeId,             // id는 그대로
        name: employee.name,                 // 이름
        email: employee.email,               // 이메일
        phoneNumber: employee.phoneNumber,   // 전화번호
        departmentName: employee.departmentName, // 부서명
        employeeRank: translateRank(employee.employeeRank), // 직급(한글로 변환)
        attendanceStatus: translateAttendance(employee.attendanceStatus), // 출퇴근 상태(한글로 변환)
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
        return rank; // 해당 사항이 없을 경우 원래 값 반환
    }
  };

  // 출퇴근 상태를 한글로 변환하는 함수
  const translateAttendance = (status) => {
    switch (status) {
      case "CLOCKED_IN":
        return "출근";
      case "CLOCKED_OUT":
        return "퇴근";
      default:
        return status; // 해당 사항이 없을 경우 원래 값 반환
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
    { field: "attendanceStatus", headerName: "출퇴근 상태", flex: 1 }, // 출퇴근 상태 추가
  ];

  return (
    <Box m="20px">
      <Header title="주소록" subtitle="직원 정보 및 연락처 관리" />
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
        />
      </Box>
    </Box>
  );
};

export default Team;
