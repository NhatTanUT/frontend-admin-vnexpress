import axios from 'axios';
import { useEffect, useState } from 'react';
import { paramCase } from 'change-case';
import { useParams, useLocation } from 'react-router-dom';
// material
import { Container } from '@material-ui/core';
// redux
import { useDispatch, useSelector } from '../../redux/store';
import { getUserList } from '../../redux/slices/user';

// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import UserNewForm from '../../components/_dashboard/user/UserNewForm';

// ----------------------------------------------------------------------
// Lười sửa nên để tạm biến name để lưu id nha mọi người.

export default function UserCreate() {
  const { themeStretch } = useSettings();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const { name } = useParams();
  const { userList } = useSelector((state) => state.user);
  const isEdit = pathname.includes('edit');
  // const currentUser = userList.find((user) => paramCase(user.name) === name);
  // console.log(name);
  const [currentUser, setCurrentUser] = useState({});
  useEffect(() => {
    async function fetchData() {
      let temp;
      try {
        const token = window.localStorage.getItem('accessToken');
        temp = await axios.get(`http://localhost:7000/api/user/getCurrentUser/${name}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCurrentUser(temp.data.user);
      } catch (error) {
        console.log(error);
      }
      // console.log(temp.data.user);
    }
    fetchData();
  }, []);

  useEffect(() => {
    dispatch(getUserList());
  }, [dispatch]);

  return (
    <Page title="User: Create a new user | Minimal-UI">
      <Container maxWidth={themeStretch ? false : 'lg'}>
        <HeaderBreadcrumbs
          heading={!isEdit ? 'Create a new user' : 'Edit user'}
          links={[
            { name: 'Dashboard', href: PATH_DASHBOARD.root },
            { name: 'User', href: PATH_DASHBOARD.user.root },
            { name: !isEdit ? 'New user' : name }
          ]}
        />

        <UserNewForm isEdit={isEdit} currentUser={currentUser} />
      </Container>
    </Page>
  );
}
