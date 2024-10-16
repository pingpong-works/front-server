import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  useTheme
} from '@mui/material';

const DocumentSummaryWithButtons = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeName, setEmployeeName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const theme = useTheme();

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get("http://localhost:8081/employees/my-info", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      const { employeeId, name, email } = response.data.data;
      setEmployeeId(employeeId);
      setEmployeeName(name);
      setIsAdmin(email === 'admin@pingpong-works.com'); // 관리자 여부 체크
    } catch (error) {
      console.error("로그인된 사용자 정보를 가져오는 중 오류 발생:", error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:8082/documents', {
        params: {
          page: 1,
          size: 10
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const documentList = response.data.data || [];
      setDocuments(documentList);
      filterDocuments(documentList);
    } catch (error) {
      console.error('문서 데이터를 가져오는 중 오류 발생:', error);
    }
  };

  // 필터링 로직
  const filterDocuments = (documentList) => {
    let filtered = documentList;

    if (!isAdmin) {
      // 관리자가 아닐 경우 작성자 또는 승인자로 필터링
      filtered = filtered.filter(doc =>
        doc.author === employeeName ||
        (doc.workFlow && doc.workFlow.approvals &&
          doc.workFlow.approvals.some(approval => approval.employeeId === employeeId))
      );
    }

    setFilteredDocuments(filtered);
  };

  useEffect(() => {
    fetchUserInfo();
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments(documents);
  }, [employeeName, employeeId, isAdmin]);

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper} sx={{ maxHeight: 250, overflow: 'auto', width: '100%' }}>
        <Table stickyHeader sx={{ tableLayout: 'auto', width: '100%' }}>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontSize: '0.75rem', padding: '2px', width: '20%' }}>
                종류
              </TableCell>
              <TableCell align="center" sx={{ fontSize: '0.75rem', padding: '2px', width: '30%' }}>
                제목
              </TableCell>
              <TableCell align="center" sx={{ fontSize: '0.75rem', padding: '2px', width: '15%' }}>
                작성자
              </TableCell>
              <TableCell align="center" sx={{ fontSize: '0.75rem', padding: '2px', width: '20%' }}>
                상태
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDocuments.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell align="center">{doc.docsTypes?.type || 'N/A'}</TableCell>
                <TableCell align="center">{doc.title || '제목 없음'}</TableCell>
                <TableCell align="center">{doc.author}</TableCell>
                <TableCell align="center">
                  {doc.documentStatus === 'APPROVED' && (
                    <Typography color="blue" sx={{ fontSize: '0.7rem' }}>결재 완료</Typography>
                  )}
                  {doc.documentStatus === 'REJECTED' && (
                    <Typography color="red" sx={{ fontSize: '0.7rem' }}>반려</Typography>
                  )}
                  {doc.documentStatus === 'IN_PROGRESS' && (
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        color: theme.palette.mode === 'dark' ? 'white' : 'black'
                      }}
                    >결재 대기</Typography>
                  )}
                  {doc.documentStatus === 'DRAFT' && (
                    <Typography color="gray" sx={{ fontSize: '0.7rem' }}>임시 저장</Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DocumentSummaryWithButtons;
