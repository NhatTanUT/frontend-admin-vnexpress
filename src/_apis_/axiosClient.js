import { ContactlessOutlined } from '@mui/icons-material';
import axios from 'axios';

const baseURL = {
  query: 'http://localhost:7000/api',
  user: 'http://localhost:5000/api',
  auth: 'http://localhost:10000/api',
  comment: 'http://localhost:8000/api',
  post: 'http://localhost:4000/api'
};

const axiosInstance = axios.create({
  headers: { 'content-type': 'application/json' }
});

axiosInstance.interceptors.request.use(
  (req) => {
    const token = window.localStorage.getItem('accessToken');
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  function error() {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const code = error.response.status;
    const msg = error.response.data?.msg;
    if (code && code === 401) {
      if (msg && msg === 'jwt expired') {
        // console.log('this is case expired token case')
        // this is expired token case
        const { config } = error.response;
        // step 1 : retrieve new token from refresh token
        const newAccessToken = await refreshToken();
        if (newAccessToken) {
          config.headers.Authorization = `Bearer ${newAccessToken}`;
          // step 2 : store in local storage
          await window.localStorage.setItem('accessToken', newAccessToken);
          // step 3 : resend the request
          return axiosInstance(config);
        }
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
const refreshToken = async () => {
  const refreshToken = window.localStorage.getItem('refreshToken');
  if (!refreshToken) {
    return false;
  }
  const res = await axiosInstance.post(`${baseURL.auth}/auth/refreshToken`, {
    refreshToken
  });
  const { data } = res;
  const { newAccessToken } = data;
  return newAccessToken;
};

export { axiosInstance, baseURL };
