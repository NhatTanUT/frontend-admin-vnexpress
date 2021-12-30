import axios from 'axios';
import * as Yup from 'yup';
import { useSnackbar } from 'notistack5';
import { useCallback, useState, useEffect } from 'react';
import { Form, FormikProvider, useFormik } from 'formik';
// material
import { LoadingButton } from '@material-ui/lab';
import { styled } from '@material-ui/core/styles';
import {
  Card,
  Grid,
  Chip,
  Stack,
  Button,
  Switch,
  TextField,
  Typography,
  Autocomplete,
  FormHelperText,
  FormControlLabel
} from '@material-ui/core';
// utils
import fakeRequest from '../../../utils/fakeRequest';
//
import { QuillEditor } from '../../editor';
import { UploadSingleFile } from '../../upload';
//
import BlogNewPostPreview from './BlogNewPostPreview';

// ----------------------------------------------------------------------

let CATEGORY_OPTION = [];
let CATEGORY_LIST = [];

const LabelStyle = styled(Typography)(({ theme }) => ({
  ...theme.typography.subtitle2,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1)
}));

async function uploadToServer(sourceUrl) {
  // first get our hands on the local file
  const localFile = await fetch(sourceUrl);
  console.log(localFile);
  // then create a blob out of it (only works with RN 0.54 and above)
  const fileBlob = await localFile.blob();
  console.log(fileBlob);
  const bodyFormData = new FormData();
  bodyFormData.append('img', fileBlob);
  // then send this blob to filestack
  const serverRes = await fetch('http://localhost:4000/api/post/', {
    // Your POST endpoint
    method: 'POST',
    headers: {
      'Content-Type': fileBlob && fileBlob.type
    },
    body: bodyFormData // This is your file object
  });

  const serverJsonResponse = await serverRes.json();

  // yay, let's print the result
  console.log(`Server said: ${JSON.stringify(serverJsonResponse)}`);
}

// ----------------------------------------------------------------------

export default function BlogNewPostForm() {
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    axios
      .get('http://localhost:7000/api/post/getListCategory')
      .then((response) => {
        const newList = [];
        response.data.categories.map((e) => {
          e.children.map((el) => {
            newList.push({ name: el.name, _id: el._id });
            return '';
          });

          newList.push({ name: e.name, _id: e.parentId.split(',')[1] });
          return '';
        });
        CATEGORY_OPTION = newList;

        CATEGORY_LIST = CATEGORY_OPTION.map((el) => `${el._id} ${el.name}`);
        // console.log(CATEGORY_LIST);
      })
      .catch((error) => {
        // handle error
        console.log(error);
      });
  }, []);

  const handleOpenPreview = () => {
    setOpen(true);
  };

  const handleClosePreview = () => {
    setOpen(false);
  };

  const NewBlogSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    content: Yup.string().required('Content is required'),
    cover: Yup.mixed().required('Cover is required')
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
      lead: '',
      content: '',
      cover: null,
      tags: [''],
      publish: true,
      comments: true,
      metaTitle: '',
      metaDescription: '',
      metaKeywords: ['Logan']
    },
    validationSchema: NewBlogSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        console.log(values);
        const bodyFormData = new FormData();
        bodyFormData.append('title', values.title);
        bodyFormData.append('categoryId', values.tags.split(' ')[0]);
        bodyFormData.append('lead', values.lead);
        bodyFormData.append('content', values.content);
        bodyFormData.append('img', values.cover.file);

        // await uploadToServer(values.cover.preview);
        axios
          .post('http://localhost:4000/api/post/', bodyFormData)
          .then((response) => {
            // handle success
            console.log(response);
          })
          .catch((error) => {
            // handle error
            console.log(error);
          });
        // await fakeRequest(500);
        // resetForm();
        // handleClosePreview();
        // setSubmitting(false);
        // enqueueSnackbar('Post success', { variant: 'success' });
      } catch (error) {
        console.error(error);
        setSubmitting(false);
      }
    }
  });

  const { errors, values, touched, handleSubmit, isSubmitting, setFieldValue, getFieldProps } = formik;

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setFieldValue('cover', {
          file,
          preview: URL.createObjectURL(file)
        });
      }
    },
    [setFieldValue]
  );

  const handleSubmit1 = (e) => {
    e.preventDefault();
    console.log(e.target.title.value);
    console.log(e.target.description.value);
    console.log(e.target.querySelector('.ql-editor').innerHTML);
    // console.log(e.target.cover.value);
  };

  return (
    <>
      <FormikProvider value={formik}>
        <Form noValidate autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Post Title"
                    {...getFieldProps('title')}
                    error={Boolean(touched.title && errors.title)}
                    helperText={touched.title && errors.title}
                  />

                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={5}
                    label="Description"
                    {...getFieldProps('description')}
                    error={Boolean(touched.description && errors.description)}
                    helperText={touched.description && errors.description}
                  />

                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={5}
                    label="Lead"
                    {...getFieldProps('lead')}
                    error={Boolean(touched.lead && errors.lead)}
                    helperText={touched.lead && errors.lead}
                  />

                  <div>
                    <LabelStyle>Content</LabelStyle>
                    <QuillEditor
                      id="post-content"
                      value={values.content}
                      onChange={(val) => setFieldValue('content', val)}
                      error={Boolean(touched.content && errors.content)}
                    />
                    {touched.content && errors.content && (
                      <FormHelperText error sx={{ px: 2, textTransform: 'capitalize' }}>
                        {touched.content && errors.content}
                      </FormHelperText>
                    )}
                  </div>

                  <div>
                    <LabelStyle>Thumbnail</LabelStyle>
                    <UploadSingleFile
                      maxSize={3145728}
                      accept="image/*"
                      file={values.cover}
                      onDrop={handleDrop}
                      error={Boolean(touched.cover && errors.cover)}
                    />
                    {touched.cover && errors.cover && (
                      <FormHelperText error sx={{ px: 2 }}>
                        {touched.cover && errors.cover}
                      </FormHelperText>
                    )}
                  </div>
                </Stack>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={3}>
                  {/* <div>
                    <FormControlLabel
                      control={<Switch {...getFieldProps('publish')} checked={values.publish} />}
                      label="Publish"
                      labelPlacement="start"
                      sx={{ mb: 1, mx: 0, width: '100%', justifyContent: 'space-between' }}
                    />

                    <FormControlLabel
                      control={<Switch {...getFieldProps('comments')} checked={values.comments} />}
                      label="Enable comments"
                      labelPlacement="start"
                      sx={{ mx: 0, width: '100%', justifyContent: 'space-between' }}
                    />
                  </div> */}

                  <Autocomplete
                    // multiple
                    freeSolo
                    // value={values.tags}
                    disableClearable
                    onChange={(event, newValue) => {
                      setFieldValue('tags', newValue);
                    }}
                    options={CATEGORY_LIST.map((option) => option)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip key={option} size="small" label={option} {...getTagProps({ index })} />
                      ))
                    }
                    renderInput={(params) => <TextField {...params} label="CategoryId" />}
                  />

                  {/* <TextField fullWidth label="Meta title" {...getFieldProps('metaTitle')} />

                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={5}
                    label="Meta description"
                    {...getFieldProps('metaDescription')}
                  />

                  <Autocomplete
                    multiple
                    freeSolo
                    value={values.tags}
                    onChange={(event, newValue) => {
                      setFieldValue('metaKeywords', newValue);
                    }}
                    options={TAGS_OPTION.map((option) => option)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip key={option} size="small" label={option} {...getTagProps({ index })} />
                      )) 
                    }
                    renderInput={(params) => <TextField {...params} label="Meta keywords" />}
                  /> */}
                </Stack>
              </Card>

              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button
                  fullWidth
                  type="button"
                  color="inherit"
                  variant="outlined"
                  size="large"
                  onClick={handleOpenPreview}
                  sx={{ mr: 1.5 }}
                >
                  Preview
                </Button>
                <LoadingButton fullWidth type="submit" variant="contained" size="large" loading={isSubmitting}>
                  Post
                </LoadingButton>
              </Stack>
            </Grid>
          </Grid>
        </Form>
      </FormikProvider>

      <BlogNewPostPreview formik={formik} openPreview={open} onClosePreview={handleClosePreview} />
    </>
  );
}
