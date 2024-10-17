import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  IconButton,
  useTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "../../components";
import { Close } from "@mui/icons-material";
import axios from "axios";
import { tokens } from "../../theme";

const UpdateBoard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const location = useLocation();

  const { boardId } = location.state;

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [imagesToUpload, setImagesToUpload] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);


  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert('로그인이 필요합니다.');
        navigate('/login');  // 로그인 페이지로 리다이렉트
    }
  }, [navigate]);


  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert('로그인이 필요합니다.');
        navigate('/login');  // 로그인 페이지로 리다이렉트
    }
  }, [navigate]);
  
  // 게시글 데이터 가져오기
  useEffect(() => {
    const fetchBoardData = async () => {
      try {
        const response = await axios.get(`http://localhost:8084/boards/${boardId}`);
        const boardData = response.data.data;

        setTitle(boardData.title);
        setCategory(boardData.category);
        setContent(boardData.content);
        setOriginalImages(boardData.imageUrls || []);
        setImagePreviews(boardData.imageUrls || []);
      } catch (error) {
        console.error("게시글 정보를 불러오는데 실패했습니다", error);
        alert("게시글 정보를 불러오는데 실패했습니다.");
      }
    };

    if (boardId) {
      fetchBoardData();
    }
  }, [boardId]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImagePreviews = files.map((file) => URL.createObjectURL(file));
    setImagesToUpload((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newImagePreviews]);

    e.target.value = null;
  };

  const handleImageRemove = (index) => {
    const imageUrl = originalImages[index];

    if (typeof imageUrl === "string") {
      setImagesToDelete((prev) => [...prev, imageUrl]);
    }

    setOriginalImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
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

      const updatedData = {
        title,
        category,
        content,
        imageUrls: [...uploadedImageUrls],
        imagesToDelete: [...imagesToDelete],
      };

      const response = await axios.patch(`http://localhost:8084/boards/${boardId}`, updatedData, {
        params: {
          employeeId: 1,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        alert("게시글이 성공적으로 수정되었습니다.");

        for (const imageUrl of imagesToDelete) {
          await axios.delete(`http://localhost:8084/images?imageUrl=${imageUrl}`);
        }

        navigate(`/viewBoard/${boardId}`);
      }
    } catch (error) {
      console.error("게시글 수정 실패", error);
      alert("게시글 수정에 실패했습니다.");
    }
  };

  return (
    <Box m="20px">
      <Header title="Boards" subtitle="Board Update" />
  
      <Box mt="20px" display="flex" flexDirection="column" gap={2} maxWidth="100%" bgcolor={colors.primary[400]} p={3} borderRadius="8px">
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
  
        <TextField
          label="카테고리"
          variant="outlined"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
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
          <input type="file" multiple hidden onChange={handleImageUpload} />
        </Button>
  
        <Box display="flex" flexWrap="wrap" gap={2} mt={2} maxWidth="100%" justifyContent="center">
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
            onClick={() => navigate(`/viewBoard/${boardId}`)}
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
            수정하기
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UpdateBoard;