import {
  Box,
  IconButton,
  InputBase,
  useTheme,
  Typography,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import {SearchOutlined, AddOutlined} from "@mui/icons-material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const Boards = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [searchOption, setSearchOption] = useState("title");
  const [sortOption, setSortOption] = useState("createdAt_desc");

    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8085/boards", {
          params: {
            keyword: keyword,
            searchOption: searchOption,
            sort: sortOption,
            page: 1,
            size: 15,
          },
        });

        const transformedData = response.data.data.map((item) => ({
          id: item.boardId, 
          boardId: item.boardId,
          title: item.title,
          employeeName: item.employeeName || '익명',
          category: item.category,
          createdAt: item.createdAt,
          views: item.views,
        }));

        setData(transformedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data", error);
        setLoading(false);
      }
    };

  const handleSearch = () => {
    fetchData();
  };

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
    fetchData();
  };

  const handleSearchOptionChange = (event) => {
    setSearchOption(event.target.value);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { field: "boardId", 
      headerName: "No",
      headerAlign:"center",
      align: "center" },
    {
      field: "title",
      headerName: "제목",
      flex: 2,
      headerAlign:"center",
      align: "center",
      cellClassName: "name-column--cell",
    },
    {
      field: "employeeName",
      headerName: "작성자",
      flex: 1,
      headerAlign:"center",
      align: "center"
    },
    {
      field: "category",
      headerName: "카테고리",
      flex: 1,
      headerAlign:"center",
      align: "center"
    },
    {
      field: "createdAt",
      headerName: "등록일",
      flex: 1,
      headerAlign:"center",
      align: "center",
      renderCell: (params) => (
        <Typography>
          {params.row.createdAt.split("T")[0]}
        </Typography>
      ),
    },
    {
      field: "views",
      headerName: "조회수",
      flex: 0.5,
      headerAlign:"center",
      align: "center",
      renderCell: (params) => (
        <Typography color={colors.greenAccent[500]}>
          {params.row.views}
        </Typography>
      ),
    },
    
  ];
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="Boards" subtitle="List of Boards" />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddOutlined />}
          onClick={() => navigate("createBoard")}
          sx={{
            height: "50px", 
            padding: "0 20px", 
            backgroundColor: colors.greenAccent[500], 
            fontSize: "16px",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: colors.greenAccent[700],
            },
          }}
        >
          작성하기
        </Button>
      </Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bgcolor={colors.primary[400]}
        borderRadius="3px"
        p={2}
        mb={2}
      >
        <Box display="flex" alignItems="center" flexGrow={1}>
          <Select
            value={searchOption}
            onChange={handleSearchOptionChange}
            sx={{
              color: colors.gray[100],
              backgroundColor: colors.primary[500],
              mr: 2,
            }}
          >
            <MenuItem value="title">제목</MenuItem>
            <MenuItem value="content">내용</MenuItem>
            <MenuItem value="title_content">제목+내용</MenuItem>
            <MenuItem value="employeeName">작성자</MenuItem>
          </Select>

          <InputBase
            placeholder="Search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            sx={{ ml: 2, flex: 1 }}
          />
          <IconButton type="button" onClick={handleSearch} sx={{ p: 1 }}>
            <SearchOutlined />
          </IconButton>
        </Box>
      </Box>
      
      <Box
        mt="20px"
        height="63vh"
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
        <DataGrid
          rows={data}
          columns={columns}
          getRowId={(row) => row.boardId}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          checkboxSelection
        />
      </Box>
    </Box>
  );
};

export default Boards;
