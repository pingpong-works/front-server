import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Modal, Typography, Table, TableBody, TableCell, TableRow, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';  
import ApprovalTable from "./ApprovalTable";  
import getEmployee from "../request/GetEmployee";

const DocumentModal = ({ documentId, handleClose }) => {
    const [documentData, setDocumentData] = useState(null);  
    const [isLoading, setIsLoading] = useState(false); 

    const fetchDocumentData = async () => {
        if (!documentId) {
            console.error("문서 ID가 올바르게 전달되지 않았습니다.");
            return;
        }

        try {
            const response = await axios.get(`http://localhost:50001/documents/${documentId}`);
            const data = response.data.data;

            if (data) {
                const approvals = data.workFlow.approvals;

                const approvalsWithInfo = await Promise.all(approvals.map(async (approval) => {
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
        fetchDocumentData();
    }, [documentId]);

    if (!documentData) return null;

    return (
        <Modal open={true} onClose={handleClose}>
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

            {/* 결재 라인과 문서 테이블 간의 간격 조정 */}
            <Box sx={{ mb: 6 }} />

            {/* 결재 라인 */}
            <Box 
                sx={{ 
                    display: "block",   // flex가 아닌 block으로 변경하여 겹치지 않도록
                    position: "left",
                    width: "15em",
                    textAlign: "center",
                    marginBottom: "20px", 
                    
                }}
            >
                <ApprovalTable approvalLines={documentData.workFlow?.approvals || []} />
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
        </Box>
    </Modal>
    );
};

export default DocumentModal;
