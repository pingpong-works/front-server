import { Box, useTheme, Button } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { Header } from "../../components";
import { tokens } from "../../theme";
import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Document = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);
    const [list, setList] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    const fetchDocumentTypes = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get('http://localhost:8082/docs-types?page=1&size=10', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            const documents = response.data.data;
            setList(documents);
            setIsLoading(false);
        } catch (err) {
            console.error("오류 발생:", err);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocumentTypes();
    }, []);

    const handleDeleteDocuments = async () => {
        if (selectedRows.length === 0) {
            alert("삭제할 문서를 선택하세요.");
            return;
        }

        try {
            // 선택된 각 문서 타입 ID에 대해 삭제 요청
            await Promise.all(
                selectedRows.map(async (typeId) => {
                    await axios.delete(`http://localhost:8082/docs-types/${typeId}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                        },
                    });
                })
            );
            alert("선택한 문서 타입이 삭제되었습니다.");
            setSelectedRows([]); // 선택된 행 초기화
            fetchDocumentTypes(); // 삭제 후 문서 목록 갱신
        } catch (error) {
            console.error("문서 타입 삭제 중 오류 발생:", error);
            alert("문서 타입 삭제 중 오류가 발생했습니다.");
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 100 },
        { field: 'type', headerName: 'Type', width: 150 },
        { field: 'templateName', headerName: 'Template Name', width: 200, valueGetter: (params) => params.row.documentTemplate.templateName },
        { field: 'version', headerName: 'Version', width: 100, valueGetter: (params) => params.row.documentTemplate.version },
        { field: 'createdAt', headerName: 'Created At', width: 180 },
        { field: 'modifiedAt', headerName: 'Modified At', width: 180 },
    ];

    return (
        <div>
            {isLoading && <p>로딩 중...</p>}
            <Box m="20px">
                <Header title="문서 타입 관리" subtitle="List of Document Types" />

                {/* + 추가 버튼 */}
                <Button
                    onClick={() => navigate("/template-form")}
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
                    + 추가
                </Button>

                {/* - 삭제 버튼 */}
                <Button
                    onClick={handleDeleteDocuments}
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
                    mt="10px"
                    height="75vh"
                    sx={{
                        "& .MuiDataGrid-root": { border: "none" },
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: colors.blueAccent[500],
                            color: colors.gray[200],
                        },
                        "& .MuiDataGrid-footerContainer": {
                            borderTop: "none",
                            color: colors.gray[200],
                            backgroundColor: "#1c8adb",
                        }, "& .MuiCheckbox-root": {
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
                        rows={list}
                        columns={columns}
                        components={{ Toolbar: GridToolbar }}
                        checkboxSelection
                        onRowSelectionModelChange={(newSelectionModel) => {
                            setSelectedRows(newSelectionModel);
                        }}
                        pageSizeOptions={[10]}
                    />
                </Box>
            </Box>
        </div>
    );
};

export default Document;
