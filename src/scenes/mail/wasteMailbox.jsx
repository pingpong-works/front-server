import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Checkbox,
    IconButton,
    Button,
    CircularProgress,
    useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RestoreIcon from '@mui/icons-material/Restore';
import { tokens } from '../../theme';
import { useNavigate } from 'react-router-dom';

const Waste = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const [trashMails, setTrashMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
          alert('로그인이 필요합니다.');
          navigate('/login');  // 로그인 페이지로 리다이렉트
      }
    }, [navigate]);

    useEffect(() => {
        const fetchTrashMails = async () => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `http://localhost:8083/mail/trash?page=${page}&size=10&sort=deletedAt,DESC`
                );
                setTrashMails(response.data.data);
                setTotalPages(response.data.pageInfo.totalPages);
                setTotalElements(response.data.pageInfo.totalElements);
            } catch (error) {
                console.error('휴지통 메일 조회 중 오류 발생: ', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrashMails();
    }, [page]);

    const handleRestore = async (mailId) => {
        try {
            await axios.put(`http://localhost:8083/mail/trash/restore/${mailId}`);
            setTrashMails(trashMails.filter((mail) => mail.trashMailId !== mailId));
            setTotalElements((prev) => prev - 1);
        } catch (error) {
            console.error('메일 복원 중 오류 발생: ', error);
        }
    };

    const handleDelete = async (mailId) => {
        try {
            await axios.delete(`http://localhost:8083/mail/trash/${mailId}`);
            setTrashMails(trashMails.filter((mail) => mail.trashMailId !== mailId));
            setTotalElements((prev) => prev - 1);
        } catch (error) {
            console.error('메일 삭제 중 오류 발생: ', error);
        }
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h2" mb={2}>휴지통 (총 {totalElements}개)</Typography>
            <Box display="flex" flexDirection="column">
                {totalElements === 0 ? (
                    <Typography variant="h5" textAlign="center" color="textSecondary">
                        휴지통이 비어있습니다.
                    </Typography>
                ) : (
                    trashMails.map((mail, index) => (
                        <Box
                            key={mail.trashMailId}
                            display="grid"
                            gridTemplateColumns="40px 200px auto 150px 40px"
                            alignItems="center"
                            p={2}
                            borderBottom="1px solid #ccc"
                        >
                            <Checkbox />
                            <Typography variant="h4" noWrap>{mail.recipientName || mail.recipientEmail}</Typography>
                            <Typography
                                variant="h4"
                                fontWeight="bold"
                                noWrap
                                sx={{ cursor: 'pointer' }}
                                onClick={() => navigate(`/read/2/${mail.trashMailId}`)}
                            >
                                {mail.subject}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" textAlign="right">
                                {new Date(mail.sentAt).toLocaleString()}
                            </Typography>
                            <Box display="flex" gap={1}>
                                <IconButton onClick={() => handleRestore(mail.trashMailId)}>
                                    <RestoreIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(mail.trashMailId)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Box>
                    ))
                )}
            </Box>

            {/* Pagination */}
            <Box display="flex" justifyContent="center" mt={3}>
                {[...Array(totalPages)].map((_, index) => (
                    <Button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        variant={page === index + 1 ? 'contained' : 'outlined'}
                        sx={{
                            mx: 0.5,
                            backgroundColor: page === index + 1 ? colors.blueAccent[500] : 'transparent',
                            color: page === index + 1 ? '#fff' : 'inherit',
                            '&:hover': {
                                backgroundColor: page === index + 1 ? colors.blueAccent[600] : colors.gray[200],
                            },
                        }}
                    >
                        {index + 1}
                    </Button>
                ))}
            </Box>
        </Box>
    );
};

export default Waste;
