import React from "react";
import { Table, TableBody, TableRow, TableCell, TableHead, Typography, Box } from "@mui/material";

const ApprovalTable = ({ approvalLines }) => {
    return (
        <Table sx={{ border: "1px solid #000", width: "100%" }}>
            <TableHead>
                <TableRow>
                    {approvalLines && approvalLines.length > 0 ? (
                        approvalLines.map((approver, index) => (
                            <TableCell
                                key={index}
                                align="center"
                                sx={{ fontSize: '0.8rem', border: "1px solid #000" }} // 테두리 추가
                            >
                                <Typography variant="body1" sx={{ fontSize: '0.7rem' }}>
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
                                sx={{ border: "1px solid #000" }} // 테두리 추가
                            >
                                {/* 결재 상태 또는 추가 정보 */}
                                <Box
                                    sx={{
                                        width: '50px',
                                        height: '50px',
                                    }}
                                >
                                    {/* 승인/반려 표시 영역 */}
                                </Box>
                            </TableCell>
                        ))
                    ) : null}
                </TableRow>
                <TableRow>
                    {approvalLines && approvalLines.length > 0 ? (
                        approvalLines.map((approver, index) => (
                            <TableCell
                                key={index}
                                align="center"
                                sx={{ border: "1px solid #000" }} // 테두리 추가
                            >
                                <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                                    {approver.name}
                                </Typography> {/* 이름 */}
                            </TableCell>
                        ))
                    ) : null}
                </TableRow>
            </TableBody>
        </Table>
    );
};

export default ApprovalTable;
