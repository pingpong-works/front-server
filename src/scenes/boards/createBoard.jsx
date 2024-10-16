import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  IconButton,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Header } from "../../components";
import { Close } from "@mui/icons-material";
import axios from "axios";
import { tokens } from "../../theme";

const CreateBoard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [category, setCategory] = useState("일반");
  const [content, setContent] = useState("");
  const [imagesToUpload, setImagesToUpload] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [userInfo, setUserInfo] = useState(null); // 유저 정보 상태 추가

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      alert('로그인이 필요합니다.');
      navigate('/login'); // 로그인 페이지로 리다이렉트
    } else {
      fetchUserInfo(accessToken); // 사용자 정보 가져오기
    }
  }, [navigate]);

  const fetchUserInfo = async (token) => {
    try {
      const response = await axios.get("http://localhost:8081/employees/my-info", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserInfo(response.data.data); // 유저 정보 저장
      setUsername(response.data.data.email); // 사용자 이메일 설정

      if (response.data.data.email === "admin@pingpong-works.com") {
        setCategory("공지");
      }
    } catch (error) {
      alert("사용자 정보를 가져오는 데 실패했습니다.");
    }
  };

  const allowedFileTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "image/svg+xml",
  ];

  const maxFileSize = 100 * 1024 * 1024;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      if (file.size > maxFileSize) {
        alert(`10MB를 초과하여 업로드할 수 없습니다.`);
        return false;
      }
      if (!allowedFileTypes.includes(file.type)) {
        alert(`허용되지 않는 파일 형식입니다.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      return;
    }

    const newImagePreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImagesToUpload((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newImagePreviews]);

    e.target.value = null;
  };

  const handleImageRemove = (index) => {
    const updatedImages = imagesToUpload.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setImagesToUpload(updatedImages);
    setImagePreviews(updatedPreviews);
  };

  const handleSubmit = async () => {
    if (!userInfo) return; // 유저 정보가 없으면 실행하지 않음

    try {
      if ((category === "공지" || category === "식단") && username !== "admin@pingpong-works.com") {
        alert("공지와 식단 카테고리는 관리자만 작성할 수 있습니다.");
        return;
      }

      if (!title) {
        alert("제목을 입력해주세요.");
        return;
      }
  
      if (!content) {
        alert("내용을 입력해주세요.");
        return;
      }
  
      if (!category) {
        alert("카테고리를 선택해주세요.");
        return;
      }

      const uploadedImageUrls = [];
      for (const file of imagesToUpload) {
        const formData = new FormData();
        formData.append("multipartFile", file);
        const response = await axios.post("http://localhost:8084/images", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        uploadedImageUrls.push(response.data);
      }

      const postData = {
        title,
        category,
        content,
        imageUrls: uploadedImageUrls,
      };

      const response = await axios.post("http://localhost:8084/boards", postData, {
        params: {
          employeeId: userInfo.employeeId, // 동적으로 employeeId 사용
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 201) {
        alert("게시글이 성공적으로 작성되었습니다.");
        navigate("/boards");
      }
    } catch (error) {
      alert("게시글 작성에 실패했습니다.");
    }
  };

  return (
    <Box m="20px">
      <Header title="게시판 작성" />

      <Box
        mt="20px"
        display="flex"
        flexDirection="column"
        gap={2}
        maxWidth="100%"
        bgcolor={colors.primary[400]}
        p={3}
        borderRadius="8px"
      >
        <TextField
          label="제목"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          InputLabelProps={{ style: { color: colors.gray[100] } }}
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
          }}
        />

        <Select
          label="카테고리"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          fullWidth
          sx={{
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
          {username === "admin@pingpong-works.com"
            ? [
                <MenuItem key="공지" value="공지">
                  공지
                </MenuItem>,
                <MenuItem key="식단" value="식단">
                  식단
                </MenuItem>,
                <MenuItem key="일반" value="일반">
                  일반
                </MenuItem>,
                <MenuItem key="질문" value="질문">
                  질문
                </MenuItem>,
              ]
            : [
                <MenuItem key="일반" value="일반">
                  일반
                </MenuItem>,
                <MenuItem key="질문" value="질문">
                  질문
                </MenuItem>,
              ]}
        </Select>

        <TextField
          label="내용"
          variant="outlined"
          multiline
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          fullWidth
          InputLabelProps={{ style: { color: colors.gray[100] } }}
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
          }}
        />

        <Button
          variant="outlined"
          component="label"
          sx={{
            color: colors.gray[100],
            borderColor: colors.gray[300],
            "&:hover": {
              borderColor: colors.greenAccent[500],
            },
          }}
        >
          이미지 업로드
          <input
            type="file"
            multiple
            hidden
            onChange={handleImageUpload}
            accept={allowedFileTypes.join(",")}
          />
        </Button>

        <Box
          display="flex"
          flexWrap="wrap"
          gap={2}
          mt={2}
          maxWidth="100%"
          justifyContent="center"
        >
          {imagePreviews.map((preview, index) => (
            <Box
              key={index}
              position="relative"
              display="flex"
              justifyContent="center"
              alignItems="center"
              width="200px"
              height="200px"
              bgcolor={colors.primary[400]}
              border={`1px solid ${colors.gray[300]}`}
            >
              <IconButton
                onClick={() => handleImageRemove(index)}
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
              <img
                src={preview}
                alt="미리보기"
                style={{ maxWidth: "100%", maxHeight: "100%" }}
              />
            </Box>
          ))}
        </Box>

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button
            variant="outlined"
            onClick={() => navigate("/boards")}
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
            작성하기
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CreateBoard;
