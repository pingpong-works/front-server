import React, { useEffect, useState } from 'react';
import { Box, Button, TextField, Modal, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import { tokens } from '../../../theme';
import { useTheme } from "@mui/material/styles";

const UpdateRoomModal = ({ isOpen, roomId, onClose, onUpdateSuccess }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [roomDetails, setRoomDetails] = useState({
    name: '',
    maxCapacity: '',
    location: '',
    available: true,
    equipment: [''],  // 기본 설비 입력 필드 추가
  });
  const [errorMessage, setErrorMessage] = useState('');

  // 폼 유효성 검사: 필수 항목 (회의실 이름과 수용 인원)
  const isFormValid = roomDetails.name && roomDetails.maxCapacity;

  // 회의실 상세 정보 가져오기
  const fetchRoomDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8084/rooms/${roomId}`);
      const roomData = response.data.data;
      setRoomDetails({
        name: roomData.name || '',
        maxCapacity: roomData.maxCapacity || '',
        location: roomData.location || '',
        available: roomData.available || false,
        equipment: roomData.equipment.length > 0 ? roomData.equipment : [''],  // 설비가 있으면 추가
      });
    } catch (error) {
      console.error("Error fetching room details:", error);
      setErrorMessage('회의실 정보를 불러오는 중 문제가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (roomId && isOpen) {
      fetchRoomDetails(); // 모달이 열릴 때마다 데이터를 불러옴
    } else {
      setRoomDetails({
        name: '',
        maxCapacity: '',
        location: '',
        available: true,
        equipment: [''],
      });
    }
  }, [roomId, isOpen]);

  // 입력 필드 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRoomDetails((prev) => ({ ...prev, [name]: value }));
  };

  // 설비 필드 값 변경 처리
  const handleEquipmentChange = (index, value) => {
    setRoomDetails((prev) => {
      const newEquipment = [...prev.equipment];
      newEquipment[index] = value;
      return { ...prev, equipment: newEquipment };
    });
  };

  // 설비 입력창 추가
  const handleAddEquipment = () => {
    setRoomDetails((prev) => ({
      ...prev,
      equipment: [...prev.equipment, ''],
    }));
  };

  // 설비 입력창 제거
  const handleRemoveEquipment = (index) => {
    setRoomDetails((prev) => {
      const newEquipment = prev.equipment.filter((_, i) => i !== index);
      return { ...prev, equipment: newEquipment.length > 0 ? newEquipment : [''] }; // 최소 1개 필드는 유지
    });
  };

  // 제출 처리
  const handleSubmit = async () => {
    try {
      const updatedRoomDetails = {
        ...roomDetails,
      };

      // 회의실 수정 요청
      await axios.patch(
        `http://localhost:8084/rooms/${roomId}`,
        updatedRoomDetails
      );

      onUpdateSuccess(); // 성공 후 상위 컴포넌트에서 처리
      onClose(); // 모달 닫기
    } catch (error) {
      console.error("Error updating room details:", error);
      setErrorMessage('회의실 수정 중 문제가 발생했습니다.');
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
        {roomDetails.equipment.map((equipment, index) => (
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
            {roomDetails.equipment.length > 1 && (
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

        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}

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
