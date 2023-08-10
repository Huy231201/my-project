import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { ToastContainer } from 'react-toastify';
import { routeConfig } from './config';
import AuthLayout from './AuthLayout';

function Routing() {
  return (
    <Routes>
      {routeConfig.map(({ route = '', page: Component, Layout, isPrivate = false }) => (
        <Route
          key={route}
          path={route}
          element={
            <AuthLayout isPrivate={isPrivate}>
              <Layout>
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
