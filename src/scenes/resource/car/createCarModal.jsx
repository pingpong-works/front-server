import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  IconButton,
  Select,
  MenuItem,
  useTheme,
  Modal,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import axios from "axios";
import { tokens } from "../../../theme";
import { useNavigate } from "react-router-dom";

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
    console.error("토큰 파싱 실패", error);
    return null;
  }
};

const createCarModal = ({ open, onClose, onCarAdded }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [carName, setCarName] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [fuelType, setFuelType] = useState("DIESEL");
  const [imageToUpload, setImageToUpload] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [description, setDescription] = useState("");

  const allowedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "image/svg+xml",
  ];
  const maxFileSize = 100 * 1024 * 1024; // 100MB

  // 이미지 업로드 처리
  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file.size > maxFileSize) {
      alert("10MB를 초과하여 업로드할 수 없습니다.");
      return;
    }

    if (!allowedFileTypes.includes(file.type)) {
      alert("허용되지 않는 파일 형식입니다.");
      return;
    }

    setImageToUpload(file);
    setImagePreview(URL.createObjectURL(file));

    e.target.value = null;
  };

  // 이미지 및 설명 제거
  const handleImageRemove = () => {
    setImageToUpload(null);
    setImagePreview(null);
    setDescription("");
  };

  // 모달이 닫힐 때 값 초기화
  const handleClose = () => {
    setCarName("");
    setCarNumber("");
    setFuelType("DIESEL");
    setImageToUpload(null);
    setImagePreview(null);
    setDescription("");
    onClose();
  };

  // POST 요청 처리
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        alert("로그인된 사용자가 아닙니다. 토큰을 찾을 수 없습니다.");
        return;
      }

      const decodedToken = parseJwt(token);

      if (!decodedToken || !decodedToken.employeeId) {
        alert("유효하지 않은 토큰입니다.");
        return;
      }

      const employeeId = decodedToken.employeeId; // 토큰에서 employeeId 추출

      // 이미지 업로드 후 URL을 저장할 객체
      const uploadedImage = {
        url: "",
        description: description,
      };

      if (imageToUpload) {
        const formData = new FormData();
        formData.append("multipartFile", imageToUpload);
        const response = await axios.post("http://localhost:8084/images", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // 서버로부터 URL을 받아오지 못했다면, 오류 발생 가능
        if (!response.data || typeof response.data !== "string") {
          console.error("이미지 업로드 실패:", response);
          alert("이미지 업로드 중 문제가 발생했습니다.");
          return;
        }

        uploadedImage.url = response.data;
      }

      // POST 요청에 보낼 데이터 구성
      const carData = {
        name: carName || "Unknown",  // 이름이 비어 있을 경우 기본값 설정
        number: carNumber || "Unknown",  // 번호가 비어 있을 경우 기본값 설정
        fuel: fuelType, // 영문으로 서버에 전송
        images: uploadedImage, // Map<String, String> 형식으로 전송
      };

      console.log("전송할 데이터:", carData);

      // 차량 등록 요청 전송
      const response = await axios.post(`http://localhost:8084/cars?employeeId=${employeeId}`, carData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        alert("차량이 성공적으로 등록되었습니다.");
        onCarAdded();
        handleClose(); 
        navigate("/car");
      } else {
        console.error("응답 상태 코드:", response.status);
        alert("차량 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("차량 등록 실패", error);
      alert("차량 등록에 실패했습니다.");
    }
  };

  // 연료 타입 한글 변환
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
          차량 등록
        </Typography>

        <TextField
          label="차량명"
          variant="outlined"
          fullWidth
          value={carName}
          onChange={(e) => setCarName(e.target.value)}
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
          label="차량 번호"
          variant="outlined"
          fullWidth
          value={carNumber}
          onChange={(e) => setCarNumber(e.target.value)}
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

        <Select
          label="연료 타입"
          fullWidth
          value={fuelType}
          onChange={(e) => setFuelType(e.target.value)}
          sx={{
            mb: 2,
            color: colors.gray[100],
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
          }}
        >
          <MenuItem value="DIESEL">{fuelTypeToKorean("DIESEL")}</MenuItem>
          <MenuItem value="GASOLINE">{fuelTypeToKorean("GASOLINE")}</MenuItem>
          <MenuItem value="ELECTRIC">{fuelTypeToKorean("ELECTRIC")}</MenuItem>
        </Select>

        {/* 이미지 업로드 버튼을 한 장 업로드 시 비활성화 */}
        <Button
          variant="outlined"
          component="label"
          fullWidth
          disabled={imageToUpload !== null} // 이미 이미지가 있으면 비활성화
          sx={{
            mb: 2,
            color: colors.gray[100],
            borderColor: colors.gray[300],
            "&:hover": {
              borderColor: colors.greenAccent[500],
            },
          }}
        >
          이미지 업로드
          <input type="file" hidden onChange={handleImageUpload} />
        </Button>

        {imagePreview && (
          <Box display="flex" flexWrap="wrap" gap={2} mb={2}>
            <Box
              sx={{
                position: "relative",
                width: "100%", 
                height: "100%", 
                bgcolor: colors.primary[400],
                border: `1px solid ${colors.gray[300]}`,
                display: "flex",
                flexDirection: "column", 
              }}
            >
              <img
                src={imagePreview} 
                alt="미리보기"
                style={{ width: "100%", height: "150px", objectFit: "contain" }}
              />
              <IconButton
                onClick={() => handleImageRemove(0)} 
                sx={{
                  position: "absolute",
                  top: "5px",
                  right: "5px",
                  color: colors.gray[100],
                  backgroundColor: colors.redAccent[500],
                  borderRadius: "50%",
                }}
              >
                <Close />
              </IconButton>
              <TextField
                label="이미지 설명"
                variant="outlined"
                fullWidth
                value={description || ""} 
                onChange={(e) => setDescription(e.target.value)} 
                sx={{
                  mt: 1,
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
            </Box>
          </Box>
        )}

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
    </Modal>
  );
};

export default createCarModal;
