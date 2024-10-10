import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { Box, Button, useTheme, TextField, useMediaQuery } from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import axios from 'axios';
import { tokens } from "../../theme";

const initialValues = {
  email: "",
  title: "",
  address1: "",
  address2: "",
  content: ""
};

const checkoutSchema = yup.object().shape({
  email: yup.string(),
  title: yup.string(),
  address1: yup.string(),
  address2: yup.string(),
  content: yup.string()
});

const MailWrite = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const quillRef = useRef(null);

  const handleFormSubmit = async (values, actions) => {
    try {
      const quillContent = quillRef.current.root.innerHTML;
      const updatedValues = { ...values, content: quillContent };

      const response = await axios.post('API_ENDPOINT_HERE', updatedValues);
      console.log(response.data);
      actions.resetForm({ values: initialValues });
      alert("메일이 성공적으로 전송되었습니다.");
    } catch (error) {
      console.error("메일 전송 중 오류 발생: ", error);
      alert("메일 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  useEffect(() => {
    if (quillRef.current) {
      const quill = new Quill(quillRef.current, {
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

      const toolbar = quillRef.current.previousElementSibling;
      if (toolbar) {
        toolbar.style.display = 'flex';
        toolbar.style.flexWrap = 'nowrap';
        toolbar.style.justifyContent = 'flex-start';
        toolbar.style.width = '100%'; // 툴바 너비를 본문에 맞춤

        const buttons = toolbar.querySelectorAll('.ql-formats');
        buttons.forEach((button) => {
          button.style.display = 'flex';
          button.style.flexDirection = 'row';
          button.style.alignItems = 'center';
          button.style.marginRight = '10px';
        });
      }
    }
  }, []);

  return (
      <Box m="20px">
        <Header title="메일 쓰기" subtitle="" />

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
                <Box
                    display="grid"
                    gap="20px"
                    gridTemplateColumns="repeat(12, 1fr)"
                    sx={{
                      "& > div": {
                        gridColumn: isNonMobile ? undefined : "span 12",
                      },
                    }}
                >
                  <TextField
                      fullWidth
                      variant="outlined"
                      type="text"
                      label="받는 사람"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.email}
                      name="email"
                      error={touched.email && Boolean(errors.email)}
                      helperText={touched.email && errors.email}
                      sx={{ gridColumn: "span 12" }}
                  />
                  <TextField
                      fullWidth
                      variant="outlined"
                      type="text"
                      label="참조"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.address1}
                      name="address1"
                      error={touched.address1 && Boolean(errors.address1)}
                      helperText={touched.address1 && errors.address1}
                      sx={{ gridColumn: "span 12" }}
                  />
                  <TextField
                      fullWidth
                      variant="outlined"
                      type="text"
                      label="숨은 참조"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.address2}
                      name="address2"
                      error={touched.address2 && Boolean(errors.address2)}
                      helperText={touched.address2 && errors.address2}
                      sx={{ gridColumn: "span 12" }}
                  />
                  <TextField
                      fullWidth
                      variant="outlined"
                      type="text"
                      label="제목"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.title}
                      name="title"
                      error={touched.title && Boolean(errors.title)}
                      helperText={touched.title && errors.title}
                      sx={{ gridColumn: "span 12" }}
                  />
                  <Box
                      display="flex"
                      alignItems="center"
                      gap="10px"
                      sx={{ gridColumn: "span 12", mb: 2 }}
                  >
                    <Button variant="contained" color="secondary" component="label" startIcon={<AttachFileIcon />}>
                      파일첨부
                      <input type="file" hidden />
                    </Button>
                  </Box>
                  {/* Quill Editor Box */}
                  <Box sx={{ gridColumn: "span 12", width: "100%" }}>
                    <div id="toolbar"></div> {/* 툴바 영역 */}
                    <Box
                        id="editor-container"
                        ref={quillRef}
                        sx={{
                          height: "300px",
                          border: "1px solid #ccc",
                          borderRadius: "5px",
                          mt: "-10px",
                          width: "100%",
                        }}
                    />
                  </Box>
                </Box>
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-end"
                    gap="10px"
                    mt="20px"
                >
                  <Button type="submit" color="third" variant="contained">
                    임시저장
                  </Button>
                  <Button type="submit" color="third" variant="contained">
                    보내기
                  </Button>
                </Box>
              </form>
          )}
        </Formik>
      </Box>
  );
};

export default MailWrite;
