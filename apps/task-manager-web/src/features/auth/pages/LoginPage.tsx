import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-4 text-center text-xl font-medium">
        Đăng nhập tài khoản
      </h1>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" className="hover:border-transparent" />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-medium">Mật khẩu</label>
            <Input id="password" name="password" type="password" autoComplete="current-password" placeholder="Mật khẩu" className="hover:border-transparent" />
          </div>

          <Button type="submit" className="h-11 mb-2.5">Đăng nhập</Button>
        </div>
      </form>
    </>
  );
}
