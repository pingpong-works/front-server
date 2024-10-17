import React, { useState, useEffect } from 'react';
import axios from "axios";
import { Button, Box, IconButton, Modal, Typography, List, ListItem, ListItemText, ListItemIcon, Checkbox, colors, useTheme } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { tokens } from "../theme";

const OrganizationChart = ({ selectedEmployee, setSelectedEmployee }) => {
    const [departmentList, setDepartmentList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    useEffect(() => {
        getDepartmentList();
    }, []);

    const getDepartmentList = () => {
        setIsLoading(true);
        axios.get("http://localhost:8081/departments/all")
            .then(res => {
                if (Array.isArray(res.data)) {
                    setDepartmentList(res.data);
                } else {
                    console.error("Received data is not an array:", res.data);
                    setDepartmentList([]);
                }
            })
            .catch(err => {
                console.error("Failed to fetch department list:", err);
                setDepartmentList([]);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const getEmployeeList = (departmentId) => {
        axios.get(`http://localhost:8081/user/employees/departments/${departmentId}`, {
            params: {
                page: 1,
                size: 10
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            }
        })
            .then(res => {
                if (res.data && Array.isArray(res.data.data)) {
                    setEmployeeList(res.data.data); 
                    setFilteredEmployees(res.data.data); 
                }
            })
            .catch(err => {
                console.error("Failed to fetch employee list:", err);
            });
    };

    const handleDepartmentSelect = (departmentId) => {
        setSelectedDepartment(departmentId);
        getEmployeeList(departmentId); 
    };

    const handleEmployeeSelect = (employee) => {
        setSelectedEmployee(employee); 
    };

    if (isLoading) {
        return <Typography>Loading departments...</Typography>;
    }

    if (!Array.isArray(departmentList) || departmentList.length === 0) {
        return <Typography>No departments available.</Typography>;
    }

    return (
        <Box sx={{ display: 'flex', p: 2, gap: 2, height: '90%'}}>
            <Box sx={{ flex: 1, bgcolor:  colors.gray[800], borderRadius: 1, p: 2, boxShadow: 1, overflowY: 'auto' }}>
                <Typography variant="h6" gutterBottom>부서 목록</Typography>
                <List>
                    {departmentList.map((department) => (
                        <ListItem
                            button
                            key={department.id}
                            onClick={() => handleDepartmentSelect(department.id)}
                            sx={{
                                py: 1,
                                bgcolor: selectedDepartment === department.id ? colors.gray[350] : 'transparent',
                                borderRadius: 1,
                                '&:hover': {
                                    bgcolor: colors.gray[350]
                                }
                            }}
                        >
                            <ListItemText primary={department.name} />
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Box sx={{ flex: 2, bgcolor: colors.gray[800], borderRadius: 1, p: 2, boxShadow: 1, overflowY: 'auto' }}>
                <Typography variant="h6" gutterBottom>직원 리스트</Typography>

                <List>
                    {filteredEmployees.length > 0 ? (
                        filteredEmployees.map(employee => (
                            <ListItem
                                key={employee.employeeId}
                                button
                                onClick={() => handleEmployeeSelect(employee)}
                                sx={{
                                    bgcolor: selectedEmployee?.employeeId === employee.employeeId ? colors.gray[350]: 'transparent',
                                    '&:hover': {
                                        bgcolor: colors.gray[350]
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    <Checkbox
                                        checked={selectedEmployee?.employeeId === employee.employeeId}
                                        onChange={() => handleEmployeeSelect(employee)}
                                    />
                                </ListItemIcon>
                                <ListItemText
                                    primary={employee.name}
                                    secondary={`${employee.employeeRank} - ${employee.departmentName} - ${employee.email}`}
                                />
                            </ListItem>
                        ))
                    ) : (
                        <Typography variant="body2" color="textSecondary">직원이 없습니다</Typography>
                    )}
                </List>
            </Box>

            <Box sx={{ flex: 2, bgcolor: colors.gray[800], borderRadius: 1, p: 2, boxShadow: 1, overflowY: 'auto' }}>
                <Typography variant="h6" gutterBottom>선택된 직원 정보</Typography>
                {selectedEmployee ? (
                    <Box
                        key={selectedEmployee.employeeId}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            py: 1,
                            px: 1,
                            mb: 2,
                            borderRadius: 2,
                            bgcolor: colors.primary[400],
                            borderLeft: '5px solid #ffd454',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            '&:hover': {
                                bgcolor: colors.gray[350]
                            }
                        }}
                    >
                        <IconButton onClick={() => setSelectedEmployee(null)}>
                            <CloseIcon />
                        </IconButton>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{selectedEmployee.name}</Typography>
                            <Typography variant="body2" color="textSecondary">직급: {selectedEmployee.employeeRank}</Typography>
                            <Typography variant="body2" color="textSecondary">이메일: {selectedEmployee.email}</Typography>
                            <Typography variant="body2" color="textSecondary">부서: {selectedEmployee.departmentName}</Typography>
                            <Typography variant="body2" color="textSecondary">입사일: {selectedEmployee.createdAt ? selectedEmployee.createdAt : '정보 없음'}</Typography>
                        </Box>
                    </Box>
                ) : (
                    <Typography variant="body2" color="textSecondary">직원을 선택하세요</Typography>
                )}
            </Box>
        </Box>
    );
};

const GroupModal = ({ open, onClose, onSelect }) => {
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const handleSave = () => {
        if (selectedEmployee) {
            console.log(selectedEmployee)
            onSelect(selectedEmployee); // 선택된 직원 상위로 전달
        }
        handleClose();
    };

    const handleClose = () => {
        setSelectedEmployee(null); 
        onClose();
    };

    if (!open) return null;

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80%',
                height: '80%',
                boxShadow: 24,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
            }}>
                <IconButton
                    sx={{ position: 'absolute', top: 16, right: 16 }}
                    onClick={handleClose}
                >
                    <CloseIcon />
                </IconButton>

                <OrganizationChart
                    selectedEmployee={selectedEmployee}
                    setSelectedEmployee={setSelectedEmployee}
                />

                <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" onClick={handleSave}>저장</Button>
                    <Button variant="outlined" onClick={handleClose}>취소</Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default GroupModal;
