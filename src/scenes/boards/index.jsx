import { Box, Typography, useTheme } from "@mui/material";
import { Header } from "../../components";
import { DataGrid } from "@mui/x-data-grid";
import { mockDataInvoices } from "../../data/mockData";
import { tokens } from "../../theme";

const Boards = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const columns = [
    { field: "id", 
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
      field: "author",
      headerName: "작성자",
      flex: 1,
      headerAlign:"center",
      align: "center"
    },
    {
      field: "department",
      headerName: "카테고리",
      flex: 1,
      headerAlign:"center",
      align: "center"
    },
    {
      field: "date",
      headerName: "등록일",
      flex: 1,
      headerAlign:"center",
      align: "center"
    },
    {
      field: "cost",
      headerName: "조회수",
      flex: 0.5,
      headerAlign:"center",
      align: "center",
      renderCell: (params) => (
        <Typography color={colors.greenAccent[500]}>
          ${params.row.cost}
        </Typography>
      ),
    },
  ];
  return (
    <Box m="20px">
      <Header title="Boards" subtitle="List of Boards" />
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
        }}
      >
        <DataGrid
          rows={mockDataInvoices}
          columns={columns}
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

export default Boards;
