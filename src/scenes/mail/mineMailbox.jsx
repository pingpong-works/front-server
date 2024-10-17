// SelfMail.jsx

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
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import { tokens } from '../../theme';
import { useNavigate } from 'react-router-dom';

const SelfMail = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const [selfMails, setSelfMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        const employeeId = localStorage.getItem('employeeId');
        if (!accessToken) {
            alert('로그인이 필요합니다.');
            navigate('/login');  // 로그인 페이지로 리다이렉트
        }

        const fetchSelfMails = async () => {
            try {
                const response = await axios.get(`http://localhost:8083/mail/self?page=${page}&size=10&employeeId=${employeeId}`);
                setSelfMails(response.data.data);
                setTotalPages(response.data.pageInfo.totalPages);
                setTotalElements(response.data.pageInfo.totalElements);
                setLoading(false);
            } catch (error) {
                console.error('내게 쓴 메일 조회 중 오류 발생: ', error);
                setLoading(false);
            }
        };

        fetchSelfMails();
    }, [page, navigate]);

    const handleDelete = async (mailId) => {
        try {
            await axios.delete(`http://localhost:8083/mail/${mailId}?isReceivedMail=false`);
            setSelfMails(selfMails.filter(mail => mail.mailId !== mailId));
            setTotalElements(prevTotal => prevTotal - 1); // 총 메일 수 감소
        } catch (error) {
            console.error('메일 삭제 중 오류 발생: ', error);
        }
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
            <Typography variant="h2" sx={{ fontWeight: 'bold', color: colors.primary[100], marginBottom: '20px' }}>
                내게 쓴 메일함
            </Typography>
            <Typography variant="h4" sx={{ ml: '5px', mb: '20px' }}>
                총 {totalElements} 개
            </Typography>
            <Box display="flex" flexDirection="column">
                {selfMails.map((mail, index) => (
                    <Box
                        sx={{ bgcolor: colors.gray[450] }}
                        key={mail.mailId}
                        display="grid"
                        gridTemplateColumns="30px 60px 250px auto 250px 30px"
                        alignItems="center"
                        p={1}
                        borderBottom="1px solid #cccccc87"
                    >
                        <Checkbox />
                        <IconButton>
                            {mail.isImportant ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                        <Typography variant="h6" noWrap>
                            {mail.recipientName || mail.recipientEmail}
                        </Typography>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            noWrap
                            sx={{
                                cursor: 'pointer',
                                fontWeight: mail.isRead ? 'normal' : 'bold',
                                color: mail.isRead ? 'gray' : 'black',
                            }}
                            onClick={() => navigate(`/read/3/${mail.mailId}`)} // mailType 3: self mail
                        >
                            {mail.subject}
                        </Typography>
                        <Typography variant="h6" color="textSecondary" textAlign="right">
                            {new Date(mail.sentAt).toLocaleString()}
                        </Typography>
                        <IconButton onClick={() => handleDelete(mail.mailId)}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                ))}
            </Box>
            <Box display="flex" justifyContent="center" mt={3}>
                {[...Array(totalPages)].map((_, index) => (
                    <Button
                        key={index + 1}
                        onClick={() => setPage(index + 1)}
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

export default SelfMail;
