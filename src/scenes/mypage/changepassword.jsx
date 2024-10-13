import React, { useState } from "react";
import { Box, Typography, Grid, Paper, Button, TextField, Snackbar, Alert, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
  
    setIsLoading(true);
    try {
      await axios.patch("http://localhost:8081/employees/password", {
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmNewPassword: confirmNewPassword,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
  
      setSuccessMessage("비밀번호가 성공적으로 변경되었습니다.");
      
      // 2초 후 마이페이지로 이동
      setTimeout(() => {
        navigate("/mypage"); // 성공 후 마이 페이지로 이동
      }, 2000);
    } catch (error) {
      console.error("비밀번호 변경 오류:", error.response?.data || error);
      setErrorMessage("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box m="20px">
      <Typography variant="h4" gutterBottom>
        비밀번호 변경
      </Typography>
      <Box 
        component={Paper} 
        p={4} 
        mt={4} 
        elevation={3} 
        sx={{ maxWidth: '500px', margin: '0 auto', backgroundColor: '#1c1c1e' }} // 카드 중앙 정렬 및 배경색 조정
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              label="현재 비밀번호"
              type="password"
              fullWidth
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="새 비밀번호"
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="새 비밀번호 확인"
              type="password"
              fullWidth
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              variant="outlined"
            />
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="center" spacing={2} mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleChangePassword}
            disabled={isLoading}
            sx={{ minWidth: '150px' }}
          >
            {isLoading ? "변경 중..." : "비밀번호 변경"}
          </Button>
          <Button
            variant="contained" // 동일한 variant
            color="secondary" // 색상만 다르게 설정
            onClick={() => navigate("/mypage")}
            sx={{ minWidth: '150px' }}
          >
            취소
          </Button>
        </Stack>
      </Box>

      {/* 성공 및 오류 메시지 */}
      <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={() => setErrorMessage("")}>
        <Alert onClose={() => setErrorMessage("")} severity="error" sx={{ width: "100%" }}>
          {errorMessage}
        </Alert>
      </Snackbar>
      <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => setSuccessMessage("")}>
        <Alert onClose={() => setSuccessMessage("")} severity="success" sx={{ width: "100%" }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChangePassword;
