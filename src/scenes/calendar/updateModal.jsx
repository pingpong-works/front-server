import React, { useState, useEffect } from 'react';
import { Box, Button, Modal, TextField, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const UpdateModal = ({ isOpen, eventDetails, onCancel, onSubmit }) => {
  const navigate = useNavigate();

  const [inputValues, setInputValues] = useState({
    title: '',
    start: '',
    end: '',
    content: '',
    isReservation: false,
    reservationType: '',
    purpose: '',
    selectedOption: '', // 선택된 차량 또는 회의실 기본값은 빈 문자열로 설정
  });

  const [carList, setCarList] = useState([]);
  const [roomList, setRoomList] = useState([]);

  const carPurposes = [
    { value: 'BUSINESS', label: '업무' },
    { value: 'PERSONAL', label: '개인' },
    { value: 'MAINTENANCE', label: '정비' },
    { value: 'OTHER', label: '기타' },
  ];
  
  const roomPurposes = [
    { value: 'MEETING', label: '회의' },
    { value: 'WORKSHOP', label: '워크샵' },
    { value: 'TRAINING', label: '교육' },
    { value: 'OTHER', label: '기타' },
  ];

  // 토큰이 없을 경우 로그인 페이지로 이동
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('로그인이 필요합니다.');
      navigate('/login');  // 로그인 페이지로 리다이렉트
    }
  }, [navigate]);

  // 차량 및 회의실 목록 불러오기
  useEffect(() => {
    const fetchResources = async () => {
      if (inputValues.isReservation && inputValues.reservationType === 'car') {
        try {
          const response = await axios.get('http://localhost:8084/cars/available');
          setCarList(response.data);
        } catch (error) {
          alert("차량 정보를 가져오는 데 실패했습니다.");
        }
      } else if (inputValues.isReservation && inputValues.reservationType === 'room') {
        try {
          const response = await axios.get('http://localhost:8084/rooms/available');
          setRoomList(response.data);
        } catch (error) {
          alert("회의실 정보를 가져오는 데 실패했습니다.");
        }
      }
    };

    fetchResources();
  }, [inputValues.isReservation, inputValues.reservationType]);

  // 이벤트 정보로 기본값 설정
  useEffect(() => {
    if (eventDetails && isOpen) {
      setInputValues({
        title: eventDetails.title || '',
        start: eventDetails.startTime || '',
        end: eventDetails.endTime || '',
        content: eventDetails.content || '',
        isReservation: eventDetails.carBookId || eventDetails.roomBookId ? true : false,
        reservationType: eventDetails.carBookId ? 'car' : eventDetails.roomBookId ? 'room' : '',
        purpose: eventDetails.purpose || '',
        selectedOption: eventDetails.carBookId ? eventDetails.carId : eventDetails.roomBookId ? eventDetails.roomId : '',  // 원본 예약 정보로 설정
      });
    }
  }, [isOpen, eventDetails]);

  // 선택된 예약 정보를 불러오는 로직
  useEffect(() => {
    const fetchReservationDetails = async () => {
      if (eventDetails?.carBookId) {
        try {
          const response = await axios.get(`http://localhost:8084/car-books/${eventDetails.carBookId}`);
          if (response?.data?.data) {
            setInputValues((prevValues) => ({
              ...prevValues,
              purpose: response.data.data.purpose || '',
              selectedOption: response.data.data.carId || '',
            }));
          }
        } catch (error) {
          alert("차량 예약 정보를 가져오는 데 실패했습니다.");
        }
      } else if (eventDetails?.roomBookId) {
        try {
          const response = await axios.get(`http://localhost:8084/room-books/${eventDetails.roomBookId}`);
          if (response?.data?.data) {
            setInputValues((prevValues) => ({
              ...prevValues,
              purpose: response.data.data.purpose || '',
              selectedOption: response.data.data.roomId || '',
            }));
          }
        } catch (error) {
          alert("회의실 예약 정보를 가져오는 데 실패했습니다.");
        }
      }
    };

    if (eventDetails?.carBookId || eventDetails?.roomBookId) {
      fetchReservationDetails();
    }
  }, [eventDetails?.carBookId, eventDetails?.roomBookId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setInputValues((prevValues) => {
      const updatedValues = { ...prevValues, [name]: value };

      if (name === 'end' && updatedValues.start && new Date(updatedValues.end) < new Date(updatedValues.start)) {
        updatedValues.start = '';
      }

      if (name === 'start' && updatedValues.end && new Date(updatedValues.start) > new Date(updatedValues.end)) {
        updatedValues.end = '';
      }

      return updatedValues;
    });
  };

  const handleSubmit = () => {
    onSubmit({
      ...inputValues,
      id: inputValues.selectedOption  
    });
  };

  return (
    <Modal open={isOpen} onClose={onCancel}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        bgcolor: 'background.default',
        borderRadius: '5px',
        width: 600,
        boxShadow: 24,
        p: 4
      }}>
        <Typography variant="h3" component="h2">일정 수정</Typography>

        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          label="제목"
          name="title"
          value={inputValues.title}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          label="시작 시간"
          name="start"
          type="datetime-local"
          InputLabelProps={{
            shrink: true,
          }}
          value={inputValues.start}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          label="종료 시간"
          name="end"
          type="datetime-local"
          InputLabelProps={{
            shrink: true,
          }}
          value={inputValues.end}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          variant="outlined"
          margin="normal"
          label="설명"
          name="content"
          value={inputValues.content}
          onChange={handleChange}
        />

        {inputValues.isReservation && (
          <>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>{inputValues.reservationType === 'car' ? '차량 선택' : '회의실 선택'}</InputLabel>
              <Select
                name="selectedOption"
                value={
                  inputValues.selectedOption && (
                    inputValues.reservationType === 'car'
                      ? carList.some(car => car.carId === inputValues.selectedOption)
                      : roomList.some(room => room.roomId === inputValues.selectedOption)
                  ) ? inputValues.selectedOption : '' 
                } 
                onChange={handleChange}
              >
                {inputValues.reservationType === 'car' ? (
                  Array.isArray(carList) && carList.length > 0 ? (
                    carList.map(car => (
                      <MenuItem key={car.carId} value={car.carId}>
                        [{car.number}] {car.name}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>차량 정보가 없습니다.</MenuItem>
                  )
                ) : (
                  Array.isArray(roomList) && roomList.length > 0 ? (
                    roomList.map(room => (
                      <MenuItem key={room.roomId} value={room.roomId}>
                        {room.name} (최대 {room.maxCapacity}명)
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>회의실 정보가 없습니다.</MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>목적</InputLabel>
              <Select
                name="purpose"
                value={inputValues.purpose || ''}
                onChange={handleChange}
              >
                {inputValues.reservationType === 'car' ? (
                  carPurposes.map(purpose => (
                    <MenuItem key={purpose.value} value={purpose.value}>
                      {purpose.label}
                    </MenuItem>
                  ))
                ) : (
                  roomPurposes.map(purpose => (
                    <MenuItem key={purpose.value} value={purpose.value}>
                      {purpose.label}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </>
        )}

        <Box mt={2}>
          <Button onClick={handleSubmit} variant="contained" color="primary">수정</Button>
          <Button onClick={onCancel} variant="outlined" color="secondary" sx={{ ml: 2 }}>취소</Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UpdateModal;
