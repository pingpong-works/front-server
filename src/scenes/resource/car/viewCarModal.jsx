import React, { useEffect, useState } from 'react';
import { Box, Button, Modal, Typography } from '@mui/material';
import axios from 'axios';
import { tokens } from '../../../theme';
import defaultImage from "../../../assets/images/logo.png";
import { useTheme } from "@mui/material/styles";

const ViewCarModal = ({ isOpen, carId, onClose, onUpdate, onDelete, onPatch }) => {
  const theme = useTheme();
  const [carDetails, setCarDetails] = useState(null);
  const colors = tokens(theme.palette.mode);

  const fetchCarDetails = async () => {
    if (carId) {
      try {
        const response = await axios.get(`http://localhost:8084/cars/${carId}`);
        setCarDetails(response.data.data);
      } catch (error) {
        console.error("Error fetching car details:", error);
      }
    }
  };

  useEffect(() => {
    fetchCarDetails();
  }, [carId, onPatch]);  // 의존성 배열에 onPatch 추가

  if (!carDetails) return null;

  const { name, fuel, number, available, images } = carDetails;
  const imageEntries = images ? [images] : [{ url: defaultImage, description: "No Image Available" }];

  const fuelTypeToKorean = (fuel) => {
    switch (fuel) {
      case "DIESEL":
        return "경유";
      case "GASOLINE":
        return "휘발유";
      case "ELECTRIC":
        return "전기";
      default:
        return fuel;
    }
  };

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
        {/* 차량 정보 */}
        <Typography variant="h4" component="h4" sx={{ mb: 2, color: colors.gray[100] }}>
          {name} ({number})
        </Typography>
        <Typography variant="body1" sx={{ color: colors.gray[100], mb: 2 }}>
          연료 : {fuelTypeToKorean(fuel)}
        </Typography>
        <Typography variant="body1" sx={{ color: available ? colors.greenAccent[500] : colors.redAccent[500], mb: 2 }}>
          {available ? "사용 가능" : "사용 불가"}
        </Typography>

        {/* 이미지 */}
        <Box display="flex" justifyContent="center" alignItems="center" position="relative" mb={2}>
          <Box
            component="img"
            src={images?.url || defaultImage}
            alt={images?.description || "No Image"}
            sx={{
              width: "100%",
              maxWidth: "100%",
              height: "auto",
              maxHeight: "60vh",
              objectFit: images?.url === defaultImage ? "contain" : "cover",
              borderRadius: "8px",
            }}
          />
        </Box>

        <Typography variant="body2" sx={{ textAlign: "center", color: colors.gray[200], mb: 2 }}>
          {images?.description || "이미지 설명 없음"}
        </Typography>

        <Box mt={2} display="flex" alignItems="center">
          <Button onClick={onUpdate} variant="contained" color="primary">수정</Button>
          <Button onClick={onDelete} variant="outlined" color="secondary" sx={{ ml: 2 }}>삭제</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ViewCarModal;
