import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Modal, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import { tokens } from '../../../theme';
import { useTheme } from "@mui/material/styles";

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

const UpdateRoomModal = ({ isOpen, roomId, onClose, onUpdateSuccess }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [roomDetails, setRoomDetails] = useState({
    name: '',
    maxCapacity: '',
    location: '',
    available: true,
    equipment: [],  // 추가된 설비 배열
    equipmentsToDelete: [],  // 삭제된 설비 배열
  });

  const [originalEquipment, setOriginalEquipment] = useState([]);  // 원본 설비 배열
  const [previewEquipment, setPreviewEquipment] = useState([]);  // 미리보기용 설비 배열

  // 폼 유효성 검사
  const isFormValid = roomDetails.name && roomDetails.maxCapacity;

  // 회의실 상세 정보 가져오기
  const fetchRoomDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8084/rooms/${roomId}`);
      const roomData = response.data.data;
      setRoomDetails((prev) => ({
        ...prev,
        name: roomData.name || '',
        maxCapacity: roomData.maxCapacity || '',
        location: roomData.location || '',
        available: roomData.available || false,
      }));
      setOriginalEquipment(roomData.equipment || []); // 원본 설비 저장
      setPreviewEquipment(roomData.equipment.length > 0 ? roomData.equipment : []); // 미리보기 배열 설정
    } catch (error) {
      alert("회의실 정보를 가져오는 데 실패했습니다.");
    }
  };

  useEffect(() => {
    if (roomId && isOpen) {
      fetchRoomDetails(); // 모달이 열릴 때마다 데이터 가져오기
    } else {
      setRoomDetails({
        name: '',
        maxCapacity: '',
        location: '',
        available: true,
        equipment: [],
        equipmentsToDelete: [],
      });
      setOriginalEquipment([]);
      setPreviewEquipment([]); // 미리보기 배열 초기화
    }
  }, [roomId, isOpen]);

  // 입력 필드 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomDetails((prev) => ({ ...prev, [name]: value }));
  };

  // 설비 필드 값 변경 처리
  const handleEquipmentChange = (index, value) => {
    const updatedPreviewEquipment = [...previewEquipment];
    updatedPreviewEquipment[index] = value;  // 미리보기 배열 업데이트
    setPreviewEquipment(updatedPreviewEquipment);
  };

  // 설비 입력창 추가
  const handleAddEquipment = () => {
    setPreviewEquipment((prev) => [...prev, '']);  // 미리보기 배열에 추가
  };

  // 설비 입력창 제거
  const handleRemoveEquipment = (index) => {
    const equipmentToRemove = previewEquipment[index];  // 미리보기 배열에서 제거할 설비 선택

    // 만약 삭제할 설비가 원본 설비에 있다면, 삭제 리스트에 추가
    if (originalEquipment.includes(equipmentToRemove)) {
      setRoomDetails((prev) => ({
        ...prev,
        equipmentsToDelete: [...prev.equipmentsToDelete, equipmentToRemove],  // 삭제된 설비 배열에 추가
      }));
    }

    // 미리보기 배열에서 해당 설비 제거
    setPreviewEquipment((prev) => prev.filter((_, i) => i !== index));
  };

  // 제출 처리
  const handleSubmit = async () => {
    if (!isFormValid) {
      alert("필수 항목을 모두 채워주세요.");
      return;
    }

    // 추가된 설비 배열 만들기 (원본 설비에 없는 설비만 추가)
    const newEquipments = previewEquipment.filter(equip => !originalEquipment.includes(equip));

    try {
      const updatedRoomDetails = {
        ...roomDetails,
        equipment: newEquipments,  // 추가된 설비만 보냄
      };

      const token = localStorage.getItem("accessToken");
      const decodedToken = parseJwt(token);
      const employeeId = decodedToken?.employeeId;

      // 서버로 PATCH 요청
      await axios.patch(
        `http://localhost:8084/rooms/${roomId}?employeeId=${employeeId}`,
        updatedRoomDetails
      );

      onUpdateSuccess();  // 성공 시 처리
      alert("회의실을 성공적으로 수정했습니다.");
      onClose();
    } catch (error) {
      alert("회의실 수정에 실패했습니다.");
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: colors.primary[400],
          p: 4,
          borderRadius: '8px',
          boxShadow: 24,
          width: 400,
        }}
      >
        <Typography variant="h6" mb={2} sx={{ color: colors.gray[100] }}>
          회의실 수정
        </Typography>

        <TextField
          fullWidth
          label="회의실 이름"
          name="name"
          value={roomDetails.name}
          onChange={handleChange}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: colors.gray[300] },
              "&:hover fieldset": { borderColor: colors.greenAccent[500] },
              "&.Mui-focused fieldset": { borderColor: colors.greenAccent[500] },
            },
            "& .MuiInputLabel-root": { color: colors.gray[100] },
          }}
        />

        <TextField
          fullWidth
          label="수용 인원"
          name="maxCapacity"
          value={roomDetails.maxCapacity}
          onChange={handleChange}
          type="number"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: colors.gray[300] },
              "&:hover fieldset": { borderColor: colors.greenAccent[500] },
              "&.Mui-focused fieldset": { borderColor: colors.greenAccent[500] },
            },
            "& .MuiInputLabel-root": { color: colors.gray[100] },
          }}
        />

        <TextField
          fullWidth
          label="위치"
          name="location"
          value={roomDetails.location}
          onChange={handleChange}
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: colors.gray[300] },
              "&:hover fieldset": { borderColor: colors.greenAccent[500] },
              "&.Mui-focused fieldset": { borderColor: colors.greenAccent[500] },
            },
            "& .MuiInputLabel-root": { color: colors.gray[100] },
          }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>사용 가능 여부</InputLabel>
          <Select
            name="available"
            value={roomDetails.available ? "available" : "unavailable"}
            onChange={(e) => setRoomDetails((prev) => ({
              ...prev,
              available: e.target.value === "available",
            }))}
            label="사용 가능 여부"
            sx={{
              color: colors.gray[100],
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: colors.gray[300] },
                "&:hover fieldset": { borderColor: colors.greenAccent[500] },
                "&.Mui-focused fieldset": { borderColor: colors.greenAccent[500] },
              },
            }}
          >
            <MenuItem value="available">사용 가능</MenuItem>
            <MenuItem value="unavailable">사용 불가</MenuItem>
          </Select>
        </FormControl>

        {/* 설비 필드 */}
        <Typography variant="h6" mb={2} sx={{ color: colors.gray[100] }}>
          설비
        </Typography>
        {previewEquipment.map((equipment, index) => (
          <Box key={index} display="flex" alignItems="center" mb={2}>
            <TextField
              fullWidth
              label={`설비 ${index + 1}`}
              value={equipment}
              onChange={(e) => handleEquipmentChange(index, e.target.value)}
              sx={{
                mr: 1,
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: colors.gray[300] },
                  "&:hover fieldset": { borderColor: colors.greenAccent[500] },
                  "&.Mui-focused fieldset": { borderColor: colors.greenAccent[500] },
                },
                "& .MuiInputLabel-root": { color: colors.gray[100] },
              }}
            />
            {previewEquipment.length > 1 && (
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

        {/* 설비 추가 버튼 */}
        <Button
          variant="outlined"
          onClick={handleAddEquipment}
          sx={{
            color: colors.greenAccent[500],
            borderColor: colors.greenAccent[500],
            mb: 2,
            "&:hover": {
              borderColor: colors.greenAccent[700],
            },
          }}
        >
          설비 추가
        </Button>

        <Box display="flex" justifyContent="flex-end">
          <Button
            onClick={onClose}
            sx={{
              mr: 2,
              color: colors.redAccent[500],
              borderColor: colors.redAccent[500],
              "&:hover": {
                borderColor: colors.redAccent[700],
              },
            }}
          >
            취소
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!isFormValid}
            sx={{
              backgroundColor: isFormValid ? colors.greenAccent[500] : colors.gray[500],
              "&:hover": {
                backgroundColor: isFormValid ? colors.greenAccent[700] : colors.gray[600],
              },
            }}
          >
            저장
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UpdateRoomModal;
