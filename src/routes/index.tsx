import { Routes, Route } from 'react-router-dom';
import { Suspense, FC, ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { routeConfig } from './config';
import AuthLayout from './AuthLayout';

const LayoutDefault: FC<{ children: ReactNode }> = ({ children }) => <>{children}</>;

function Routing() {
  return (
    <Routes>
      {routeConfig.map(({ route = '', page: Component, Layout = LayoutDefault, isPrivate = false, layoutProps }) => (
        <Route
          key={route}
          path={route}
          element={
            <AuthLayout isPrivate={isPrivate}>
              <Layout {...layoutProps}>
                <Toaster
                  position="bottom-right"
                  reverseOrder={false}
                  gutter={8}
                  containerClassName=""
                  containerStyle={{}}
                  toastOptions={{
                    // Define default options
                    className: '',
                    duration: 3000,
                  }}
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
