import React from 'react';
import { Box, Button, Modal, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../../theme';

const DeleteConfirmModal = ({ isOpen, onClose, onDeleteConfirm }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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
          color: colors.gray[100],
        }}
      >
        <Typography variant="h6" mb={2} sx={{ color: colors.gray[100] }}>
          차량 삭제 확인
        </Typography>
        <Typography mb={4} sx={{ color: colors.gray[100] }}>
          차량을 삭제하시겠습니까?
        </Typography>
        <Box display="flex" justifyContent="flex-end">
          <Button onClick={onClose} sx={{ mr: 2, color: colors.gray[100], borderColor: colors.gray[300] }}>
            취소
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onDeleteConfirm}
            sx={{
              backgroundColor: colors.redAccent[500],
              '&:hover': {
                backgroundColor: colors.redAccent[700],
              },
            }}
          >
            삭제
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteConfirmModal;
