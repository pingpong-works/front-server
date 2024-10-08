import { Box, useTheme, MenuItem, Select, FormControl, InputLabel, Button } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Header } from "../../components";
import getDocumentAllRequest from "../../request/GetDocuments";
import { tokens } from "../../theme";
import { useEffect, useState } from "react";
import TableModal from '../../components/TableModal';  // 결재 진행 상황 모달
import ApprovalDocumentForm from '../../components/ApprovalDocumentForm';  // 문서 타입 선택 및 작성 폼
import DocumentModal from "../../components/DocumentModal";


const Elec = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // 상태 관리
    const [isLoading, setIsLoading] = useState(false);
    const [list, setList] = useState([]); // 전체 문서 데이터
    const [filteredData, setFilteredData] = useState([]); // 필터링된 데이터
    const [selectedStatus, setSelectedStatus] = useState("all"); // 선택된 상태
    const [isDocumentFormOpen, setIsDocumentFormOpen] = useState(false); // 문서 작성 모달 상태
    const [approvalLines, setApprovalLines] = useState([]);  // 결재 라인 데이터
    const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태
    const [selectedDocumentId, setSelectedDocumentId] = useState(null); // 선택한 문서의 ID


    const [approvalStatus, setApprovalStatus] = useState({  // 결재 상태 초기값 설정
        0: null,  // 대기 중
        1: null,
        2: null,
    });

    const currentUser = '이대리';  // 현재 로그인한 사용자 (이 부분은 실제 로그인 시스템과 연동되어야 함)

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

    // 문서코드를 클릭했을 때 문서 ID 저장하고 모달 열기
    const handleDocumentClick = (documentId) => {
        if (documentId) {
            console.log("문서 ID:", documentId);  // documentId가 올바르게 전달되는지 확인
            setSelectedDocumentId(documentId);
            setIsModalOpen(true);  // 모달 열기
        } else {
            console.error("문서 ID가 올바르게 전달되지 않았습니다.");
        }
    };

    // 문서 작성 폼 열기
    const handleOpenDocumentForm = () => {
        console.log("결재작성 버튼이 클릭됨");
        setIsDocumentFormOpen(true);  // 문서 작성 폼 열기
        console.log("isDocumentFormOpen 상태:", isDocumentFormOpen);  // 이 부분에서 상태가 정상적으로 변경되는지 확인
    };

    // 문서 작성 폼 닫기
    const handleCloseDocumentForm = () => {
        console.log("문서 작성 모달 닫힘");
        setIsDocumentFormOpen(false);
    };

    // 결재라인 설정 및 제출 처리
    const handleApprovalLineSubmit = (selectedApprovals) => {
        setApprovalLines(selectedApprovals);  // 결재라인 설정
        setIsDocumentFormOpen(false);  // 문서 작성 폼 닫기
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleApprove = (index, status) => {
        setApprovalStatus(prevState => ({
            ...prevState,
            [index]: status  // 승인 또는 반려 상태 업데이트
        }));
    };

    // 데이터 그리드 컬럼 정의
    const columns = [
        {
            field: "documentCode",
            headerName: "문서번호",
            flex: 1,
            renderCell: (params) => (
                <Button
                    onClick={() => handleDocumentClick(params.row.id)}
                    sx={{
                        color: colors.gray[100],
                        textTransform: 'none',  // 대문자 변환 방지
                        fontWeight: 'bold',  // 글씨 두껍게 설정
                        '&:hover': {
                            backgroundColor: 'transparent',  // 버튼 hover 시 배경색 변경 방지
                            color: '#74ade2', // hover 시 텍스트 색상 변경
                        }
                    }}
                >
                    {params.value}
                </Button>
            )
        },
        { field: "docsTypes.type", headerName: "종류", flex: 1, valueGetter: (params) => params.row.docsTypes?.type || "N/A" },
        { field: "title", headerName: "제목", flex: 1, valueGetter: (params) => params.row.title || "N/A" },
        { field: "author", headerName: "작성자", flex: 1 },
        { field: "departmentName", headerName: "부서", flex: 1 },
        { field: "createdAt", headerName: "작성일", flex: 1, valueGetter: (params) => params.row.createdAt?.substring(0, 10) || "N/A" },
        {
            field: "documentStatus", headerName: "상태", flex: 1, valueGetter: (params) => {
                switch (params.value) {
                    case "DRAFT": return "임시 저장";
                    case "IN_PROGRESS": return "결재중";
                    case "APPROVED": return "승인 완료";
                    case "REJECTED": return "반려";
                    default: return "전체 보기";
                }
            }
        },
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

                {/*  작성 버튼 */}
                <Box display="flex" justifyContent="flex-end" mb="10px">
                    <Button
                        onClick={handleOpenDocumentForm}
                        variant="contained"
                        sx={{
                            width: '200px',
                            height: '50px',
                            fontSize: '15px',
                            backgroundColor: '#6870fa',
                            color: '#fff',
                            '&:hover': { backgroundColor: '#b6b6b6ac' },
                        }}
                    >
                        + 결재 작성
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
                        "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                            color: `${colors.gray[100]} !important`,
                        },
                        "& .MuiDataGrid-virtualScroller": {
                            backgroundColor: colors.primary[400],
                        }
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

            {/* 문서 작성 폼 모달 */}
            {isDocumentFormOpen && (
                <ApprovalDocumentForm
                    handleClose={handleCloseDocumentForm}
                    onSubmit={handleApprovalLineSubmit}
                />
            )}

            {/* 결재 진행 상황 모달 */}
            {approvalLines.length > 0 && (
                <TableModal
                    open={isModalOpen}  // 모달 열림 상태 전달
                    handleClose={handleCloseModal}  // 모달 닫기 함수 전달
                    approvalLines={approvalLines}  // 결재 라인 데이터 전달
                    approvalStatus={approvalStatus}  // 승인 상태 데이터 전달
                    handleApprove={handleApprove}  // 승인/반려 처리 함수 전달
                    currentUser={currentUser}  // 현재 로그인한 사용자 정보 전달
                />
            )}

            {/* 결재 작성 모달 */}
            <ApprovalDocumentForm
                open={isDocumentFormOpen}
                handleClose={handleCloseDocumentForm}
                onSubmit={() => { console.log('문서 제출됨'); }}
            />

            {/* 결재 문서 모달 */}
            {isModalOpen && (
                <DocumentModal
                    documentId={selectedDocumentId}
                    handleClose={() => setIsModalOpen(false)}
                />
            )}

        </div>
    );
};

export default Elec;