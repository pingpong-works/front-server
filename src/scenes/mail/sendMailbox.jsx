import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Typography,
    Checkbox,
    IconButton,
    Button,
    CircularProgress,
    TextField,  // 검색어 입력 필드를 위한 추가
    useTheme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import { tokens } from '../../theme';
import { useNavigate } from 'react-router-dom';

const Send = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();
    const [sentMails, setSentMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [search, setSearch] = useState('');  // 검색어 상태 추가

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
            alert('로그인이 필요합니다.');
            navigate('/login');  // 로그인 페이지로 리다이렉트
        }
    }, [navigate]);

    // 메일 데이터 가져오는 함수
    const fetchSentMails = async (searchQuery = '') => {
        try {
            const response = await axios.get(`http://localhost:8083/mail/sent?page=${page}&size=10&sort=sentAt,DESC&search=${searchQuery}`);
            setSentMails(response.data.data);
            setTotalPages(response.data.pageInfo.totalPages);
            setTotalElements(response.data.pageInfo.totalElements);
            setLoading(false);
        } catch (error) {
            console.error('보낸 메일함 조회 중 오류 발생: ', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSentMails(search);  // 검색어가 변경될 때마다 메일 데이터를 필터링
    }, [page, search]);

    const handleDelete = async (mailId) => {
        try {
            await axios.delete(`http://localhost:8083/mail/${mailId}?isReceivedMail=false`);
            // 삭제된 메일을 제외한 나머지 메일들로 상태값 업데이트
            setSentMails(sentMails.filter(mail => mail.mailId !== mailId));
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
            <Typography
                variant="h2"
                sx={{
                    fontWeight: "bold",
                    color: colors.primary[100],
                    marginBottom: "20px",
                }}
            >
                보낸 메일함
            </Typography>
            <Typography variant="h4" sx={{ ml: "5px", mb: "20px" }}>
                총 {totalElements} 개
            </Typography>

            {/* 검색 입력 필드 추가 */}
            <Box display="flex" mb={2}>
                <TextField
                    label="검색"
                    variant="outlined"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}  // 검색어 상태 업데이트
                    sx={{ width: "300px", marginRight: "10px" }}
                />
                <Button
                    variant="contained"
                    onClick={() => fetchSentMails(search)}  // 검색 버튼 클릭 시 호출
                >
                    검색
                </Button>
            </Box>

            <Box display="flex" flexDirection="column">
                {sentMails.map((mail, index) => (
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
                        <Typography variant="h6" noWrap>{mail.recipientName || mail.recipientEmail}</Typography>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            noWrap
                            sx={{
                                cursor: 'pointer',
                                fontWeight: mail.isRead ? 'normal' : 'bold',  // 읽었으면 'normal', 읽지 않았으면 'bold'
                                color: mail.isRead ? 'gray' : 'black',  // 읽었으면 회색, 읽지 않았으면 검정색
                            }}
                            onClick={() => navigate(`/read/1/${mail.mailId}`)}
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

export default Send;
