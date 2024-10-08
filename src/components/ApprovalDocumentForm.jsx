import React, { useState, useEffect } from 'react';
import { useTheme, Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, TextField, Box, Typography, TableHead, Table, TableBody, TableRow, TableCell, CircularProgress, IconButton } from '@mui/material';
import ApprovalLineModal from './ApprovalLineModal';
import getDocsTypeAllRequest from '../request/GetDocsType';
import CloseIcon from '@mui/icons-material/Close';
import { tokens } from "../theme";
import sendPostDocumentSubmitRequest from '../request/PostDoumentSubmit';
import sendPostDocumentSaveRequest from '../request/PostDocumentSave';

const ApprovalDocumentForm = ({ open, handleClose, onSubmit }) => {
    const [employeeId, setEmployeeId] = useState(1);
    const [documentType, setDocumentType] = useState({ id: '', templateName: '' });  // 문서 타입
    const [title, setTitle] = useState('');  // 문서 제목
    const [content, setContent] = useState('');  // 문서 내용
    const [fields, setFields] = useState([]);  // 선택된 문서의 필드들
    const [approvalLines, setApprovalLines] = useState([]);  // 결재라인
    const [workflowId, setWorkflowId] = useState(null);
    const [openApprovalLineModal, setOpenApprovalLineModal] = useState(false);
    const [docsTypes, setDocsTypes] = useState([]);  // 문서 타입 리스트 상태
    const [isLoading, setIsLoading] = useState(false);  // api로딩상태
    const [customFields, setCustomFields] = useState({});

    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

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

        if (selectedTemplate) {
            setDocumentType({
                id: selectedTemplate.id,  // 선택된 문서 템플릿의 ID 설정
                templateName: selectedTemplate.documentTemplate.templateName  // 선택된 문서 템플릿 이름 설정
            });
            setFields(selectedTemplate.documentTemplate.fields);  // 선택된 템플릿에 맞는 필드 설정
            console.log('Selected Template:', selectedTemplate.documentTemplate);  // 확인용 로그
        } else {
            setDocumentType('');  // 선택된 템플릿이 없을 경우 상태 초기화
            setFields([]);  // 필드도 초기화
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
    const handleApprovalLineSubmit = (selectedApprovals, workflowId) => {
        setApprovalLines(selectedApprovals);
        setWorkflowId(workflowId);  // 선택한 워크플로우 ID를 저장
        setOpenApprovalLineModal(false);
    };

    //customFields 입력시 업데이트
    const handleFieldChange = (fieldName, value) => {
        setCustomFields((prevFields) => ({
            ...prevFields,
            [fieldName]: value
        }));
    };

    const handleSaveDraft = async () => {
        const employeeId = 1;  // 임시로 employeeId를 설정

        const requestBody = {
            documentTypeId: documentType.id || null,  // 선택한 문서 타입 ID, 없으면 null
            workflowId: workflowId || null,  // 선택한 워크플로우 ID
            title,
            content,
            employeeId: employeeId, // 로그인한 사용자의 ID
            customFields
        };

        // 임시 저장 요청 호출
        await sendPostDocumentSaveRequest(null, requestBody, () => {
            console.log('임시 저장 후 추가 작업 실행');
            handleClose();  // 모달 닫기
        });
    };

    // 제출 핸들러
    const handleSubmitDocument = async () => {
        const requestBody = {
            documentTypeId: documentType.id,  // 선택한 문서 타입 ID
            workflowId: workflowId,        // 선택한 워크플로우 ID
            title,
            content,
            employeeId, // 로그인한 사용자의 ID
            customFields
        };

        // 제출 요청 호출
        await sendPostDocumentSubmitRequest(null, requestBody, () => {
            console.log('requestBody',requestBody);
            handleClose();  // 모달 닫기
        });
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle >문서 작성
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
                            value={documentType.templateName} 
                            onChange={handleDocumentTypeChange}
                            displayEmpty
                            fullWidth
                            variant="outlined"
                            sx={{ marginBottom: '20px' }}
                        >
                            <MenuItem value="" disabled>문서 타입 선택</MenuItem>
                            {docsTypes.data?.map((doc) => (
                                <MenuItem key={doc.documentTemplate.id} value={doc.documentTemplate.templateName}>
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
                        sx={{ marginBottom: '20px', backgroundColor: colors.blueAccent[500] }}
                    >
                        결재라인 설정
                    </Button>
                    {/* 결재라인 표시 테이블 */}
                    <Table>
                        <TableHead>
                            <TableRow>
                                {approvalLines && approvalLines.length > 0 ? (
                                    approvalLines.map((approver, index) => (
                                        <TableCell
                                            key={index}
                                            align="center"
                                            sx={{ fontSize: '0.6rem', border: '1px solid #ccc' }}
                                        >
                                            <Typography variant="body1" sx={{ fontSize: '0.6rem' }}>
                                                {approver.position}
                                            </Typography> {/* 직급 */}
                                        </TableCell>
                                    ))
                                ) : (
                                    <TableCell align="center" colSpan={approvalLines.length}>
                                        결재라인이 설정되지 않았습니다.
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                {approvalLines && approvalLines.length > 0 ? (
                                    approvalLines.map((approver, index) => (
                                        <TableCell
                                            key={index}
                                            align="center"
                                            sx={{ border: '1px solid #ccc' }} 
                                        >
                                            {/* 결재 상태 또는 추가 정보 */}
                                            <Box
                                                sx={{
                                                    width: '50px',
                                                    height: '50px',
                                                    display: 'flex'
                                                }}
                                            >
                                            </Box>
                                        </TableCell>
                                    ))
                                ) : null}
                            </TableRow>
                        </TableBody>
                        <TableRow>
                            {approvalLines && approvalLines.length > 0 ? (
                                approvalLines.map((approver, index) => (
                                    <TableCell
                                        key={index}
                                        align="center"
                                        sx={{ border: '1px solid #ccc' }} // 테두리 추가
                                    >
                                        <Typography variant="body2" sx={{ fontSize: '0.6rem' }}>
                                            {approver.name}
                                        </Typography> {/* 이름 */}
                                    </TableCell>
                                ))
                            ) : null}
                        </TableRow>
                    </Table>
                    <Box p={2}></Box>
                    {/* 필드에 맞는 동적 입력 폼 생성 */}
                    {fields.length > 0 && fields.map((field) => (
                        <TextField
                            key={field.id}
                            label={field.fieldName}
                            fullWidth
                            variant="outlined"
                            sx={{ marginBottom: '20px' }}
                            type={field.fieldType === 'Date' || field.fieldType === 'LocalDate' ? 'date' : 'text'}  // 필드 타입에 맞게 input type 설정
                            InputLabelProps={{
                                shrink: field.fieldType === 'Date' || field.fieldType === 'LocalDate' ? true : undefined,
                            }}
                            onChange={(e) => handleFieldChange(field.fieldName, e.target.value)}  // 필드 값 변경 시 호출
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
                    sx={{
                        marginRight: '10px',
                        backgroundColor: colors.primary[300],
                        color: colors.gray[150]
                    }}
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