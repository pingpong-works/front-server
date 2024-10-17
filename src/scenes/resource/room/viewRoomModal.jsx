import React, { useEffect, useState } from 'react';
import { Box, Button, Modal, Typography } from '@mui/material';
import axios from 'axios';
import { tokens } from '../../../theme';
import { useTheme } from "@mui/material/styles";

const ViewRoomModal = ({ isOpen, roomId, onClose, onUpdate, onDelete, onPatch }) => {
  const theme = useTheme();
  const [roomDetails, setRoomDetails] = useState(null);
  const colors = tokens(theme.palette.mode);

  const fetchRoomDetails = async () => {
    if (roomId) {
      try {
        const response = await axios.get(`http://localhost:8084/rooms/${roomId}`);
        setRoomDetails(response.data.data);
      } catch (error) {
        alert("회의실 정보를 가져오는 데 실패했습니다.");
      }
    }
  };

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId, onPatch]);  // 의존성 배열에 onPatch 추가

  if (!roomDetails) return null;

  const { name, maxCapacity, location, available, equipment } = roomDetails;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.default',
        borderRadius: '8px',
        width: '90vw',
        maxWidth: '800px',
        height: 'auto',
        maxHeight: '90vh',
        boxShadow: 24,
        p: 4
      }}>
        {/* 회의실 정보 */}
        <Typography variant="h4" component="h4" sx={{ mb: 2, color: colors.gray[100] }}>
          {name}
        </Typography>
        <Typography variant="body1" sx={{ color: colors.gray[100], mb: 2 }}>
          위치 : {location}
        </Typography>
        <Typography variant="body1" sx={{ color: colors.gray[100], mb: 2 }}>
          수용 인원 : {maxCapacity}명
        </Typography>
        <Typography variant="body1" sx={{ color: available ? colors.greenAccent[500] : colors.redAccent[500], mb: 2 }}>
          {available ? "사용 가능" : "사용 불가"}
        </Typography>

        {/* 설비 정보 */}
        <Typography variant="body1" sx={{ color: colors.gray[100], mb: 2 }}>
          설비 : {equipment && equipment.length > 0 ? equipment.join(", ") : "설비 정보 없음"}
        </Typography>

        <Box mt={2} display="flex" alignItems="center">
          <Button onClick={onUpdate} variant="contained" color="primary">수정</Button>
          <Button onClick={onDelete} variant="outlined" color="secondary" sx={{ ml: 2 }}>삭제</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewRoomModal;
