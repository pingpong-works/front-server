import {  Box, useTheme, MenuItem, Select, FormControl, InputLabel, Button } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Header } from "../../components";
import getDocumentAllRequest from "../../request/GetDocuments";
import { tokens } from "../../theme";
import { useEffect, useState } from "react";
import TableModal from '../../components/table'; 

const Elec = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // 상태 관리
    const [isLoading, setIsLoading] = useState(false);
    const [list, setList] = useState([]); // 전체 문서 데이터
    const [filteredData, setFilteredData] = useState([]); // 필터링된 데이터
    const [selectedStatus, setSelectedStatus] = useState("all"); // 선택된 상태
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태

    // 문서 데이터를 가져오는 함수
    const fetchDocuments = async () => {
        try {
            const response = await getDocumentAllRequest({}, {}, 1, 10, setList, setIsLoading);
            if (response?.data?.data && Array.isArray(response.data.data)) {
                setList(response.data.data); // 문서 리스트 설정
                setFilteredData(response.data.data); // 필터링된 데이터 설정
            } else {
                console.error("데이터를 찾을 수 없습니다.");
                setList([]);
                setFilteredData([]);
            }
        } catch (err) {
            console.error("오류 발생:", err);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    // 상태 변경 시 필터링
    const handleStatusChange = (event) => {
        const status = event.target.value;
        setSelectedStatus(status);
        setFilteredData(status === "all" ? list : list.filter(item => item.documentStatus === status));
    };

    // 모달 열기/닫기
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    // 데이터 그리드 컬럼 설정
    const columns = [
        { field: "id", headerName: "ID", flex: 0.5 },
        { field: "docsTypes.type", headerName: "종류", flex: 1, valueGetter: (params) => params.row.docsTypes?.type || "N/A" },
        { field: "title", headerName: "제목", flex: 1, valueGetter: (params) => params.row.title || "N/A" },
        { field: "author", headerName: "작성자", flex: 1 },
        { field: "departmentName", headerName: "부서", flex: 1 },
        { field: "createdAt", headerName: "작성일", flex: 1, valueGetter: (params) => params.row.createdAt?.substring(0, 10) || "N/A" },
        { field: "documentStatus", headerName: "상태", flex: 1, valueGetter: (params) => {
            switch (params.value) {
                case "DRAFT": return "임시 저장";
                case "IN_PROGRESS": return "결재중";
                case "APPROVED": return "승인 완료";
                case "REJECTED": return "반려";
                default: return "전체 보기";
            }
        }},
    ];

    return (
        <div>
            {isLoading && <p>로딩 중...</p>}
            <Box m="20px">
                <Header title="전자결재" subtitle="List of Elec for Future Reference" />
                
                {/* 상태 필터 셀렉트 */}
                <Box mb="20px" display="flex" justifyContent="flex-end">
                    <FormControl variant="outlined" sx={{ minWidth: 200 }}>
                        <InputLabel id="status-select-label">결재 상태</InputLabel>
                        <Select
                            labelId="status-select-label"
                            value={selectedStatus}
                            onChange={handleStatusChange}
                            label="결재 상태"
                        >
                            <MenuItem value="all">모두 보기</MenuItem>
                            <MenuItem value="DRAFT">임시 저장</MenuItem>
                            <MenuItem value="IN_PROGRESS">결재 중</MenuItem>
                            <MenuItem value="APPROVED">승인 완료</MenuItem>
                            <MenuItem value="REJECTED">반려</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {/* 모달 열기 버튼 */}
                <Box display="flex" justifyContent="flex-end" mb="20px">
                    <Button
                        onClick={handleOpenModal}
                        variant="contained"
                        sx={{
                            backgroundColor: '#6870fa',
                            color: '#fff',
                            '&:hover': { backgroundColor: '#b6b6b6ac' },
                        }}
                    >
                        결재 작성
                    </Button>
                </Box>

                {/* 데이터 그리드 */}
                <Box
                    mt="40px"
                    height="75vh"
                    maxWidth="100%"
                    sx={{
                        "& .MuiDataGrid-root": { border: "none" },
                        "& .MuiDataGrid-cell": { border: "none" },
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: colors.blueAccent[500],
                            borderBottom: "none",
                            color: colors.gray[200],
                        },
                        "& .MuiDataGrid-footerContainer": {
                            borderTop: "none",
                            backgroundColor: colors.blueAccent[500],
                        },
                        "& .MuiCheckbox-root": {
                            color: `${colors.greenAccent[200]} !important`,
                        },
                    }}
                >
                    <DataGrid
                        rows={filteredData}
                        columns={columns}
                        components={{ Toolbar: GridToolbar }}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                        }}
                        pageSizeOptions={[10, 20, 50]}
                        checkboxSelection
                    />
                </Box>
            </Box>

            {/* 모달 컴포넌트 불러오기 */}
            <TableModal  // 올바른 컴포넌트 이름 사용
                isOpen={isModalOpen} 
                handleClose={handleCloseModal} 
                colors={colors} 
            />
        </div>
    );
};

export default Elec;