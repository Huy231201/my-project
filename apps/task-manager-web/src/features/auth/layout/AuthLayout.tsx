import { Outlet, useLocation, Link } from "react-router";
import { ClipboardCheckIcon } from "lucide-react";

export default function AuthLayout() {
  const { pathname } = useLocation();
  const isLogin = pathname === "/login";

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-[18px] bg-muted">
  
      <div className="flex items-center gap-[15px]">
        <ClipboardCheckIcon className="size-5 text-primary" />
        <p className="text-2xl font-medium">Task Manager</p>
      </div>

      <div className="box-border w-full max-w-[500px] rounded-lg border border-border bg-card px-5 py-[18px] shadow-sm">
        <Outlet />
      </div>

      <p className="text-sm text-muted-foreground font-light">
        {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
        <Link
          to={isLogin ? "/register" : "/login"}
          className="text-primary hover:underline"
        >
          {isLogin ? "Đăng ký" : "Đăng nhập"}
        </Link>
      </p>
    </div>
  );
}
