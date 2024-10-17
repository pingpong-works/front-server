import React, { useEffect, useState } from 'react';
import { Box, Button, Modal, Typography } from '@mui/material';
import axios from 'axios';
import { tokens } from '../../theme'; 
import { useNavigate } from "react-router-dom";

const ViewModal = ({ isOpen, eventDetails, onCancel, onUpdate, onDelete }) => {
  const [purpose, setPurpose] = useState('');
  const [bookingStatus, setBookingStatus] = useState(''); // 예약 상태
  const [resourceDetails, setResourceDetails] = useState(null); // 차량이나 회의실의 상세 정보
  const colors = tokens();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert('로그인이 필요합니다.');
        navigate('/login');  // 로그인 페이지로 리다이렉트
    }
  }, [navigate]);

  const statusMap = {
    PENDING: "신청",
    CONFIRMED: "확정",
    CANCELLED: "취소",
  };

  const purposeMap = {
    BUSINESS: '업무',
    PERSONAL: '개인',
    MAINTENANCE: '정비',
    OTHER: '기타',
    MEETING: '회의',
    WORKSHOP: '워크샵',
    TRAINING: '교육',
  };

  const fuelMap = {
    DIESEL: '경유',
    GASOLINE: '휘발유',
    ELECTRIC: '전기',
    HYBRID: '하이브리드',
    OTHER: '기타',
  };

  // 자원 상세 정보 조회 함수 (차량 또는 회의실)
  const fetchResourceDetails = async () => {
    if (eventDetails?.carBookId) {
      try {
        const carResponse = await axios.get(`http://localhost:8084/car-books/${eventDetails.carBookId}`);
        if (carResponse && carResponse.data) {
          const carData = carResponse.data.data;
          const purposeKey = carData.purpose;
          setBookingStatus(statusMap[carData.status]); // 상태 업데이트
          setPurpose(purposeMap[purposeKey] || '');
          
          const carDetailsResponse = await axios.get(`http://localhost:8084/cars/${carData.carId}`);
          setResourceDetails(carDetailsResponse.data.data); // 차량 정보 저장
        }
      } catch (error) {
        alert("예약 정보를 가져오는 데 실패했습니다.");
      }
    } else if (eventDetails?.roomBookId) {
      try {
        const roomResponse = await axios.get(`http://localhost:8084/room-books/${eventDetails.roomBookId}`);
        if (roomResponse && roomResponse.data) {
          const roomData = roomResponse.data.data;
          const purposeKey = roomData.purpose;
          setBookingStatus(statusMap[roomData.status]); // 상태 업데이트
          setPurpose(purposeMap[purposeKey] || '');
          
          const roomDetailsResponse = await axios.get(`http://localhost:8084/rooms/${roomData.roomId}`);
          setResourceDetails(roomDetailsResponse.data.data); // 회의실 정보 저장
        }
      } catch (error) {
        alert("예약 정보를 가져오는 데 실패했습니다.");
      }
    }
  };

  useEffect(() => {
    if (eventDetails?.carBookId || eventDetails?.roomBookId) {
      fetchResourceDetails();
    }
  }, [eventDetails?.carBookId, eventDetails?.roomBookId]);

  if (!eventDetails) return null;

  let legendColor = colors.greenAccent[500];

  if (eventDetails?.carBookId) {
    legendColor = colors.redAccent[500];
  } else if (eventDetails?.roomBookId) {
    legendColor = colors.blueAccent[500];
  }

  return (
    <Modal open={isOpen} onClose={onCancel}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.default',
        borderRadius: '8px',
        width: 450,
        boxShadow: 24,
        p: 4
      }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Box width={15} height={15} borderRadius="50%" bgcolor={legendColor} mr={2} mt={1} />
          <Typography variant="h3" component="h3" color="colors.gray[100]">
            {eventDetails?.title} {purpose ? `[${purpose}]` : ''}
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ color: "colors.gray[100]", mb: 2 }}>
          {eventDetails?.content}
        </Typography>

        <Typography variant="body2" sx={{ color: "colors.gray[100]", mb: 1 }}>
          {new Date(eventDetails?.startTime).toLocaleDateString()}{" "}
          {new Date(eventDetails?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {" "}~{" "}
          {new Date(eventDetails?.endTime).toLocaleDateString()}{" "}
          {new Date(eventDetails?.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Typography>

        {/* 차량이나 회의실의 추가 정보 표시 */}
        {resourceDetails && (
          <>
            {eventDetails?.carBookId && (
              <>
                <Typography variant="body1" sx={{ color: "colors.gray[100]", mb: 2 }}>
                  차량 이름: [{resourceDetails.number}] {resourceDetails.name}
                </Typography>
                <Typography variant="body1" sx={{ color: "colors.gray[100]", mb: 2 }}>
                  연료 : {fuelMap[resourceDetails.fuel] || resourceDetails.fuel} 
                </Typography>
                {resourceDetails.images?.url && (
                  <img src={resourceDetails.images.url} alt="차량 이미지" style={{ width: '100%', borderRadius: '8px' }} />
                )}
              </>
            )}
            {eventDetails?.roomBookId && (
              <>
                <Typography variant="body1" sx={{ color: "colors.gray[100]", mb: 2 }}>
                  회의실 이름: {resourceDetails.name}
                </Typography>
                <Typography variant="body1" sx={{ color: "colors.gray[100]", mb: 2 }}>
                  최대 인원: {resourceDetails.maxCapacity}명
                </Typography>
                <Typography variant="body1" sx={{ color: "colors.gray[100]", mb: 2 }}>
                  장비: {resourceDetails.equipment?.length > 0 ? resourceDetails.equipment.join(", ") : "X"} 
                </Typography>
                <Typography variant="body1" sx={{ color: "colors.gray[100]", mb: 2 }}>
                  위치: {resourceDetails.location}
                </Typography>
              </>
            )}
          </>
        )}

        {eventDetails?.isOwner && (
          <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Button
                onClick={onUpdate}
                variant="contained"
                color="primary"
              >
                수정
              </Button>
              <Button
                onClick={onDelete}
                variant="outlined"
                color="secondary"
                sx={{ ml: 2 }}
              >
                삭제
              </Button>
            </Box>
            
            {bookingStatus && (
              <Typography variant="body2" color={colors.gray[200]}>
                예약 상태: {bookingStatus}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default ViewModal;
