import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Modal, Typography, Table, TableBody, TableCell, TableRow, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ApprovalTable from "./ApprovalTable";
import getEmployee from "../request/GetEmployee";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const DocumentModal = ({ documentId, handleClose }) => {
    const [documentData, setDocumentData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [openMessageModal, setOpenMessageModal] = useState(false);
    const [selectedApprovalId, setSelectedApprovalId] = useState(null);
    const [message, setMessage] = useState('');
    const [isOpen, setIsOpen] = useState(true);  // isOpen 상태 추가
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
                    const employeeInfo = await getEmployee(approval.employeeId, setIsLoading);
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
            console.log("Document ID:", documentId);
            console.log("Modal Open State:", isOpen);
        }
    }, [documentId]);

    if (!documentData || !userInfo) {
        return null;
    }

    const handleApprovalAction = (approvalId) => {
        setSelectedApprovalId(approvalId);
        setOpenMessageModal(true);
    };

    const isAuthor = documentData.author === userInfo.name;
    const isApprover = documentData.workFlow?.approvals.some(
        (approval) => approval.employeeId === userInfo.employeeId
    );

    const handleReWrite = () => {
        navigate(`/approval-document-form/${documentId}`);
    };

    const handleCloseMessageModal = () => {
        setOpenMessageModal(false);
    };

    const handleConfirmApproval = (status) => {
        // 여기에 승인/반려/전결 로직 추가
        console.log(`Document ${status}: ${selectedApprovalId}`);
        setOpenMessageModal(false);
    };

    return (
        <Modal open={isOpen} onClose={handleClose}>
            <Box
                sx={{
                    width: "80%",
                    maxHeight: "80vh",
                    overflow: "auto",
                    padding: 4,
                    backgroundColor: "#fff",
                    margin: "100px auto",
                    position: "relative"
                }}
            >
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
                {/* 작성자이고 문서 상태가 임시 저장일 경우 '다시 작성' 버튼 표시 */}
                {documentData.author === userInfo.name && documentData.documentStatus === 'DRAFT' && (
                    <Button
                        variant="contained"
                        onClick={handleReWrite}
                        sx={{ position: "absolute", top: 16, right: 80 }}
                    >
                        다시 작성
                    </Button>
                )}

                {/* 결재 라인과 문서 테이블 간의 간격 조정 */}
                <Box sx={{ mb: 6 }} />

                {/* 결재 라인 */}
                <Box
                    sx={{
                        display: "block",
                        position: "left",
                        width: "15em",
                        textAlign: "center",
                        marginBottom: "20px",
                    }}
                >
                    <ApprovalTable
                        approvalLines={documentData.workFlow?.approvals || []}
                        handleApprovalClick={handleApprovalAction} // 결재 버튼 클릭 핸들러 전달
                    />
                </Box>

                {/* 문서 상세 테이블 */}
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

                {/* 메시지 입력 모달 */}
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