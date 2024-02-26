import { FC, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAccessToken, getRole } from '@/utils/common';
import { routePath } from '@/routes/routePath';

interface IProps {
  children: JSX.Element;
  isPrivate: boolean;
  permission: string;
}

const AuthLayout: FC<IProps> = ({ children, isPrivate, permission }: IProps) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const accessToken = getAccessToken();
  useEffect(() => {
    const isLogin = accessToken;
    const roles = getRole();
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

    if (isLogin && permission && !roles.includes(permission)) {
      navigate('/');
    }
  }, [accessToken, isPrivate, permission, pathname]);

  return children;
};

export default AuthLayout;
