import { Box, useTheme, Button } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Header } from "../../components";
import { tokens } from "../../theme";
import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DepartmentManagement = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();  // useNavigate 훅 초기화

    const [isLoading, setIsLoading] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    // 부서 목록 조회
    const fetchDepartments = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('http://localhost:8081/departments/all', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            setDepartments(response.data); // 부서 목록을 state에 저장
            setIsLoading(false);
        } catch (err) {
            console.error("오류 발생:", err);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartments(); // 페이지 로드 시 부서 목록 조회
    }, []);

    // 부서 삭제 핸들러
    const handleDeleteDepartments = async () => {
        if (selectedRows.length === 0) {
            alert("삭제할 부서를 선택하세요.");
            return;
        }

        if (!window.confirm("선택한 부서를 정말 삭제하시겠습니까?")) return;

        try {
            await Promise.all(
                selectedRows.map(async (departmentId) => {
                    await axios.delete(`http://localhost:8081/departments/${departmentId}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        },
                    });
                })
            );
            alert("선택한 부서가 삭제되었습니다.");
            setSelectedRows([]); // 선택된 행 초기화
            fetchDepartments(); // 삭제 후 목록 갱신
        } catch (error) {
            console.error("부서 삭제 중 오류 발생:", error);
            alert("부서 삭제 중 오류가 발생했습니다.");
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width:90 }, // ID 필드의 너비를 줄였습니다.
        { 
            field: 'name', 
            headerName: '부서명', 
            width: 200, // 부서명 필드 너비 설정
            headerAlign: 'center', 
            align: 'center', // 부서명 컬럼 가운데 정렬
        },
        { 
            field: 'employeeCount', 
            headerName: '직원 수', 
            width: 250,  // 직원 수 필드의 너비 설정
            headerAlign: 'center', 
            align: 'center'  // 직원 수 가운데 정렬
        }
    ];

    return (
        <div>
            {isLoading && <p>로딩 중...</p>}
            <Box m="20px">
                <Header title="부서 관리" subtitle="부서 목록 및 관리" />

                {/* + 추가 버튼 */}
                <Button
                    onClick={() => navigate("/department")}  // 버튼 클릭 시 /department 페이지로 이동
                    variant="outlined"
                    sx={{
                        width: '100px',
                        height: '40px',
                        fontSize: '12px',
                        color: colors.gray[900],
                        backgroundColor: colors.gray[150],
                        border: "1px solid #5c5555ea",
                        marginRight: '10px',
                    }}
                >
                    + 추가
                </Button>

                {/* - 삭제 버튼 */}
                <Button
                    onClick={handleDeleteDepartments}
                    variant="outlined"
                    sx={{
                        width: '100px',
                        height: '40px',
                        fontSize: '12px',
                        color: colors.gray[900],
                        backgroundColor: colors.gray[150],
                        border: "1px solid #5c5555ea"
                    }}
                >
                    - 삭제 ({selectedRows.length})
                </Button>

                {/* 테이블 */}
                <Box
                    mt="20px"
                    height="75vh" // 전체 높이를 줄여 컴팩트하게 만듭니다.
                    maxWidth="600px"  // 너비도 줄여서 화면이 덜 텅 비어 보이게 설정합니다.
                    sx={{
                        "& .MuiDataGrid-root": {
                            border: "none",
                            color: "white"
                        },
                        "& .MuiDataGrid-cell": {
                            border: "none",
                        },
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: "#1c8adb",
                            borderBottom: "none",
                            color: colors.gray[200],
                        },
                        "& .MuiDataGrid-footerContainer": {
                            borderTop: "none",
                            color: colors.gray[200],
                            backgroundColor: "#1c8adb",
                        },
                        "& .MuiCheckbox-root": {
                            color: `${colors.blueAccent[100]} !important`,
                        },
                        "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                            color: `${colors.gray[100]} !important`,
                        },
                        "& .MuiDataGrid-virtualScroller": {
                            backgroundColor: colors.primary[400],
                        }
                    }}
                >
                    <DataGrid
                        rows={departments}
                        columns={columns}
                        components={{ Toolbar: GridToolbar }}
                        checkboxSelection
                        onRowSelectionModelChange={(newSelectionModel) => {
                            setSelectedRows(newSelectionModel);
                        }}
                        pageSizeOptions={[10, 20, 50, 100]}
                        paginationModel={{ pageSize: 10, page: 0 }}
                    />
                </Box>
            </Box>
        </div>
    );
};

export default DepartmentManagement;
