import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Typography,
    CircularProgress,
    IconButton,
    Button,
    useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { tokens } from '../../theme';
import DOMPurify from 'dompurify';  // XSS 방지용 라이브러리

const DetailMail = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const { mailType, mailId } = useParams(); // 단일 mailId 사용
    const navigate = useNavigate();
    const [mailDetail, setMailDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
          alert('로그인이 필요합니다.');
          navigate('/login');  // 로그인 페이지로 리다이렉트
      }
    }, [navigate]);

    useEffect(() => {
        const fetchMailDetail = async () => {
            try {
                let response;

                // mailType에 따라 다른 API 호출
                if (mailType === '1') { // 보낸 메일
                    response = await axios.get(`http://localhost:8083/mail/sent/${mailId}`);
                } else if (mailType === '2') { // 휴지통 메일
                    response = await axios.get(`http://localhost:8083/mail/trash/${mailId}`);
                } else if (mailType === '0') { // 받은 메일
                    response = await axios.get(`http://localhost:8083/mail/received/${mailId}`);
                }

                setMailDetail(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('메일 상세 조회 중 오류 발생: ', error);
                setLoading(false);
            }
        };

        fetchMailDetail();
    }, [mailType, mailId]);

    const renderMailBody = (body) => {
        const cleanBody = DOMPurify.sanitize(body); // XSS 방지를 위해 HTML을 정제
        return { __html: cleanBody };
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!mailDetail) {
        return (
            <Box p={3} textAlign="center">
                <Typography variant="h6" color="error">
                    메일을 불러올 수 없습니다.
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate(-1)}>
                    뒤로 가기
                </Button>
            </Box>
        );
    }

    return (
        <Box display="flex" justifyContent="center">
            <Box
                p={5} sx={{bgcolor : colors.gray[350], borderRadius: "10px", width: "85%"}}>
                <Box display="flex" alignItems="center" mb={5}>
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h2" color="textSecondary" fontWeight="bold">
                        {mailDetail.subject}
                    </Typography>
                </Box>

                <Box mb={5}>
                    <Typography variant="h5" color="textSecondary" mt={3}>
                        <strong>보낸 사람:</strong> {mailDetail.senderName} ({mailDetail.senderEmail})
                    </Typography>
                    <Typography variant="h5" color="textSecondary" mt={3}>
                        <strong>받는 사람:</strong> {mailDetail.recipientName} ({mailDetail.recipientEmail})
                    </Typography>
                    <Typography variant="h5" color="textSecondary" mt={3}>
                        {new Date(
                            mailType === '0' ? mailDetail.receivedAt : mailDetail.sentAt
                        ).toLocaleString()}
                    </Typography>
                </Box>

                <Box p={2} border="1px solid #ccc" borderRadius="5px" bgcolor={colors.primary[400]}>
                    {/* Quill 에디터로 작성된 HTML 콘텐츠를 안전하게 렌더링 */}
                    <Typography
                        variant="h3"
                        dangerouslySetInnerHTML={renderMailBody(mailDetail.body)}  // HTML 콘텐츠 렌더링
                        sx={{ whiteSpace: 'pre-wrap' }} // 줄바꿈 유지
                    />
                </Box>

                <Box display="flex" justifyContent="flex-end"  gap={2} mt={3}>
                    <Button
                        variant="outlined"
                        sx={{bgcolor: colors.gray[200]}}
                        onClick={() => navigate(`/read/${mailType}/${parseInt(mailId) - 1}`)}
                        disabled={parseInt(mailId) <= 1}
                    >
                        이전 메일
                    </Button>
                    <Button
                        variant="outlined"
                        sx = {{bgcolor: colors.gray[200]}}
                        onClick={() => navigate(`/read/${mailType}/${parseInt(mailId) + 1}`)}
                        disabled={parseInt(mailId) >= 617} // 총 메일 개수를 기준으로 설정
                    >
                        다음 메일
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default DetailMail;
