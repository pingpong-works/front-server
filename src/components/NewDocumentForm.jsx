// src/components/NewDocumentForm.jsx
import React, { useState, useEffect } from 'react'; 
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    TextField, 
    Select, 
    MenuItem, 
    Box, 
    Typography, 
    Table, 
    TableBody, 
    TableRow, 
    TableCell, 
    CircularProgress, 
    Checkbox, 
    FormControlLabel, 
    Radio, 
    RadioGroup, 
    FormControl, 
    FormLabel 
} from '@mui/material';
import ApprovalLineModal from './ApprovalLineModal';
import sendPostDocumentSubmitRequest from '../request/PostDoumentSubmit'
import sendPostDocumentSaveRequest from '../request/PostDocumentSave';
import getDocsTypeAllRequest from '../request/GetDocsType';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { tokens } from "../theme";
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'; 
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; 
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; 
import dayjs from 'dayjs'; 

const NewDocumentForm = ({ open, handleClose, fetchDocuments }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    const [title, setTitle] = useState('');  // 문서 제목
    const [content, setContent] = useState('');  // 문서 내용
    const [customFields, setCustomFields] = useState({dayTime:dayjs});  // 문서의 커스텀 필드
    const [approvalLines, setApprovalLines] = useState([]);  // 결재라인
    const [workflowId, setWorkflowId] = useState(null);  // 결재라인 워크플로우 ID
    const [openApprovalLineModal, setOpenApprovalLineModal] = useState(false);  // 결재라인 모달 상태
    const [documentType, setDocumentType] = useState('');  // 문서 타입
    const [docsTypes, setDocsTypes] = useState([]);  // 문서 타입 목록
    const [isLoading, setIsLoading] = useState(false);  // 로딩 상태
    const [employeeId, setEmployeeId] = useState(null);  // employeeId 상태 관리
    const [errors, setErrors] = useState({});  // 오류 상태 관리

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
        if (open) { // 다이얼로그가 열릴 때만 정보 가져오기
            fetchUserInfo();  // 로그인된 사용자 정보를 가져옴
        }
    }, [open]);

    // 초기 상태 설정
    useEffect(() => {
        if (open) { // 다이얼로그가 열릴 때 초기화
            setTitle('');
            setContent('');
            setCustomFields({});
            setApprovalLines([]);
            setWorkflowId(null);
            setDocumentType('');
            setErrors({});
        }
    }, [open]);

    // 문서 타입 불러오기
    useEffect(() => {
        const fetchDocsTypes = async () => {
            try {
                setIsLoading(true);
              const response = await getDocsTypeAllRequest(1, 10, setDocsTypes, 'id', 'asc', setIsLoading);  
                console.log('문서타입 GET요청 성공: ', response);

                if (response.data && response.data.length > 0) {
                    // isVisible이 true인 문서 타입만 필터링
                    const visibleDocsTypes = response.data.filter(doc => doc.isVisible === true);
                    setDocsTypes(visibleDocsTypes);  
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
                    if (field.fieldType === 'Checkbox') {
                        initialFields[field.fieldName] = false; // 체크박스 초기값을 false로 설정
                    } else if (field.fieldType === 'Radio' || field.fieldType === 'Select') {
                        initialFields[field.fieldName] = ''; // Radio와 Select의 초기값을 빈 문자열로 설정
                    } else {
                        initialFields[field.fieldName] = ''; // 기타 필드 초기값을 빈 문자열로 설정
                    }
                });
                setCustomFields(initialFields);  // 필드를 동적으로 설정
            }
        }
    }, [documentType, docsTypes]);

    // 커스텀 필드 값 변경 처리
    const handleFieldChange = (fieldName, value) => {
        setCustomFields(prev => ({
            ...prev,
            [fieldName]: value,
        }));

        // 오류 메시지 제거
        setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            if (newErrors.customFields && newErrors.customFields[fieldName]) {
                delete newErrors.customFields[fieldName];
            }
            return newErrors;
        });
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

        // 오류 메시지 제거
        setErrors(prevErrors => {
            const newErrors = { ...prevErrors };
            if (newErrors.workflowId) {
                delete newErrors.workflowId;
            }
            return newErrors;
        });
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

        console.log("임시 저장 요청:", requestBody);

        try {
            await sendPostDocumentSaveRequest(requestBody, () => {
                console.log("임시 저장 완료");
                handleClose();
                fetchDocuments(); // 목록 갱신
            });
        } catch (error) {
            console.error("임시 저장 중 오류 발생:", error);
        }
    };

    // 문서 제출 처리
    const handleSubmitDocument = async () => {
        let newErrors = {};

        if (!documentType) {
            newErrors.documentType = '문서 타입을 선택해주세요.';
        }
        if (!title) {
            newErrors.title = '제목을 입력해주세요.';
        }
        if (!content) {
            newErrors.content = '내용을 입력해주세요.';
        }
        if (!workflowId) {
            newErrors.workflowId = '결재라인을 설정해주세요.';
        }

        // 커스텀 필드 검증
        for (const key in customFields) {
            if (customFields[key] === '' || customFields[key] === null || customFields[key] === undefined) {
                if (docsTypes.length > 0) {
                    const selectedDocType = docsTypes.find(doc => doc.id === documentType);
                    const fieldConfig = selectedDocType?.documentTemplate?.fields.find(f => f.fieldName === key);
                    if (fieldConfig?.fieldType !== 'Checkbox') { // 체크박스는 false도 유효하므로 제외
                        if (!newErrors.customFields) {
                            newErrors.customFields = {};
                        }
                        newErrors.customFields[key] = '필수 필드입니다.';
                    }
                }
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 오류가 없으면 오류 상태 초기화
        setErrors({});

        const requestBody = {
            documentTypeId: documentType,
            workflowId: Number(workflowId),
            title,
            content,
            employeeId: employeeId,  // 로그인된 작성자 ID
            customFields,
        };

        console.log("문서 제출 요청:", requestBody);

        try {
            await sendPostDocumentSubmitRequest(requestBody, () => {
                console.log("문서 제출 완료");
                handleClose();
                fetchDocuments(); // 목록 갱신
            });
        } catch (error) {
            console.error("문서 제출 중 오류 발생:", error);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>문서 작성</DialogTitle>
            <DialogContent>
                <Box>
                    {/* 문서 타입 선택 */}
                    <Typography variant="h6" gutterBottom>문서 타입 선택</Typography>
                    {isLoading ? (
                        <CircularProgress />
                    ) : (
                        <>
                            <Select
                                value={documentType}
                                onChange={(e) => {
                                    setDocumentType(e.target.value);
                                    // 오류 메시지 제거
                                    setErrors(prevErrors => {
                                        const newErrors = { ...prevErrors };
                                        if (newErrors.documentType) {
                                            delete newErrors.documentType;
                                        }
                                        return newErrors;
                                    });
                                }}
                                displayEmpty
                                fullWidth
                                variant="outlined"
                                sx={{ marginBottom: '20px' }}
                                error={!!errors.documentType}
                            >
                                <MenuItem value="" disabled>문서 타입 선택</MenuItem>
                                {docsTypes.map((doc) => (
                                    <MenuItem key={doc.id} value={doc.id}>
                                        {doc.type}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors.documentType && (
                                <Typography color="error" sx={{ marginBottom: '20px' }}>
                                    {errors.documentType}
                                </Typography>
                            )}
                        </>
                    )}

                    {/* 제목 입력 */}
                    <TextField
                        label="문서 제목"
                        fullWidth
                        variant="outlined"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            // 오류 메시지 제거
                            setErrors(prevErrors => {
                                const newErrors = { ...prevErrors };
                                if (newErrors.title) {
                                    delete newErrors.title;
                                }
                                return newErrors;
                            });
                        }}
                        sx={{ marginBottom: '20px' }}
                        error={!!errors.title}
                        helperText={errors.title}
                    />

                    {/* 내용 입력 */}
                    <TextField
                        label="문서 내용"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={6}
                        value={content}
                        onChange={(e) => {
                            setContent(e.target.value);
                            // 오류 메시지 제거
                            setErrors(prevErrors => {
                                const newErrors = { ...prevErrors };
                                if (newErrors.content) {
                                    delete newErrors.content;
                                }
                                return newErrors;
                            });
                        }}
                        sx={{ marginBottom: '20px' }}
                        error={!!errors.content}
                        helperText={errors.content}
                    />

                    {/* 커스텀 필드들 */}
                    {Object.keys(customFields).map((field, index) => {
                        const selectedDocType = docsTypes.find(doc => doc.id === documentType);
                        const fieldConfig = selectedDocType?.documentTemplate?.fields.find(f => f.fieldName === field);
                        const fieldType = fieldConfig?.fieldType;
                        const fieldOptions = fieldConfig?.options || []; // 옵션이 있는 필드의 경우 옵션을 가져옴

                        return (
                            <Box key={index} sx={{ marginBottom: '20px' }}>
                                {fieldType === 'LocalDateTime' ? (
                                    <TextField
                                        type="datetime-local" // 날짜와 시간을 모두 입력받기 위해 변경
                                        label={field}
                                        fullWidth
                                        variant="outlined"
                                        value={customFields[field]}
                                        onChange={(e) => handleFieldChange(field, e.target.value)}
                                        error={!!(errors.customFields && errors.customFields[field])}
                                        helperText={errors.customFields && errors.customFields[field]}
                                        InputLabelProps={{
                                            shrink: true, // 라벨이 필드와 겹치지 않도록 조정
                                        }}
                                    />
                                ) : fieldType === 'Checkbox' ? (
                                    <Box display="flex" alignItems="center">
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={customFields[field] || false}
                                                    onChange={(e) => handleFieldChange(field, e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label={field}
                                        />
                                        {errors.customFields && errors.customFields[field] && (
                                            <Typography color="error" sx={{ marginLeft: '10px' }}>
                                                {errors.customFields[field]}
                                            </Typography>
                                        )}
                                    </Box>
                                ) : fieldType === 'Radio' ? (
                                    <FormControl component="fieldset" fullWidth error={!!(errors.customFields && errors.customFields[field])}>
                                        <FormLabel component="legend">{field}</FormLabel>
                                        <RadioGroup
                                            value={customFields[field]}
                                            onChange={(e) => handleFieldChange(field, e.target.value)}
                                        >
                                            {fieldOptions.map((option, optIndex) => (
                                                <FormControlLabel 
                                                    key={optIndex} 
                                                    value={option.value} 
                                                    control={<Radio color="primary" />} 
                                                    label={option.label} 
                                                />
                                            ))}
                                        </RadioGroup>
                                        {errors.customFields && errors.customFields[field] && (
                                            <Typography color="error">
                                                {errors.customFields[field]}
                                            </Typography>
                                        )}
                                    </FormControl>
                                ) : fieldType === 'Select' ? (
                                    <FormControl fullWidth variant="outlined" error={!!(errors.customFields && errors.customFields[field])}>
                                        <Select
                                            value={customFields[field]}
                                            onChange={(e) => handleFieldChange(field, e.target.value)}
                                            displayEmpty
                                        >
                                            <MenuItem value="" disabled>
                                                {`Select ${field}`}
                                            </MenuItem>
                                            {fieldOptions.map((option, optIndex) => (
                                                <MenuItem key={optIndex} value={option.value}>
                                                    {option.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                        {errors.customFields && errors.customFields[field] && (
                                            <Typography color="error">
                                                {errors.customFields[field]}
                                            </Typography>
                                        )}
                                    </FormControl>
                                ) : (
                                    <TextField
                                        label={field}
                                        fullWidth
                                        variant="outlined"
                                        value={customFields[field]}
                                        onChange={(e) => handleFieldChange(field, e.target.value)}
                                        error={!!(errors.customFields && errors.customFields[field])}
                                        helperText={errors.customFields && errors.customFields[field]}
                                    />
                                )}
                            </Box>
                        );
                    })}

                    {/* 결재라인 설정 */}
                    <Button 
                        variant="contained" 
                        onClick={handleOpenApprovalLineModal} 
                        sx={{ marginBottom: '20px', bgcolor: colors.blueAccent[500], '&:hover': { bgcolor: colors.blueAccent[700] } }}
                    >
                        결재라인 설정
                    </Button>
                    {errors.workflowId && (
                        <Typography color="error" sx={{ marginBottom: '20px' }}>
                            {errors.workflowId}
                        </Typography>
                    )}

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
                <Button onClick={handleSaveDraft} sx={{ color: 'gray', fontWeight: 'bold' }}>임시 저장</Button>
                <Button onClick={handleSubmitDocument} sx={{ color: colors.blueAccent[500], fontWeight: 'bold' }}>제출</Button>
                <Button onClick={handleClose} sx={{ color: 'gray', fontWeight: 'bold' }}>닫기</Button>
            </DialogActions>

            {/* 결재라인 설정 모달 */}
            <ApprovalLineModal
                open={openApprovalLineModal}
                handleClose={handleCloseApprovalLineModal}
                onSubmit={handleApprovalLineSubmit}
                currentEmployeeId={employeeId}
            />
        </Dialog>
    );
};

export default NewDocumentForm;
