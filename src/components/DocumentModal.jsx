import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Modal, Typography, Table, TableBody, TableCell, TableRow, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ApprovalLineModal from './ApprovalLineModal';
import ApprovalDocumentForm from './ApprovalDocumentForm';
import ApprovalTable from "./ApprovalTable";
import getEmployee from "../request/GetEmployee";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const DocumentModal = ({ documentId, handleClose }) => {
    const [documentData, setDocumentData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [openMessageModal, setOpenMessageModal] = useState(false);
    const [selectedApprovalId, setSelectedApprovalId] = useState(null);
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(true);  // isOpen 상태 추가
    const [openApprovalDocumentForm, setOpenApprovalDocumentForm] = useState(false);  // ApprovalDocumentForm 열림 상태
    const navigate = useNavigate();
    const { state } = useAuth();  // useAuth 훅 사용

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

    const handleApprovalAction = (approvalId) => {
        setSelectedApprovalId(approvalId);
        setOpenMessageModal(true);
    };

    const handleReWrite = () => {
        setOpenApprovalDocumentForm(true); // "다시 작성" 버튼을 누르면 ApprovalDocumentForm 모달 열기
    };

    const handleCloseApprovalDocumentForm = () => {
        setOpenApprovalDocumentForm(false); // 모달 닫기
    };

    const handleCloseMessageModal = () => {
        setOpenMessageModal(false);
    };

    const handleConfirmApproval = (status) => {
        console.log(`Document ${status}: ${selectedApprovalId}`);
        setOpenMessageModal(false);
    };

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <Box sx={{
                width: "80%",
                maxHeight: "80vh",
                overflow: "auto",
                padding: 4,
                backgroundColor: "#fff",
                margin: "100px auto",
                position: "relative"
            }}>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        color: 'black',
                    }}
                >
                    <CloseIcon />
                </IconButton>

                <Typography variant="h5" textAlign="center" mb={4} fontWeight="bold" fontSize={30}>
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

                {/* ApprovalDocumentForm을 엽니다 */}
                {openApprovalDocumentForm && (
                    <ApprovalDocumentForm
                        open={openApprovalDocumentForm}
                        handleClose={handleCloseApprovalDocumentForm}
                        initialData={documentData}  // 문서 데이터를 전달합니다
                    />
                )}

                <Box sx={{ mb: 6 }} />

                <Box sx={{
                    display: "block",
                    position: "left",
                    width: "15em",
                    textAlign: "center",
                    marginBottom: "20px",
                }}>
                    <ApprovalTable
                        approvalLines={documentData.workFlow?.approvals || []}
                        handleApprovalClick={handleApprovalAction}
                    />
                </Box>

                <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ border: "1px solid #000", fontWeight: "bold", width: "20%" }}>문서번호</TableCell>
                            <TableCell sx={{ border: "1px solid #000" }}>{documentData.documentCode}</TableCell>
                            <TableCell sx={{ border: "1px solid #000", fontWeight: "bold" }}>작성일자</TableCell>
                            <TableCell sx={{ border: "1px solid #000" }}>{documentData.createdAt.substring(0, 10)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ border: "1px solid #000", fontWeight: "bold" }}>작성자</TableCell>
                            <TableCell sx={{ border: "1px solid #000" }}>{documentData.author}</TableCell>
                            <TableCell sx={{ border: "1px solid #000", fontWeight: "bold" }}>부서</TableCell>
                            <TableCell sx={{ border: "1px solid #000" }}>{documentData.departmentName}</TableCell>
                        </TableRow>

                        {documentData.customFields &&
                            Object.keys(documentData.customFields).map((field, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ border: "1px solid #000", fontWeight: "bold" }}>{field}</TableCell>
                                    <TableCell colSpan={3} sx={{ border: "1px solid #000" }}>
                                        {documentData.customFields[field]}
                                    </TableCell>
                                </TableRow>
                            ))}

                        <TableRow>
                            <TableCell sx={{ border: "1px solid #000", fontWeight: "bold" }}>내용</TableCell>
                            <TableCell colSpan={3} sx={{ border: "1px solid #000" }}>
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
