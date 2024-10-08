import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableBody, TableRow, TableCell, Select, MenuItem, Box, List, ListItem, ListItemText } from '@mui/material';
import getEmployeesByDepartment from '../request/GetEmployeesByDepartment';
import getDepartments from '../request/GetDepartments';

const ApprovalLineModal = ({ open, handleClose, onSubmit }) => {
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedApprovals, setSelectedApprovals] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 부서 데이터 불러오기
    useEffect(() => {
        getDepartments((data) => {
            console.log('Departments:', data);  // 부서 데이터 확인
            setDepartments(data);
        }, setIsLoading);
    }, []);

    // 부서 선택 시 직원 데이터 불러오기
    const handleDepartmentSelect = async (departmentId) => {
        setIsLoading(true);
        try {
            await getEmployeesByDepartment(departmentId, 1, 20, (data) => {
                console.log('Employees data:', data);  // 직원 데이터 확인
                setEmployees(data);
            }, setIsLoading);
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 결재자 추가
    const handleAddApprover = (approver) => {
        setSelectedApprovals((prev) => [...prev, approver]);
    };

    // 결재라인 설정 완료
    const handleConfirm = () => {
        onSubmit(selectedApprovals);
        handleClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
            <DialogTitle>결재라인 설정</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Select
                            value={selectedDepartment}
                            onChange={(e) => {
                                const departmentId = e.target.value;
                                setSelectedDepartment(departmentId);
                                handleDepartmentSelect(departmentId);  // 부서 선택 시 직원 데이터 호출
                            }}
                            fullWidth
                        >
                            {departments.map((dept) => (
                                <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                            ))}
                        </Select>

                        {/* 직원 목록 리스트 */}
                        <List>
                            {employees.map((employee, index) => (
                                <ListItem
                                    key={employee.employeeId || `employee-${index}`}
                                    button
                                    onClick={() => handleAddApprover({ name: employee.name, position: employee.employeeRank })}
                                >
                                    <ListItemText primary={`${employee.name} (${employee.employeeRank})`} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    {/* 선택된 결재라인 표시 */}
                    <Box sx={{ flex: 1 }}>
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
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleConfirm} color="primary">확인</Button>
                <Button onClick={handleClose} color="secondary">취소</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ApprovalLineModal;
