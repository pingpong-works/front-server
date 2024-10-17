import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Modal, Typography, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import axios from 'axios';
import { tokens } from '../../../theme';
import { useTheme } from '@mui/material/styles';

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

const UpdateCarModal = ({ isOpen, carId, onClose, onUpdateSuccess }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [carDetails, setCarDetails] = useState({
    name: '',
    number: '',
    fuel: 'DIESEL',
    available: true,
    images: {
      url: '',
      description: ''
    }
  });

  const [imageToUpload, setImageToUpload] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 폼 유효성 검사: 필수 항목 (차량명과 번호)
  const isFormValid = carDetails.name && carDetails.number;

  // 차량 상세 정보 가져오기
  const fetchCarDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8084/cars/${carId}`);
      const carData = response.data.data;
      setCarDetails({
        ...carData,
        images: carData.images || { url: '', description: '' }  // images가 없을 경우 초기화
      });
      setImagePreview(carData.images?.url || '');  // 기존 이미지 미리보기 설정
    } catch (error) {
      setErrorMessage('차량 정보를 불러오는 중 문제가 발생했습니다.');
    }
  };

  useEffect(() => {
    if (carId && isOpen) {
      fetchCarDetails(); // 모달이 열릴 때마다 데이터를 불러옴
    } else {
      setCarDetails({
        name: '',
        number: '',
        fuel: 'DIESEL',
        available: true,
        images: {
          url: '',
          description: ''
        }
      });
      setImagePreview('');  // 이미지 미리보기 초기화
    }
  }, [carId, isOpen]);

  // 입력 필드 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCarDetails((prev) => ({ ...prev, [name]: value }));
  };

  // 이미지 업로드 처리
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageToUpload(file);
      setImagePreview(URL.createObjectURL(file));
    }
    e.target.value = null;  // 파일 선택 초기화
  };

  // 이미지 삭제 처리
  const handleImageRemove = () => {
    setImageToUpload(null);
    setImagePreview('');  // 미리보기 제거
    setCarDetails((prev) => ({
      ...prev,
      images: { url: '', description: '' }
    }));  // 기존 이미지 URL과 설명 제거
  };

  // 제출 처리
  const handleSubmit = async () => {
    try {
      // 로컬스토리지에서 토큰 가져오기
      const token = localStorage.getItem("accessToken");

      if (!carDetails.name) {
        alert("차량 이름을 입력해주세요.");
        return;
      }

      if (!carDetails.number) {
        alert("차량 번호를 입력해주세요.");
        return;
      }

      if (!carDetails.fuel) {
        alert("연료를 선택해주세요."); return;

      }
  
      // 토큰 디코드 및 employeeId 추출
      const decodedToken = parseJwt(token);
  
      const employeeId = decodedToken.employeeId;

      let imageUrl = carDetails.images.url;

      // 이미지가 업로드되었다면 서버에 업로드 후 URL을 저장
      if (imageToUpload) {
        const formData = new FormData();
        formData.append("multipartFile", imageToUpload);

        const response = await axios.post("http://localhost:8084/images", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data) {
          imageUrl = response.data;  // 업로드된 이미지 URL
        }
      }

      // 차량 수정 요청
      const updatedCarDetails = {
        ...carDetails,
        images: { ...carDetails.images, url: imageUrl },  // 이미지 URL 반영
      };

      await axios.patch(
        `http://localhost:8084/cars/${carId}?employeeId=${employeeId}`,
        updatedCarDetails
      );
      onUpdateSuccess();  // 성공 후 상위 컴포넌트에서 처리
      alert("차량이 성공적으로 수정되었습니다.");
      onClose();  // 모달 닫기
    } catch (error) {
      setErrorMessage('차량 수정 중 문제가 발생했습니다.');
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
          차량 수정
        </Typography>

        <TextField
          fullWidth
          label="차량명"
          name="name"
          value={carDetails.name}
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
          label="차량 번호"
          name="number"
          value={carDetails.number}
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
          <InputLabel>연료 타입</InputLabel>
          <Select
            name="fuel"
            value={carDetails.fuel}
            onChange={handleChange}
            label="연료 타입"
            sx={{
              color: colors.gray[100],
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: colors.gray[300] },
                "&:hover fieldset": { borderColor: colors.greenAccent[500] },
                "&.Mui-focused fieldset": { borderColor: colors.greenAccent[500] },
              },
            }}
          >
            <MenuItem value="DIESEL">경유</MenuItem>
            <MenuItem value="GASOLINE">휘발유</MenuItem>
            <MenuItem value="ELECTRIC">전기</MenuItem>
          </Select>
        </FormControl>

        {/* 이미지 업로드 및 미리보기 */}
        <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
          이미지 업로드
          <input type="file" hidden onChange={handleImageUpload} />
        </Button>

        {imagePreview && (
          <Box mb={2} display="flex" justifyContent="center" position="relative">
            <img src={imagePreview} alt="미리보기" style={{ maxWidth: "100%" }} />
            <IconButton
              onClick={handleImageRemove}
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                color: colors.gray[100],
                backgroundColor: colors.redAccent[500],
              }}
            >
              <Close />
            </IconButton>
          </Box>
        )}

        {/* 이미지 설명 필드: 이미지가 있을 때만 보여줌 */}
        {imagePreview && (
          <TextField
            fullWidth
            label="이미지 설명"
            name="imageDescription"
            value={carDetails.images.description}
            onChange={(e) => setCarDetails((prev) => ({
              ...prev,
              images: { ...prev.images, description: e.target.value }
            }))}
            sx={{ mb: 2 }}
          />
        )}

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

export default UpdateCarModal;
