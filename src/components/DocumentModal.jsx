import React, { useEffect, useState } from "react";
import axios from "axios";
import { useTheme, Box, Modal, Typography, Table, TableBody, TableCell, TableRow, IconButton, Button } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import RewirteDocumentForm from './RewriteDocumentForm'; // RewirteDocumentForm 임포트
import ApprovalTable from "./ApprovalTable";
import getEmployee from "../request/GetEmployee";
import Swal from "sweetalert2";
import { tokens } from "../theme";

const DocumentModal = ({ documentId, handleClose, fetchDocuments }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const mode = theme.palette.mode; 
    const [documentData, setDocumentData] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [isOpen, setIsOpen] = useState(true);
    const [openRewirteDocumentForm, setOpenRewirteDocumentForm] = useState(false); // RewirteDocumentForm 열림 상태 관리

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await axios.get("http://localhost:8081/employees/my-info", {
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
            const response = await axios.get(`http://localhost:8082/documents/${documentId}`);
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
            approval => approval.approvalOrder === documentData.workFlow.currentStep + 1
        );

        if (currentApprover && currentApprover.employeeId === userInfo.employeeId) {
            setOpenMessageModal(true);
        } else {
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
        setOpenRewirteDocumentForm(true); // RewirteDocumentForm 열기
    };

    const handleCloseRewirteDocumentForm = () => {
        setOpenRewirteDocumentForm(false); // RewirteDocumentForm 닫기
        fetchDocumentData(); // 문서 데이터 갱신
    };

    const handleCloseModal = async () => {
        await fetchDocumentData();
        handleClose();
    };

    return (
        <Modal open={isOpen} onClose={handleCloseModal}>
            <Box sx={{
                width: "80%",
                maxHeight: "80vh",
                overflow: "auto",
                padding: 4,
                backgroundColor: mode === 'dark' ? "#434957" : theme.palette.background.paper, 
                color: mode === 'dark' ? theme.palette.text.primary : 'black',
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

                {/* 다시작성 버튼 */}
                {documentData.author === userInfo.name && documentData.documentStatus === 'DRAFT' && (
                    <Button
                        variant="contained"
                        onClick={handleReWrite}
                        sx={{ position: "absolute", top: 16, right: 80 }}
                    >
                        다시 작성
                    </Button>
                )}

                {/* RewirteDocumentForm 렌더링 */}
                {openRewirteDocumentForm && (
                    <RewirteDocumentForm
                        open={openRewirteDocumentForm}
                        handleClose={handleCloseRewirteDocumentForm}
                        initialData={documentData}
                        fetchDocuments={fetchDocumentData} // 필요에 따라 문서 목록 갱신 함수 전달
                    />
                )}

                <Box sx={{ mb: 6 }} />
                <Box sx={{ display: "block", position: "left", width: "15em", textAlign: "center", marginBottom: "20px" }}>
                    <ApprovalTable
                        approvalLines={documentData.workFlow?.approvals || []}
                        handleApprovalClick={handleApprovalAction}
                    />
                </Box>

                <Table sx={{ borderCollapse: "collapse", width: "100%" }}>
                    <TableBody>
                        {/* 문서 정보 표시 */}
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

                        {/* 커스텀 필드 표시 */}
                        {documentData.customFields &&
                            Object.keys(documentData.customFields).map((field, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`, fontWeight: "bold", color: mode === 'dark' ? 'white' : 'black' }}>{field}</TableCell>
                                    <TableCell colSpan={3} sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`, color: mode === 'dark' ? 'white' : 'black' }}>
                                        {documentData.customFields[field]}
                                    </TableCell>
                                </TableRow>
                            ))}

                        {/* 문서 내용 표시 */}
                        <TableRow>
                            <TableCell sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`, fontWeight: "bold", color: mode === 'dark' ? 'white' : 'black' }}>내용</TableCell>
                            <TableCell colSpan={3} sx={{ border: `1px solid ${mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[300]}`, color: mode === 'dark' ? 'white' : 'black' }}>
                                {documentData.content}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </Box>
        </Modal>
    );
};

export default DocumentModal;
