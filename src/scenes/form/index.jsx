import { Box, Button, TextField, useMediaQuery } from "@mui/material";
import { Header } from "../../components";
import { Formik } from "formik";
import * as yup from "yup";

const initialValues = {
  email: "",
  title: "",
  address1: "",
  address2: "",
  content:""
};

const checkoutSchema = yup.object().shape({
  email: yup.string().email("invalid email").required("required"),
  title: yup
    .string()
    .required("required"),
  address1: yup.string().required("required"),
  address2: yup.string().required("required"),
  content: yup.string().required("required")
});

const Form = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const handleFormSubmit = (values, actions) => {
    console.log(values);
    actions.resetForm({
      values: initialValues,
    });
  };

  return (
    <Box m="20px">
      <Header title="메일 쓰기" subtitle="Create a New Mail" />

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
              gridTemplateColumns="2fr 5fr"
              sx={{
                "& > div": {
                  gridColumn: isNonMobile ? undefined : "span 12",
                },
              }}
            >
              <Box display="grid" gap="20px" gridTemplateColumns="1fr" sx={{ gridColumn: "span 7" }}>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={touched.email && errors.email}
                helperText={touched.email && errors.email}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="제목"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.title}
                name="title"
                error={touched.title && errors.title}
                helperText={touched.title && errors.title}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="참조자"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address1}
                name="address1"
                error={touched.address1 && errors.address1}
                helperText={touched.address1 && errors.address1}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="숨은 참조"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.address2}
                name="address2"
                error={touched.address2 && errors.address2}
                helperText={touched.address2 && errors.address2}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="메일 내용"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.content}
                name="content"
                error={touched.content && errors.content}
                helperText={touched.content && errors.content}
                multiline
                rows={20}
              />
            </Box>
          </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="end"
              mt="20px"
            >
              <Button type="submit" color="secondary" variant="contained">
                전송
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default Form;
