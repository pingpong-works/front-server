import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, Button } from "@mui/material";
import { AddOutlined } from "@mui/icons-material";
import { Header } from "../../../components";
import { tokens } from "../../../theme";
import axios from "axios";
import CreateRoomModal from "./createRoomModal";
import ViewRoomModal from "./viewRoomModal";
import UpdateRoomModal from "./updateRoomModal";
import DeleteRoomModal from "./deleteRoomModal";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// JWT 디코딩 함수
const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const Rooms = () => {
  const theme = createTheme({
    palette: {
      mode: "dark",
    },
  });
  const colors = tokens(theme.palette.mode);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

  // Room 데이터 조회
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8084/rooms");

      const filteredData = response.data.map((item) => ({
        id: item.roomId,
        roomName: item.name,
        maxCapacity: item.maxCapacity,
        equipment: item.equipment.join(", "),
        available: item.available ? "Available" : "Unavailable",
      }));

      setData(filteredData);
    } catch (error) {
      alert("회의실 정보를 가져오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRowClick = (id) => {
    setSelectedRoomId(id);
    setViewModalOpen(true);
  };

  const handleRoomAdded = () => {
    fetchData();
    handleClose();
  };

  const handleViewModalClose = () => {
    setViewModalOpen(false);
    setSelectedRoomId(null);
  };

  // 회의실 수정 모달 열기
  const handleUpdateClick = () => {
    setUpdateModalOpen(true);
  };

  // 회의실 삭제 모달 열기
  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  // 회의실 삭제 요청 처리
  const handleDeleteConfirm = async () => {
    const employeeId = getEmployeeIdFromToken();
    if (!employeeId) return;

    try {
      await axios.delete(`http://localhost:8084/rooms/${selectedRoomId}?employeeId=${employeeId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      fetchData();
      alert("회의실이 삭제되었습니다.");
      setDeleteModalOpen(false);
      setViewModalOpen(false);
    } catch (error) {
      alert("회의실 삭제에 실패했습니다.");
    }
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Header title="회의실 관리" subtitle="등록된 회의실 목록" />
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
          회의실 등록
        </Button>
      </Box>

      <CreateRoomModal open={open} onClose={handleClose} onRoomAdded={handleRoomAdded} />

      <Box mt="20px">
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={2}>
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
                <Typography variant="h6" textAlign="center">
                  {item.roomName}
                </Typography>
                <Typography variant="body2" textAlign="center">
                  수용 인원: {item.maxCapacity}명
                </Typography>
                <Typography variant="body2" textAlign="center">
                  설비: {item.equipment}
                </Typography>
                <Typography variant="body2" textAlign="center" color={item.available === "Available" ? colors.greenAccent[500] : colors.redAccent[500]}>
                  {item.available}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <ThemeProvider theme={theme}>
        <ViewRoomModal
          isOpen={viewModalOpen}
          roomId={selectedRoomId}
          onClose={handleViewModalClose}
          onUpdate={handleUpdateClick}
          onDelete={handleDeleteClick}
          onPatch={handleUpdate}
        />
        <UpdateRoomModal
          isOpen={updateModalOpen}
          roomId={selectedRoomId}
          onClose={() => setUpdateModalOpen(false)}
          onUpdateSuccess={() => {
            fetchData();
            setHandleUpdate((prev) => !prev);
          }}
        />
        <DeleteRoomModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onDeleteConfirm={handleDeleteConfirm}
        />
      </ThemeProvider>
    </Box>
  );
};

export default Rooms;
