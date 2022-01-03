import { useEffect, useState } from 'react';
import { sentenceCase } from 'change-case';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import plusFill from '@iconify/icons-eva/plus-fill';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSnackbar } from 'notistack5';

import moment from 'moment';
import { Icon } from '@iconify/react';
import axios from 'axios';
// material
import { Box, Button, Card, Divider, Skeleton, Container, Typography, Pagination } from '@material-ui/core';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getPost, getRecentPosts } from '../../redux/slices/blog';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import Markdown from '../../components/Markdown';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import {
  BlogPostHero,
  BlogPostTags,
  BlogPostRecent,
  BlogPostCommentList,
  BlogPostCommentForm
} from '../../components/_dashboard/blog';

// ----------------------------------------------------------------------

const SkeletonLoad = (
  <>
    <Skeleton width="100%" height={560} variant="rectangular" sx={{ borderRadius: 2 }} />
    <Box sx={{ mt: 3, display: 'flex', alignItems: 'center' }}>
      <Skeleton variant="circular" width={64} height={64} />
      <Box sx={{ flexGrow: 1, ml: 2 }}>
        <Skeleton variant="text" height={20} />
        <Skeleton variant="text" height={20} />
        <Skeleton variant="text" height={20} />
      </Box>
    </Box>
  </>
);

export default function BlogPost() {
  const { themeStretch } = useSettings();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  // const dispatch = useDispatch();
  const { title } = useParams();
  const [new1, setNew1] = useState({});
  // const { post, error, recentPosts } = useSelector((state) => state.blog);

  // useEffect(() => {
  //   dispatch(getPost(title));
  //   dispatch(getRecentPosts(title));
  // }, [dispatch, title]);

  useEffect(() => {
    const fetchData = async () => {
      const temp = await axios.get(`http://localhost:7000/api/post/getPostBySlug/${title}`);
      console.log(temp.data);
      setNew1(temp.data.post);
    };
    fetchData();
  }, []);

  const handleClickDeletePost = async (event) => {
    try {
      const response = await axios.delete(`http://localhost:4000/api/post/${new1._id}`);
      if (response.data.success === true) {
        enqueueSnackbar('Delete post success', { variant: 'success' });
        navigate(`${PATH_DASHBOARD.blog.posts}`);
      } else {
        enqueueSnackbar("Can't find post", { variant: 'success' });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Page title="Blog: Post Details | Minimal-UI">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Post Details"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Blog', href: PATH_DASHBOARD.blog.root },
            { name: sentenceCase(title) }
          ]}
          action={
            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleClickDeletePost}>
              Delete Post
            </Button>
          }
        />

        <div className="wrapper_post">
          <div className="entity_title">
            <h1>
              <a href="#">{new1.title}</a>
            </h1>
          </div>
          {/* entity_title */}
          <div className="entity_meta">
            <a href="#">{moment(new1.createdAt).format('HH:mm [ngày] DD [tháng] MM')}</a>, Tác giả:
            <a href="#" target="_self">
              {' Tan Nguyen'}
            </a>
          </div>
          <div className="entity_content">
            <section
              id="post-details"
              className="not-found-controller"
              // onMouseUp={handleSelectedText}
              dangerouslySetInnerHTML={{ __html: new1.content }}
            />
          </div>
        </div>

        {/* {post && (
          <Card>
            <BlogPostHero post={post} />

            <Box sx={{ p: { xs: 3, md: 5 } }}>
              <Typography variant="h6" sx={{ mb: 5 }}>
                {post.description}
              </Typography>

              <Markdown children={post.body} />

              <Box sx={{ my: 5 }}>
                <Divider />
                <BlogPostTags post={post} />
                <Divider />
              </Box>

              <Box sx={{ display: 'flex', mb: 2 }}>
                <Typography variant="h4">Comments</Typography>
                <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
                  ({post.comments.length})
                </Typography>
              </Box>

              <BlogPostCommentList post={post} />

              <Box sx={{ mb: 5, mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Pagination count={8} color="primary" />
              </Box>

              <BlogPostCommentForm />
            </Box>
          </Card>
        )} */}

        {/* {!post && SkeletonLoad}

        {error && <Typography variant="h6">404 Post not found</Typography>} */}

        {/* {recentPosts.length > 0 && <BlogPostRecent posts={recentPosts} />} */}
      </Container>
    </Page>
  );
}
