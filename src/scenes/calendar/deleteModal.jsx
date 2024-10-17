import React, {useEffect} from 'react';
import {Box, Button, Modal, Typography} from "@mui/material";
import { useNavigate } from "react-router-dom";

const DeleteModal = ({ isOpen, onCancel, onSubmit, title}) => {
    
    const navigate = useNavigate();
    
    useEffect(() => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
          alert('로그인이 필요합니다.');
          navigate('/login');  // 로그인 페이지로 리다이렉트
      }
    }, [navigate]);

    
    return (
        <Modal open={isOpen} onClose={onCancel}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -100%)',
                bgcolor: 'background.default',
                borderRadius: '5px',
                width: 400,
                boxShadow: 24,
                p: 4
            }}>
                <Typography variant="h3" component="h2">
                    {title}
                </Typography>
                <Box mt={2}>
                    <Button onClick={onSubmit} variant="contained" color="primary">확인</Button>
                    <Button onClick={onCancel} variant="outlined" color="secondary" sx={{ ml: 2 }}>취소</Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default DeleteModal;