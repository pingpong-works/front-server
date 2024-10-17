import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  useTheme,
  Modal,
  Typography,
} from "@mui/material";
import axios from "axios";
import { tokens } from "../../../theme";

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

const CreateRoomModal = ({ open, onClose, onRoomAdded }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [roomName, setRoomName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [equipments, setEquipments] = useState([""]); // 설비 입력창 기본 1개

  // 설비 입력 추가 핸들러
  const handleAddEquipment = () => {
    setEquipments([...equipments, ""]); // 입력창 추가
  };

  // 설비 입력값 변경 처리
  const handleEquipmentChange = (index, value) => {
    const updatedEquipments = [...equipments];
    updatedEquipments[index] = value;
    setEquipments(updatedEquipments);
  };

  // 설비 입력창 삭제 핸들러
  const handleRemoveEquipment = (index) => {
    const updatedEquipments = [...equipments];
    updatedEquipments.splice(index, 1); // 해당 입력창 삭제
    setEquipments(updatedEquipments);
  };

  // 모달이 닫힐 때 값 초기화
  const handleClose = () => {
    setRoomName("");
    setCapacity("");
    setLocation("");
    setEquipments([""]); // 초기화
    onClose();
  };

  // POST 요청 처리
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const decodedToken = parseJwt(token);

      if (!roomName) {
        alert("회의실 이름을 입력해 주세요.");
        return;
      }

      if (!capacity || isNaN(capacity) || capacity <= 0) {
        alert("유효한 숫자를 입력해 주세요.");
        return;
      }

      if (!location) {
        alert("위치를 입력해 주세요.");
        return;
      }

      const employeeId = decodedToken.employeeId; // 토큰에서 employeeId 추출

      // POST 요청에 보낼 데이터 구성
      const roomData = {
        name: roomName || "Unknown", // 이름이 비어 있을 경우 기본값 설정
        maxCapacity: capacity || 0, // 수용 인원이 비어 있을 경우 기본값 0 설정
        location: location || "Unknown", // 위치가 비어 있을 경우 기본값 설정
        equipment: equipments.filter((equipment) => equipment.trim() !== ""), // 빈 설비는 제외
      };

      // 회의실 등록 요청 전송
      const response = await axios.post(`http://localhost:8084/rooms?employeeId=${employeeId}`, roomData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        alert("회의실이 성공적으로 등록되었습니다.");
        onRoomAdded();
        handleClose();
      } else {
        alert("회의실 등록에 실패했습니다.");
      }
    } catch (error) {
      alert("회의실 등록에 실패했습니다.");
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: colors.primary[400],
          borderRadius: "8px",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" mb={2} sx={{ color: colors.gray[100] }}>
          회의실 등록
        </Typography>

        <TextField
          label="회의실 이름"
          variant="outlined"
          fullWidth
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: colors.gray[300],
              },
              "&:hover fieldset": {
                borderColor: colors.greenAccent[500],
              },
              "&.Mui-focused fieldset": {
                borderColor: colors.greenAccent[500],
              },
            },
            "& .MuiInputLabel-root": {
              color: colors.gray[100],
            },
          }}
        />

        <TextField
          label="수용 인원"
          variant="outlined"
          fullWidth
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: colors.gray[300] },
              "&:hover fieldset": {
                borderColor: colors.greenAccent[500] },
              "&.Mui-focused fieldset": {
                borderColor: colors.greenAccent[500] }},
            "& .MuiInputLabel-root": { color: colors.gray[100] }}}
        />

        <TextField
          label="위치"
          variant="outlined"
          fullWidth
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: colors.gray[300],
              },
              "&:hover fieldset": {
                borderColor: colors.greenAccent[500],
              },
              "&.Mui-focused fieldset": {
                borderColor: colors.greenAccent[500],
              },
            },
            "& .MuiInputLabel-root": {
              color: colors.gray[100],
            },
          }}
        />

        <Typography variant="body1" sx={{ color: colors.gray[100], mb: 1 }}>
          설비
        </Typography>

        {equipments.map((equipment, index) => (
          <Box display="flex" key={index} mb={2} alignItems="center">
            <TextField
              variant="outlined"
              fullWidth
              value={equipment}
              onChange={(e) => handleEquipmentChange(index, e.target.value)}
              placeholder="설비 입력"
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: colors.gray[300],
                  },
                  "&:hover fieldset": {
                    borderColor: colors.greenAccent[500],
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: colors.greenAccent[500],
                  },
                },
                "& .MuiInputLabel-root": {
                  color: colors.gray[100],
                },
              }}
            />
            {equipments.length > 1 && (
              <Button
                variant="text"
                color="error"
                onClick={() => handleRemoveEquipment(index)}
                sx={{
                  ml: 1,
                  color: colors.redAccent[500],
                  "&:hover": {
                    backgroundColor: "transparent",
                    color: colors.redAccent[700],
                  },
                }}
              >
                삭제
              </Button>
            )}
          </Box>
        ))}

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={handleAddEquipment}
            sx={{
              color: colors.greenAccent[500],
              borderColor: colors.greenAccent[500],
              "&:hover": {
                borderColor: colors.greenAccent[700],
              },
            }}
          >
            설비 추가
          </Button>

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              color="error"
              onClick={handleClose}
              sx={{
                color: colors.redAccent[500],
                borderColor: colors.redAccent[500],
                mr: 2,
                "&:hover": {
                  borderColor: colors.redAccent[700],
                },
              }}
            >
              취소
            </Button>
            <Button
              variant="outlined"
              onClick={handleSubmit}
              sx={{
                color: colors.greenAccent[500],
                borderColor: colors.greenAccent[500],
                "&:hover": {
                  borderColor: colors.greenAccent[700],
                },
              }}
            >
              등록
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateRoomModal;
