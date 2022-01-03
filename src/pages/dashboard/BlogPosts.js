import axios from 'axios';
import { orderBy } from 'lodash';
import { Icon } from '@iconify/react';
import plusFill from '@iconify/icons-eva/plus-fill';
import { Link as RouterLink } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useEffect, useCallback, useState } from 'react';
// material
import { Box, Grid, Button, Skeleton, Container, Stack } from '@material-ui/core';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getPostsInitial, getMorePosts } from '../../redux/slices/blog';
// hooks
import useSettings from '../../hooks/useSettings';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { BlogPostCard, BlogPostsSort, BlogPostsSearch } from '../../components/_dashboard/blog';

// ----------------------------------------------------------------------

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  // { value: 'popular', label: 'Popular' },
  { value: 'oldest', label: 'Oldest' }
];

const CATEGORY_LIST = [
  {
    value: 'thoi-su',
    label: 'Thời sự'
  },
  {
    value: 'goc-nhin',
    label: 'Góc nhìn'
  },
  {
    value: 'the-gioi',
    label: 'Thế giới'
  },
  {
    value: 'khoa-hoc',
    label: 'Khoa học'
  },
  {
    value: 'phap-luat',
    label: 'Pháp luật'
  },
  {
    value: 'giao-duc',
    label: 'Giáo dục'
  },
  {
    value: 'y-kien',
    label: 'Ý kiến'
  }
];

const CATEGORY_NAME = ['Thời sự', 'Góc nhìn', 'Thế giới', 'Khoa học', 'Pháp luật', 'Giáo dục', 'Ý kiến'];

// ----------------------------------------------------------------------

const applySort = (posts, sortBy) => {
  if (sortBy === 'latest') {
    return orderBy(posts, ['createdAt'], ['desc']);
  }
  if (sortBy === 'oldest') {
    return orderBy(posts, ['createdAt'], ['asc']);
  }
  // if (sortBy === 'popular') {
  //   return orderBy(posts, ['view'], ['desc']);
  // }
  // if (CATEGORY_NAME.includes(sortBy)) {
  //   return posts;
  // }
  return posts;
};

const SkeletonLoad = (
  <Grid container spacing={3} sx={{ mt: 2 }}>
    {[...Array(4)].map((_, index) => (
      <Grid item xs={12} md={3} key={index}>
        <Skeleton variant="rectangular" width="100%" sx={{ height: 200, borderRadius: 2 }} />
        <Box sx={{ display: 'flex', mt: 1.5 }}>
          <Skeleton variant="circular" sx={{ width: 40, height: 40 }} />
          <Skeleton variant="text" sx={{ mx: 1, flexGrow: 1 }} />
        </Box>
      </Grid>
    ))}
  </Grid>
);

export default function BlogPosts() {
  const { themeStretch } = useSettings();
  const dispatch = useDispatch();
  const [filters, setFilters] = useState('latest');
  const [posts1, setPosts1] = useState([]);
  const { posts, hasMore, index, step } = useSelector((state) => state.blog);
  const sortedPosts = applySort(posts1, filters);
  const onScroll = useCallback(() => dispatch(getMorePosts()), [dispatch]);

  useEffect(() => {
    dispatch(getPostsInitial(index, step));
  }, [dispatch, index, step]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get('http://localhost:7000/api/post/getAllPosts100');
      // console.log(response.data.posts);
      setPosts1(response.data.posts);
    };
    fetchData();
  }, []);

  const handleChangeSort = (event) => {
    setFilters(event.target.value);
  };

  const handleChooseCategory = (event) => {
    console.log(event.target.value);
    const fetchData = async () => {
      const response = await axios.get(`http://localhost:7000/api/post/getPostsByCategory50/${event.target.value}`);
      // console.log(response.data.posts);
      setPosts1(response.data.posts);
    };
    fetchData();
  };

  return (
    <Page title="Blog: Posts | Minimal-UI">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading="Blog"
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'Blog', href: PATH_DASHBOARD.blog.root },
            { name: 'Posts' }
          ]}
          action={
            <Button
              variant="contained"
              component={RouterLink}
              to={PATH_DASHBOARD.blog.newPost}
              startIcon={<Icon icon={plusFill} />}
            >
              New Post
            </Button>
          }
        />

        <Stack mb={5} direction="row" alignItems="center" justifyContent="space-between">
          <BlogPostsSearch />
          <BlogPostsSort options={CATEGORY_LIST} onSort={handleChooseCategory} />
          <BlogPostsSort query={filters} options={SORT_OPTIONS} onSort={handleChangeSort} />
        </Stack>

        <InfiniteScroll
          next={onScroll}
          hasMore={hasMore}
          loader={SkeletonLoad}
          dataLength={posts.length}
          style={{ overflow: 'inherit' }}
        >
          {/* {console.log(hasMore, posts)} */}
          <Grid container spacing={3}>
            {sortedPosts.map((post, index) => (
              <BlogPostCard key={post._id} post={post} index={index} />
            ))}
          </Grid>
        </InfiniteScroll>
      </Container>
    </Page>
  );
}
