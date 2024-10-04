import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, TextField, Box, Typography, Table, TableBody, TableRow, TableCell, CircularProgress, IconButton } from '@mui/material';
import ApprovalLineModal from './ApprovalLineModal';
import getDocsTypeAllRequest from '../request/GetDocsType';
import CloseIcon from '@mui/icons-material/Close';

const ApprovalDocumentForm = ({ open, handleClose, onSubmit }) => {
    const [documentType, setDocumentType] = useState('');  // 문서 타입
    const [title, setTitle] = useState('');  // 문서 제목
    const [content, setContent] = useState('');  // 문서 내용
    const [fields, setFields] = useState([]);  // 선택된 문서의 필드들
    const [approvalLines, setApprovalLines] = useState([]);  // 결재라인
    const [openApprovalLineModal, setOpenApprovalLineModal] = useState(false);
    const [docsTypes, setDocsTypes] = useState([]);  // 문서 타입 리스트 상태
    const [isLoading, setIsLoading] = useState(false);  // api로딩상태

    // 문서 타입 가져오기
    const fetchDocsTypes = async () => {
        setIsLoading(true);
        try {
            const response = await getDocsTypeAllRequest({}, 1, 10, setDocsTypes, 'templateName', 'asc', setIsLoading);
            if (response?.data?.data) {
                setDocsTypes(response.data.data);  // 문서 타입 리스트 설정
            }
        } catch (error) {
            console.error("문서 타입 가져오기 오류:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 컴포넌트가 처음 렌더링될 때 문서 타입 목록을 가져옴
    useEffect(() => {
        fetchDocsTypes();
    }, []);

    // 문서 타입 선택 핸들러
    const handleDocumentTypeChange = (event) => {
        const selectedTemplate = docsTypes.data.find(doc => doc.documentTemplate.templateName === event.target.value);
        setDocumentType(event.target.value);

        // 선택된 문서 타입에 해당하는 필드를 설정
        if (selectedTemplate) {
            setFields(selectedTemplate.documentTemplate.fields);
        } else {
            setFields([]);
        }
    };

    // 결재라인 설정 모달 열기
    const handleOpenApprovalLineModal = () => {
        setOpenApprovalLineModal(true);
    };

    // 결재라인 설정 모달 닫기
    const handleCloseApprovalLineModal = () => {
        setOpenApprovalLineModal(false);
    };

    // 결재라인 설정 완료 시 처리
    const handleApprovalLineSubmit = (selectedApprovals) => {
        setApprovalLines(selectedApprovals);
        setOpenApprovalLineModal(false);
    };

    // 임시 저장 핸들러
    const handleSaveDraft = () => {
        const documentData = {
            type: documentType,
            title,
            content,
            approvalLines,
            status: 'DRAFT'
        };
        console.log('임시 저장:', documentData);
        // 임시 저장 로직 추가
    };

    // 제출 핸들러
    const handleSubmitDocument = () => {
        const documentData = {
            type: documentType,
            title,
            content,
            approvalLines,
            status: 'SUBMITTED'
        };
        console.log('제출:', documentData);
        // 제출 로직 추가
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>문서 작성
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box p={2}>
                    {/* 문서 타입 선택 */}
                    <Typography variant="h6">문서 타입 선택</Typography>
                    {isLoading ? (
                        <CircularProgress />
                    ) : (
                        <Select
                            value={documentType}
                            onChange={handleDocumentTypeChange}
                            displayEmpty
                            fullWidth
                            variant="outlined"
                            sx={{ marginBottom: '20px' }}
                        >
                            <MenuItem value="" disabled>문서 타입 선택</MenuItem>
                            {docsTypes.data?.map((doc) => (
                                <MenuItem key={doc.id} value={doc.documentTemplate.templateName}>
                                    {doc.documentTemplate.templateName}
                                </MenuItem>
                            ))}
                        </Select>
                    )}

                    {/* 결재라인 설정 버튼 */}
                    <Button
                        variant="contained"
                        onClick={handleOpenApprovalLineModal}
                        fullWidth
                        sx={{ marginBottom: '20px' }}
                    >
                        결재라인 설정
                    </Button>

                    {/* 결재라인 표시 테이블 */}
                    <Table>
                        <TableBody>
                            <TableRow>
                                {approvalLines && approvalLines.length > 0 ? (
                                    approvalLines.map((approver, index) => (
                                        <TableCell key={index}>
                                            {approver.position} ({approver.name})
                                        </TableCell>
                                    ))
                                ) : (
                                    <TableCell align="center" colSpan={2}>
                                        결재라인이 설정되지 않았습니다.
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableBody>
                    </Table>
                    {/* 필드에 맞는 동적 입력 폼 생성 */}
                    {fields.length > 0 && fields.map((field) => (
                        <TextField
                            key={field.id}
                            label={field.fieldName}
                            fullWidth
                            variant="outlined"
                            sx={{ marginBottom: '20px' }}
                            type={field.fieldType === 'Date' || field.fieldType === 'LocalDate' ? 'date' : 'text'}
                            InputLabelProps={{
                                shrink: field.fieldType === 'Date' || field.fieldType === 'LocalDate' ? true : undefined,
                            }}
                        />
                    ))}
                    {/* 문서 제목 및 내용 작성 */}
                    <TextField
                        label="문서 제목"
                        fullWidth
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{ marginBottom: '20px' }}
                    />
                    <TextField
                        label="문서 내용"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={6}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        sx={{ marginBottom: '20px' }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                {/* 임시 저장 및 제출 버튼 */}
                <Button
                    variant="outlined"
                    onClick={handleSaveDraft}
                    sx={{ marginRight: '10px' }}
                >
                    임시 저장
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmitDocument}
                    color="primary"
                >
                    제출
                </Button>
            </DialogActions>

            {/* 결재라인 설정 모달 */}
            <ApprovalLineModal
                open={openApprovalLineModal}
                handleClose={handleCloseApprovalLineModal}
                onSubmit={handleApprovalLineSubmit}
            />
        </Dialog>
    );
};

export default ApprovalDocumentForm;