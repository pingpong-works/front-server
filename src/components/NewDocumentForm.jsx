import React, { useState, useEffect } from 'react'; 
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, Box, Typography, Table, TableBody, TableRow, TableCell, CircularProgress } from '@mui/material';
import ApprovalLineModal from './ApprovalLineModal';
import sendPostDocumentSubmitRequest from '../request/PostDoumentSubmit';
import sendPostDocumentSaveRequest from '../request/PostDocumentSave';
import getDocsTypeAllRequest from '../request/GetDocsType';
import axios from 'axios'; // 로그인된 사용자 정보를 가져오기 위해 axios 사용

const NewDocumentForm = ({ open, handleClose, fetchDocuments }) => {
    const [title, setTitle] = useState('');  // 문서 제목
    const [content, setContent] = useState('');  // 문서 내용
    const [customFields, setCustomFields] = useState({});  // 문서의 커스텀 필드
    const [approvalLines, setApprovalLines] = useState([]);  // 결재라인
    const [workflowId, setWorkflowId] = useState(null);  // 결재라인 워크플로우 ID
    const [openApprovalLineModal, setOpenApprovalLineModal] = useState(false);  // 결재라인 모달 상태
    const [documentType, setDocumentType] = useState('');  // 문서 타입
    const [docsTypes, setDocsTypes] = useState([]);  // 문서 타입 목록
    const [isLoading, setIsLoading] = useState(false);  // 로딩 상태
    const [employeeId, setEmployeeId] = useState(null);  // employeeId 상태 관리

    // 로그인된 사용자 정보를 가져오는 함수
    const fetchUserInfo = async () => {
        try {
            const response = await axios.get("http://localhost:8081/employees/my-info", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                },
            });
            const { employeeId } = response.data.data; // employeeId만 사용
            setEmployeeId(employeeId); // 로그인된 사용자의 employeeId 설정
        } catch (error) {
            console.error("로그인된 사용자 정보를 가져오는 중 오류 발생:", error);
        }
    };

    // 컴포넌트 마운트 시 로그인된 사용자 정보 가져오기
    useEffect(() => {
        fetchUserInfo();  // 로그인된 사용자 정보를 가져옴
    }, []);

    // 초기 상태 설정
    useEffect(() => {
        setTitle('');
        setContent('');
        setCustomFields({});
        setApprovalLines([]);
        setWorkflowId(null);
        setDocumentType('');
    }, []);

    // 문서 타입 불러오기
    useEffect(() => {
        const fetchDocsTypes = async () => {
            try {
                setIsLoading(true);
                const response = await getDocsTypeAllRequest(1, 10, setDocsTypes, 'id', 'asc', setIsLoading);  // 토큰 없이 호출
                console.log('문서타입 GET요청 성공: ', response);
                if (response.data && response.data.length > 0) {
                    setDocsTypes(response.data);  // 받아온 데이터를 설정
                } else {
                    console.log('문서 타입 데이터가 없습니다.');
                }
            } catch (error) {
                console.error('문서 타입 불러오기 오류: ', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocsTypes();
    }, []);

    // 문서 타입 선택 시 필드 동적 생성
    useEffect(() => {
        if (documentType) {
            const selectedDocType = docsTypes.find(doc => doc.id === documentType);
            if (selectedDocType && selectedDocType.documentTemplate) {
                const fields = selectedDocType.documentTemplate.fields;
                const initialFields = {};
                fields.forEach(field => {
                    initialFields[field.fieldName] = '';  // 필드 초기값을 빈 문자열로 설정
                });
                setCustomFields(initialFields);  // 필드를 동적으로 설정
            }
        }
    }, [documentType]);

    // 커스텀 필드 값 변경 처리
    const handleFieldChange = (fieldName, value) => {
        setCustomFields(prev => ({
            ...prev,
            [fieldName]: value,
        }));
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
        setWorkflowId(workflowId);  // 워크플로우 ID 저장
        setOpenApprovalLineModal(false);
    };

    // 문서 임시 저장 처리
    const handleSaveDraft = async () => {
        const requestBody = {
            documentTypeId: documentType,
            workflowId: Number(workflowId),  // 숫자로 변환
            title,
            content,
            employeeId: employeeId,
            customFields,
        };

        console.log(requestBody);

        await sendPostDocumentSaveRequest(requestBody, () => {
            console.log("임시 저장 완료");
            handleClose();
            fetchDocuments(); // 목록 갱신
        });
    };

    // 문서 제출 처리
    const handleSubmitDocument = async () => {
        const requestBody = {
            documentTypeId: documentType,
            workflowId: Number(workflowId),
            title,
            content,
            employeeId: employeeId,  // 로그인된 작성자 ID
            customFields,
        };

        console.log(requestBody);
        await sendPostDocumentSubmitRequest(requestBody, () => {
            console.log("문서 제출 완료");
            handleClose();
            fetchDocuments(); // 목록 갱신
        });
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>문서 작성</DialogTitle>
            <DialogContent>
                <Box>
                    {/* 문서 타입 선택 */}
                    <Typography variant="h6">문서 타입 선택</Typography>
                    {isLoading ? (
                        <CircularProgress />
                    ) : (
                        <Select
                            value={documentType}
                            onChange={(e) => {
                                setDocumentType(e.target.value);
                            }}
                            displayEmpty
                            fullWidth
                            variant="outlined"
                            sx={{ marginBottom: '20px' }}
                        >
                            <MenuItem value="" disabled>문서 타입 선택</MenuItem>
                            {docsTypes.map((doc, index) => (
                                <MenuItem key={index} value={doc.id}>
                                    {doc.type}
                                </MenuItem>
                            ))}
                        </Select>
                    )}

                    {/* 제목 입력 */}
                    <TextField
                        label="문서 제목"
                        fullWidth
                        variant="outlined"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        sx={{ marginBottom: '20px' }}
                    />

                    {/* 내용 입력 */}
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

                    {/* 커스텀 필드들 */}
                    {Object.keys(customFields).map((field, index) => {
                        const fieldType = docsTypes.find(doc => doc.id === documentType)?.documentTemplate?.fields.find(f => f.fieldName === field)?.fieldType;
                        return (
                            <Box key={index} sx={{ marginBottom: '20px' }}>
                                {fieldType === 'Date' ? (
                                    <TextField
                                        type="date"
                                        label={field}
                                        fullWidth
                                        variant="outlined"
                                        value={customFields[field]}
                                        onChange={(e) => handleFieldChange(field, e.target.value)}
                                    />
                                ) : (
                                    <TextField
                                        label={field}
                                        fullWidth
                                        variant="outlined"
                                        value={customFields[field]}
                                        onChange={(e) => handleFieldChange(field, e.target.value)}
                                    />
                                )}
                            </Box>
                        );
                    })}

                    {/* 결재라인 설정 */}
                    <Button variant="contained" onClick={handleOpenApprovalLineModal} sx={{ marginBottom: '20px' }}>
                        결재라인 설정
                    </Button>

                    {/* 결재라인 테이블 표시 */}
                    <Table>
                        <TableBody>
                            {approvalLines.map((approver, index) => (
                                <TableRow key={index}>
                                    <TableCell>{approver.position}</TableCell>
                                    <TableCell>{approver.name}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSaveDraft} color="primary">임시 저장</Button>
                <Button onClick={handleSubmitDocument} color="primary">제출</Button>
                <Button onClick={handleClose} color="secondary">닫기</Button>
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

export default NewDocumentForm;
