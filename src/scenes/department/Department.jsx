import React, { useState } from "react";
import { Box, Button, TextField, Typography, Snackbar, Alert, Stack, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";

const Department = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  // 상태 관리
  const [departmentName, setDepartmentName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // 재차 확인을 위한 Dialog 상태 관리

  //   함수
  const handleCreateDepartment = async () => {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await axios.post(
        "http://localhost:8081/departments",
        { name: departmentName },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      setSuccessMessage("부서가 성공적으로 생성되었습니다.");
      setDepartmentName(""); // 입력 필드 초기화
    } catch (error) {
      setErrorMessage("부서 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
      setOpenConfirmDialog(false); // Dialog 닫기
    }
  };

  // 부서 생성 재차 확인 핸들러
  const handleOpenConfirmDialog = () => {
    if (!departmentName) {
      setErrorMessage("부서 이름을 입력하세요.");
      return;
    }
    setOpenConfirmDialog(true); // 확인 Dialog 열기
  };

  return (
    <Box m="20px" display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Box
        sx={{
          width: "100%",
          maxWidth: "500px",
          backgroundColor: colors.primary[400],
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb="20px" color={colors.gray[100]} align="center">
          부서 생성
        </Typography>

        <TextField
          label="부서 이름"
          variant="outlined"
          fullWidth
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
          sx={{ mb: 3 }}
          disabled={loading}
        />

        <Stack direction="row" justifyContent="center" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenConfirmDialog} // Dialog를 열기 위한 버튼
            disabled={loading}
            sx={{
              minWidth: "150px",
              backgroundColor: colors.blueAccent[600],
              "&:hover": {
                backgroundColor: colors.blueAccent[700],
              },
            }}
          >
            {loading ? "생성 중..." : "부서 생성"}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate("/")}
            sx={{ minWidth: "150px" }}
          >
            취소
          </Button>
        </Stack>

        {/* 확인을 위한 Dialog */}
        <Dialog
          open={openConfirmDialog}
          onClose={() => setOpenConfirmDialog(false)}
          PaperProps={{
            style: {
              backgroundColor: colors.primary[500],
              color: colors.gray[100],
            },
          }}
        >
          <DialogTitle sx={{ color: colors.gray[100] }}>부서 생성 확인</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: colors.gray[300] }}>
              정말로 "{departmentName}" 부서를 생성하시겠습니까?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCreateDepartment}
              sx={{
                color: colors.gray[100],  // 텍스트를 더 눈에 띄게
                backgroundColor: colors.blueAccent[600], // 버튼 배경색
                "&:hover": {
                  backgroundColor: colors.blueAccent[700], // hover 시 더 진한 색
                },
              }}
            >
              확인
            </Button>
            <Button
              onClick={() => setOpenConfirmDialog(false)}
              sx={{
                color: colors.gray[100],  // 텍스트 색상
                backgroundColor: colors.redAccent[600], // 취소 버튼 색상
                "&:hover": {
                  backgroundColor: colors.redAccent[700], // hover 시 더 진한 색
                },
              }}
            >
              취소
            </Button>
          </DialogActions>
        </Dialog>

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
    </Box>
  );
};

export default Department;
