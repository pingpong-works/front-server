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

const Send = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [sentMails, setSentMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    useEffect(() => {
        const fetchSentMails = async () => {
            try {
                const response = await axios.get(`http://localhost:8083/mail/sent?page=${page}&size=10&sort=sentAt,DESC`);
                setSentMails(response.data.data);
                setTotalPages(response.data.pageInfo.totalPages);
                setTotalElements(response.data.pageInfo.totalElements);
                setLoading(false);
            } catch (error) {
                console.error('보낸 메일함 조회 중 오류 발생: ', error);
                setLoading(false);
            }
        };

        fetchSentMails();
    }, [page]);

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(prevPage => prevPage - 1);
        }
    };

    const handlePageClick = (pageNumber) => {
        setPage(pageNumber);
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
            <Typography variant="h5" mb={2}>보낸 메일함 (총 {totalElements}개)</Typography>
            <Box display="flex" flexDirection="column">
                {sentMails.map((mail, index) => (
                    <Box
                        key={mail.mailId}
                        display="grid"
                        gridTemplateColumns="40px 40px 200px auto 150px 40px"
                        alignItems="center"
                        p={2}
                        borderBottom="1px solid #ccc"
                    >
                        <Checkbox />
                        <IconButton>
                            {mail.isImportant ? <StarIcon /> : <StarBorderIcon />}
                        </IconButton>
                        <Typography variant="body1" noWrap>{mail.recipientName || mail.recipientEmail}</Typography>
                        <Typography variant="h6" fontWeight="bold" noWrap>{mail.subject}</Typography>
                        <Typography variant="body2" color="textSecondary" textAlign="right">
                            {new Date(mail.sentAt).toLocaleString()}
                        </Typography>
                        <IconButton>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                ))}
            </Box>
            <Box display="flex" justifyContent="center" mt={3}>
                {[...Array(totalPages)].map((_, index) => (
                    <Button
                        key={index + 1}
                        onClick={() => handlePageClick(index + 1)}
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
