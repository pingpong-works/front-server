import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTheme, Box, Modal, Typography, Table, TableBody, TableCell, TableRow, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ApprovalDocumentForm from './ApprovalDocumentForm';
import ApprovalTable from "./ApprovalTable";
import getEmployee from "../request/GetEmployee";
import Swal from "sweetalert2";

const DocumentModal = ({ documentId, handleClose }) => {
    const theme = useTheme();
    const mode = theme.palette.mode; // mode가 'light' 또는 'dark'인지 확인
    const [documentData, setDocumentData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [openMessageModal, setOpenMessageModal] = useState(false);
    const [selectedApprovalId, setSelectedApprovalId] = useState(null);
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(true);
    const [openApprovalDocumentForm, setOpenApprovalDocumentForm] = useState(false);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get("http://localhost:50000/employees/my-info", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });
                const { name, departmentName, employeeRank, employeeId } = response.data.data;
                setUserInfo({ name, departmentName, employeeRank, employeeId });
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };

        fetchUserInfo();
    }, []);

    const fetchDocumentData = async () => {
        if (!documentId) {
            console.error("문서 ID가 올바르게 전달되지 않았습니다.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:50001/documents/${documentId}`);
            const data = response.data.data;

            if (data) {
                const approvals = data.workFlow?.approvals || [];
                const sortedApprovals = approvals.sort((a, b) => a.approvalOrder - b.approvalOrder);

                const approvalsWithInfo = await Promise.all(sortedApprovals.map(async (approval) => {
                    const employeeInfo = await getEmployee(approval.employeeId);
                    return {
                        ...approval,
                        name: employeeInfo?.name || "Unknown",
                        position: employeeInfo?.employeeRank || "Unknown"
                    };
                }));

                setDocumentData({
                    ...data,
                    workFlow: {
                        ...data.workFlow,
                        approvals: approvalsWithInfo
                    }
                });
            }
        } catch (err) {
            console.error("오류 발생:", err);
        }
    };

    useEffect(() => {
        if (documentId) {
            fetchDocumentData();
            setIsOpen(true);
        }
    }, [documentId]);

    if (!documentData || !userInfo) {
        return null;
    }

    const handleApprovalAction = (approvalId, approvalOrder) => {
        const currentApprover = documentData.workFlow?.approvals.find(
            approval => approval.approvalOrder === documentData.workFlow.currentStep // currentStep과 비교
        );

        console.log('currentStep:', documentData.workFlow.currentStep);  // currentStep 로그 출력
        console.log('approvalOrder:', approvalOrder);  // approvalOrder 로그 출력
        console.log('currentApprover:', currentApprover);  // 현재 결재자 정보 확인

        if (currentApprover && currentApprover.employeeId === userInfo.employeeId) {
            // 현재 결재 순서가 맞는 경우
            setSelectedApprovalId(approvalId);
            setOpenMessageModal(true);
        } else {
            // 결재 순서가 아닌 경우 에러 알림
            Swal.fire({
                title: "결재 오류",
                text: "현재 결재 순서가 아닙니다.",
                icon: "error",
                confirmButtonText: "확인",
                backdrop: false,
            });
        }
    };

    const handleReWrite = () => {
        setOpenApprovalDocumentForm(true);
    };

    const handleCloseApprovalDocumentForm = () => {
        setOpenApprovalDocumentForm(false);
    };

    const handleCloseMessageModal = () => {
        setOpenMessageModal(false);
    };

    const handleCloseModal = async () => {
        await fetchDocumentData();
        handleClose();
    };

    const handleConfirmApproval = async (status) => {
        try {
            const response = await axios.patch(`http://localhost:50001/workflows`, {
                id: selectedApprovalId,
                approvalOrder: documentData.workFlow.currentStep + 1,
                approvalStatus: status,
                message: message,
                employeeId: userInfo.employeeId
            });

            if (response.status === 200) {
                const updatedWorkflow = response.data.data;
                setDocumentData((prevData) => ({
                    ...prevData,
                    workFlow: updatedWorkflow
                }));
                setOpenMessageModal(false);
                Swal.fire({
                    title: "결재 완료",
                    text: "결재가 성공적으로 처리되었습니다.",
                    icon: "success",
                    confirmButtonText: "확인",
                });
            }
        } catch (error) {
            console.error("Error during approval:", error);
            Swal.fire({
                title: "결재 오류",
                text: "결재 처리 중 오류가 발생했습니다.",
                icon: "error",
                confirmButtonText: "확인",
            });
        }
    };

    return (
        <Modal open={isOpen} onClose={handleCloseModal}>
            <Box sx={{
                width: "80%",
                maxHeight: "80vh",
                overflow: "auto",
                padding: 4,
                backgroundColor: mode === 'dark' ? theme.palette.background.default : theme.palette.background.paper,  // 다크 모드와 라이트 모드에 따른 배경색 설정
                color: mode === 'dark' ? theme.palette.text.primary : 'black',  // 다크 모드에 맞춰 텍스트 색상 조정
                margin: "100px auto",
                position: "relative"
            }}>
                <IconButton
                    aria-label="close"
                    onClick={handleCloseModal}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        color: 'black',
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Typography variant="h5" textAlign="center" mb={4} fontWeight="bold" fontSize={30} sx={{ color: mode === 'dark' ? 'white' : 'black' }}>
                    {documentData.title}
                </Typography>

                {documentData.author === userInfo.name && documentData.documentStatus === 'DRAFT' && (
                    <Button
                        variant="contained"
                        onClick={handleReWrite}
                        sx={{ position: "absolute", top: 16, right: 80 }}
                    >
                        다시 작성
                    </Button>
                )}

                {openApprovalDocumentForm && (
                    <ApprovalDocumentForm
                        open={openApprovalDocumentForm}
                        handleClose={handleCloseApprovalDocumentForm}
                        initialData={documentData}
                    />
                )}

                <Box sx={{ mb: 6 }} />

                <Box sx={{
                    display: "block",
                    position: "left",
                    width: "15em",
                    textAlign: "center",
                    marginBottom: "20px"
                }}>
                    <ApprovalTable
                        approvalLines={documentData.workFlow?.approvals || []}
                        handleApprovalClick={handleApprovalAction}
                    />
                </Box>

                <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`, fontWeight: "bold", width: "20%", color: mode === 'dark' ? 'white' : 'black' }}>문서번호</TableCell>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`, color: mode === 'dark' ? 'white' : 'black' }}>{documentData.documentCode}</TableCell>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`, fontWeight: "bold", color: mode === 'dark' ? 'white' : 'black' }}>작성일자</TableCell>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`, color: mode === 'dark' ? 'white' : 'black' }}>{documentData.createdAt.substring(0, 10)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`, fontWeight: "bold", color: mode === 'dark' ? 'white' : 'black' }}>작성자</TableCell>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`, color: mode === 'dark' ? 'white' : 'black' }}>{documentData.author}</TableCell>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`, fontWeight: "bold", color: mode === 'dark' ? 'white' : 'black' }}>부서</TableCell>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`, color: mode === 'dark' ? 'white' : 'black' }}>{documentData.departmentName}</TableCell>
                        </TableRow>

                        {documentData.customFields &&
                            Object.keys(documentData.customFields).map((field, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`, fontWeight: "bold", color: mode === 'dark' ? 'white' : 'black' }}>{field}</TableCell>
                                    <TableCell colSpan={3} sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`, color: mode === 'dark' ? 'white' : 'black' }}>
                                        {documentData.customFields[field]}
                                    </TableCell>
                                </TableRow>
                            ))}

                        <TableRow>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`, fontWeight: "bold", color: mode === 'dark' ? 'white' : 'black' }}>내용</TableCell>
                            <TableCell colSpan={3} sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`, color: mode === 'dark' ? 'white' : 'black' }}>
                                {documentData.content}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Dialog open={openMessageModal} onClose={handleCloseMessageModal}>
                    <DialogTitle>메시지 입력</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="메시지"
                            fullWidth
                            variant="outlined"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => handleConfirmApproval('APPROVED')}>승인</Button>
                        <Button onClick={() => handleConfirmApproval('REJECTED')}>반려</Button>
                        <Button onClick={() => handleConfirmApproval('FINALIZED')}>전결</Button>
                        <Button onClick={handleCloseMessageModal}>취소</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Modal>
    );
};

export default DocumentModal;
