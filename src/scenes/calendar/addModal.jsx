import React from 'react';
import {Box, Button, Modal, TextField, Typography} from "@mui/material";

const addModal = ({isOpen, onCancel, onSubmit, inputValues, setInputValues}) => {
    const handleChange = (e) => {
        const {name, value} = e.target;
        setInputValues({
            ...inputValues,
            [name]: value,
        });
    };

    return (
        <Modal open={isOpen} onClose={onCancel}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.default',
                borderRadius: '5px',
                width: 400,
                boxShadow: 24,
                p: 4
            }}>
                <Typography variant="h3" component="h2">
                    일정 추가
                </Typography>
                <TextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    label="제목"
                    name="title"
                    value={inputValues.title}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    label="시작 시간"
                    name="start"
                    type="datetime-local"
                    value={inputValues.start}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    label="끝나는 시간"
                    name="end"
                    type="datetime-local"
                    value={inputValues.end}
                    onChange={handleChange}
                />
                <TextField
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    label="내용"
                    name="description"
                    value={inputValues.description}
                    onChange={handleChange}
                />
                <Box mt={2}>
                    <Button onClick={onSubmit} variant="contained" color="primary">추가</Button>
                    <Button onClick={onCancel} variant="outlined" color="secondary" sx={{ml: 2}}>취소</Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default addModal; 