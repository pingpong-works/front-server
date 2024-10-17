import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Box, Button, useTheme, TextField, useMediaQuery, Typography  } from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import axios from 'axios';
import { tokens } from "../../theme";
import { useNavigate } from 'react-router-dom';

// JWT 토큰에서 employeeId를 추출하는 함수
const getEmployeeIdFromSomeSource = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.error('로그인 토큰이 존재하지 않습니다.');
    return null;
  }

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const parsedToken = JSON.parse(jsonPayload);
    console.log('Parsed Token: ', parsedToken.employeeId); // JWT 페이로드를 로그로 출력하여 확인
    return parsedToken.employeeId; // JWT 토큰에서 employeeId 추출
  } catch (error) {
    console.error('토큰 디코딩 중 오류 발생: ', error);
    return null;
  }
};

const MailWrite = () => {
  const theme = useTheme();
  console.log("mailwrite진입..."); // 이 로그가 찍히는지 확인
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const quillRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        alert('로그인이 필요합니다.');
        navigate('/login');  // 로그인 페이지로 리다이렉트
    }
  }, [navigate]);

  const initialValues = {
    recipientEmail: "",
    subject: "",
    body: ""
  };

  const checkoutSchema = yup.object().shape({
    recipientEmail: yup.string().email("올바른 이메일 형식이어야 합니다.").required("받는 사람의 이메일이 필요합니다."),
    subject: yup.string().required("제목이 필요합니다."),
    body: yup.string()
  });

  const handleFormSubmit = async (values, actions) => {
    if (!quillRef.current) {
      alert("Quill 에디터가 초기화되지 않았습니다. 다시 시도해주세요.");
      return;
    }

    const quillContent = quillRef.current.querySelector(".ql-editor").innerHTML;
    // const updatedValues = { ...values, content: quillContent };
    values.body = quillContent;

    console.log("메일 전송 요청 시작..."); // 이 로그가 찍히는지 확인

    const employeeId = getEmployeeIdFromSomeSource(); // JWT 토큰에서 employeeId 가져오기
    if (!employeeId) {
      alert('로그인된 사용자 정보를 가져올 수 없습니다. employeeId가 정의되지 않았습니다.');
      return;
    }

    try {
      // 백엔드 API 호출
      const response = await axios.post(`http://localhost:8083/mail/send?employeeId=${employeeId}`, values);
      console.log('Email sent successfully', response.data);
      actions.resetForm({ values: initialValues });
      alert("메일이 성공적으로 전송되었습니다.");
    } catch (error) {
      console.error("메일 전송 중 오류 발생: ", error);
      alert("메일 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    if (quillRef.current) {
      new Quill(quillRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'font': [] }],
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['link', 'image', 'video'],
            ['clean']
          ]
        }
      });
    }
  }, [quillRef]);

  return (
      <Box m="20px">
        <Box mb={3}> 
          <Typography
              variant="h2"
              sx={{
              
                fontWeight: "bold", 
                color: "white", 
                marginBottom: "20px", 
              }}
          >
            메일 작성
          </Typography>
        </Box>
        <Box
        sx={{
          backgroundColor: theme.palette.mode === 'dark' ? '#b6cef9a4' : '#f5f5f5', 
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)' 
        }}
      >
        <Formik
            onSubmit={handleFormSubmit}
            initialValues={initialValues}
            validationSchema={checkoutSchema}
        >
          {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    variant="outlined"
                    type="text"
                    label="받는 사람"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.recipientEmail}
                    name="recipientEmail"
                    error={touched.recipientEmail && Boolean(errors.recipientEmail)}
                    helperText={touched.recipientEmail && errors.recipientEmail}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    variant="outlined"
                    type="text"
                    label="제목"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.subject}
                    name="subject"
                    error={touched.subject && Boolean(errors.subject)}
                    helperText={touched.subject && errors.subject}
                    sx={{ mb: 2 }}
                />
                {/*<TextField*/}
                {/*    fullWidth*/}
                {/*    variant="outlined"*/}
                {/*    type="body"*/}
                {/*    label="본문"*/}
                {/*    onBlur={handleBlur}*/}
                {/*    onChange={handleChange}*/}
                {/*    value={values.body}*/}
                {/*    name="body"*/}
                {/*    error={touched.body && Boolean(errors.body)}*/}
                {/*    helperText={touched.body && errors.body}*/}
                {/*    sx={{ mb: 2 }}*/}
                {/*/>*/}
                <Button variant="contained" component="label" startIcon={<AttachFileIcon />} sx={{ mb: 2, bgcolor: colors.blueAccent[500] }}>
                  파일첨부
                  <input type="file" hidden />
                </Button>

                {/* Quill Editor Container */}
                <div ref={quillRef} style={{ height: '300px', marginBottom: '20px', border: '1px solid #ccc', borderRadius: '5px' }} />

                <Box display="flex" alignItems="center" justifyContent="flex-end" gap="10px" mt="20px">
                  <Button type="submit" sx={{bgcolor:colors.gray[500]}} variant="contained">
                    임시저장
                  </Button>
                  <Button type="submit"  variant="contained">
                    보내기
                    </Button>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default MailWrite;
