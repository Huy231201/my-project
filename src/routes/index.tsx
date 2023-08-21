import { Routes, Route } from 'react-router-dom';
import { Suspense, FC, ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import { routeConfig } from './config';
import AuthLayout from './AuthLayout';

import 'react-toastify/dist/ReactToastify.css';

const LayoutDefault: FC<{ children: ReactNode }> = ({ children }) => <>{children}</>;

function Routing() {
  return (
    <Routes>
      {routeConfig.map(({ route = '', page: Component, Layout = LayoutDefault, isPrivate = false }) => (
        <Route
          key={route}
          path={route}
          element={
            <AuthLayout isPrivate={isPrivate}>
              <Layout>
                <div>aaa {import.meta.env.VITE_API_URL}</div>
                <ToastContainer
                  position="bottom-right"
                  autoClose={3000}
                  hideProgressBar
                  pauseOnFocusLoss
                  pauseOnHover
                  closeOnClick
                  rtl={false}
                  draggable
                />
                <Suspense fallback={null}>
                  <Component />
                </Suspense>
              </Layout>
            </AuthLayout>
          }
        />
      ))}
    </Routes>
  );
}
export default Routing;
