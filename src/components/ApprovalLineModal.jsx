import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableRow, TableCell } from '@mui/material';

const ApprovalLineModal = ({ open, handleClose, onSubmit }) => {
    const [selectedApprovals, setSelectedApprovals] = useState([
        { name: '이대리', position: '디자인팀 대리' },
        { name: '김과장', position: '인사팀 과장' },
        { name: '박부장', position: '디자인팀 부장' }
    ]);

    // 결재라인 설정 완료 시 처리
    const handleConfirm = () => {
        onSubmit(selectedApprovals);  // 선택된 결재라인 전달
        handleClose();  // 모달 닫기
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>결재라인 설정</DialogTitle>
            <DialogContent>
                <Table>
                    <TableBody>
                        {selectedApprovals.map((approver, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{approver.position}</TableCell>
                                <TableCell>{approver.name}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleConfirm} color="primary">확인</Button>
                <Button onClick={handleClose} color="secondary">취소</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ApprovalLineModal;
