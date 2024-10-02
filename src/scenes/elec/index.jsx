import { Box, useTheme, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { Header } from "../../components";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { mockDataContacts } from "../../data/mockData";
import { tokens } from "../../theme";
import axios from "axios";
import { useEffect, useState } from "react";

const Elec = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [list, setList] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState("all");
    const getStatusCount = () => {
        axios.post("/elecapp/receivedApp", { memberId: "1" }) // 실제 멤버 ID로 교체 필요
            .then(res => {
                setList(res.data);
                setFilteredData(res.data);
            })
            .catch(err => console.error("오류 발생:", err));
    };
    useEffect(() => {
        getStatusCount();
    }, []);
    const handleStatusChange = (event) => {
        const status = event.target.value;
        setSelectedStatus(status);
        if (status === "all") {
            setFilteredData(list);
        } else {
            setFilteredData(
                list.filter(item => {
                    switch (status) {
                        case "ready":
                            return item.approveType === 0;
                        case "ing":
                            return item.approveType === 2;
                        case "done":
                            return item.approveType === 3;
                        default:
                            return true;
                    }
                })
            );
        }
    };
    const columns = [
        { field: "id", headerName: "ID", flex: 0.5 },
        {
            field: "appDocType",
            headerName: "종류",
            flex: 1,
            valueGetter: (params) => {
                switch (params.value) {
                    case 0:
                        return "품의서";
                    case 1:
                        return "휴가신청서";
                    case 2:
                        return "지출보고서";
                    default:
                        return "";
                }
            },
        },
        {
            field: "title",
            headerName: "제목",
            flex: 1,
            valueGetter: (params) =>
                params.row.additionalFields?.title || "휴가신청서",
        },
        { field: "writer", headerName: "작성자", flex: 1 },
        { field: "department", headerName: "부서", flex: 1 },
        {
            field: "writeday",
            headerName: "작성일",
            flex: 1,
            valueGetter: (params) =>
                params.value ? params.value.substring(0, 10) : "N/A",
        },
        {
            field: "approveType",
            headerName: "상태",
            flex: 1,
            valueGetter: (params) => {
                switch (params.value) {
                    case 0:
                        return "반려";
                    case 1:
                        return "제출완료";
                    case 2:
                        return "진행중";
                    case 3:
                        return "결재완료";
                    default:
                        return "";
                }
            },
        },
    ];
    return (
        <Box m="20px">
            <Header title="결재현황" subtitle="List of Elec for Future Reference" />
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
                        <MenuItem value="ready">결재 대기</MenuItem>
                        <MenuItem value="ing">결재 중</MenuItem>
                        <MenuItem value="done">결재 완료</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Box
                mt="40px"
                height="75vh"
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
                        backgroundColor: colors.blueAccent[700],
                        borderBottom: "none",
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "none",
                        backgroundColor: colors.blueAccent[700],
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                    },
                    "& .MuiDataGrid-iconSeparator": {
                        color: colors.primary[100],
                    },
                    "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
                        color: `${colors.gray[100]} !important`,
                    },
                }}
            >
                <DataGrid
                    rows={filteredData}
                    columns={columns}
                    components={{ Toolbar: GridToolbar }}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                    }}
                    checkboxSelection
                />
            </Box>
        </Box>
    );
};

export default Elec;