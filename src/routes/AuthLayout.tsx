import { FC, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAccessToken } from '@/utils/common';
import { routePath } from '@/routes/routePath';

interface IProps {
  children: JSX.Element;
  isPrivate: boolean;
}

const AuthLayout: FC<IProps> = ({ children, isPrivate }: IProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const accessToken = getAccessToken();

  useEffect(() => {
    const isLogin = accessToken;
    if (isPrivate) {
      if (!isLogin) {
        navigate(routePath.LOGIN);
      }
    } else if (isLogin) {
      let path = '/';
      const arrNoAuth = [routePath.LOGIN];
      if (pathname && arrNoAuth.indexOf(pathname) <= -1) {
        path = pathname;
      }
      navigate(path);
    }
  }, [accessToken, isPrivate]);

  return children;
};

export default AuthLayout;
