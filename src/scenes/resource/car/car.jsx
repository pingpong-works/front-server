import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button } from "@mui/material";
import { AddOutlined } from "@mui/icons-material";
import { Header } from "../../../components";
import { tokens } from "../../../theme";
import axios from "axios";
import defaultImage from "../../../assets/images/logo.png";
import CreateCarModal from "./CreateCarModal";
import ViewCarModal from "./ViewCarModal";
import UpdateCarModal from "./updateCarModal";  // 수정 모달 추가
import DeleteCarModal from "./deleteCarModal";  // 삭제 확인 모달 추가
import { ThemeProvider, createTheme } from "@mui/material/styles";

// JWT 디코딩 함수
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const Car = () => {
  const theme = createTheme({
    palette: {
      mode: "dark", // 또는 "light"
    },
  });
  const colors = tokens(theme.palette.mode);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);  // 수정 모달 상태
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);  // 삭제 모달 상태

  // 업데이트 상태를 관리하는 변수
  const [handleUpdate, setHandleUpdate] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // JWT에서 employeeId 가져오기
  const getEmployeeIdFromToken = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인된 사용자가 아닙니다. 토큰을 찾을 수 없습니다.");
      return null;
    }
    const decodedToken = parseJwt(token);
    return decodedToken?.employeeId || null;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8084/cars");

      const filteredData = response.data.map((item) => ({
        id: item.carId,
        carName: item.name,
        fuelType: item.fuel,
        thumbnail: item.images?.url || defaultImage,
      }));

      setData(filteredData);
    } catch (error) {
      alert("차량 정보를 가져오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRowClick = (id) => {
    setSelectedCarId(id);
    setViewModalOpen(true);
  };

  const handleCarAdded = () => {
    fetchData();
    handleClose();
  };

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedCarId(null);
  };

  // 차량 수정 모달 열기
  const handleUpdateClick = () => {
    setUpdateModalOpen(true);
  };

  // 차량 삭제 모달 열기
  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  // 차량 삭제 요청 처리
  const handleDeleteConfirm = async () => {
    const employeeId = getEmployeeIdFromToken();
    if (!employeeId) return;

    try {
      await axios.delete(`http://localhost:8084/cars/${selectedCarId}?employeeId=${employeeId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      fetchData();
      alert("차량이 삭제되었습니다.");
      setDeleteModalOpen(false);
      setViewModalOpen(false);
    } catch (error) {
      alert("차량을 삭제하는 데 실패했습니다.");
    }
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="차량 관리" subtitle="등록된 차량 목록" />
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddOutlined />}
          onClick={handleOpen}
          sx={{
            height: "50px",
            padding: "0 20px",
            backgroundColor: colors.blueAccent[500],
            fontSize: "16px",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: colors.blueAccent[700],
            },
          }}
        >
          차량 등록
        </Button>
      </Box>

      <CreateCarModal open={open} onClose={handleClose} onCarAdded={handleCarAdded} />

      <Box mt="20px">
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns="repeat(4, 1fr)"
            gap={2}
          >
            {data.map((item) => (
              <Box
                key={item.id}
                onClick={() => handleRowClick(item.id)}
                sx={{
                  padding: "16px",
                  backgroundColor: colors.primary[400],
                  borderRadius: "8px",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: colors.blueAccent[500],
                  },
                }}
              >
                <Box
                  component="img"
                  src={item.thumbnail}
                  alt={`${item.carName}`}
                  sx={{
                    width: "100%",
                    height: "150px",
                    objectFit: item.thumbnail === defaultImage ? "contain" : "cover",
                    borderRadius: "8px",
                    mb: 2,
                    backgroundColor: item.thumbnail === defaultImage ? colors.primary[200] : "transparent",
                  }}
                />
                <Typography variant="h6" textAlign="center">
                  [{item.fuelType}] {item.carName}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <ThemeProvider theme={theme}>
        <ViewCarModal
          isOpen={viewModalOpen}
          carId={selectedCarId}
          onClose={handleViewModalClose}
          onUpdate={handleUpdateClick}
          onDelete={handleDeleteClick}
          onPatch={handleUpdate}
        />
        <UpdateCarModal
          isOpen={updateModalOpen}
          carId={selectedCarId}
          onClose={() => setUpdateModalOpen(false)}
          onUpdateSuccess={() => {
            fetchData();
            setHandleUpdate(prev => !prev); 
          }}
        />
        <DeleteCarModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onDeleteConfirm={handleDeleteConfirm}
        />
      </ThemeProvider>
    </Box>
  );
};

export default Car;
