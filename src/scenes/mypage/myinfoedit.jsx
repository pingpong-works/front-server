import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Typography, useTheme, Grid } from "@mui/material";
import axios from "axios";
import { tokens } from "../../theme";

const MyInfoEdit = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [userInfo, setUserInfo] = useState({
    name: "",
    phoneNumber: "",
    extensionNumber: "",
    emergencyNumber: "",
    address: "",
    vehicleNumber: "",
  });

  const [loading, setLoading] = useState(true);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get("http://localhost:8081/employees/my-info", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        const { name, phoneNumber, extensionNumber, emergencyNumber, address, vehicleNumber } = response.data.data;
        setUserInfo({ name, phoneNumber, extensionNumber, emergencyNumber, address, vehicleNumber });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();
  }, []);

  // 사용자 정보 수정 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await axios.patch("http://localhost:8081/employees", userInfo, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      alert("정보가 성공적으로 수정되었습니다.");
    } catch (error) {
      console.error("Error updating user info:", error);
      alert("정보 수정에 실패했습니다.");
    }
  };

  return (
    <Box m="20px">
      <Typography variant="h2" fontWeight="bold" mb="20px" color={colors.gray[100]}>
        내 정보 수정
      </Typography>
      {!loading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "70%",
            backgroundColor: colors.primary[400],
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* 이름 수정 */}
          <TextField
            label="이름"
            name="name"
            value={userInfo.name}
            onChange={handleInputChange}
            fullWidth
          />

          {/* 연락 정보 */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="휴대폰 번호"
                name="phoneNumber"
                value={userInfo.phoneNumber}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="내선 번호"
                name="extensionNumber"
                value={userInfo.extensionNumber}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="비상 연락처"
                name="emergencyNumber"
                value={userInfo.emergencyNumber}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="차량 번호"
                name="vehicleNumber"
                value={userInfo.vehicleNumber}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
          </Grid>

          {/* 추가 정보 */}
          <TextField
            label="주소"
            name="address"
            value={userInfo.address}
            onChange={handleInputChange}
            fullWidth
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{
              backgroundColor: colors.blueAccent[600],
              "&:hover": {
                backgroundColor: colors.blueAccent[700],
              },
              mt: "20px",
            }}
          >
            정보 수정
          </Button>
        </Box>
      ) : (
        <Typography>Loading...</Typography>
      )}
    </Box>
  );
};

export default MyInfoEdit;
