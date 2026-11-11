# Link và NavLink trong React Router

## 1. Link là gì?

`Link` dùng để điều hướng giữa các trang trong ứng dụng React mà không cần tải lại toàn bộ trang.

**Cú pháp:**

```tsx
import { Link } from "react-router";

<Link to="/dashboard">Dashboard</Link>
<Link to="/tasks">Công việc</Link>
```

- `to`: đường dẫn muốn điều hướng đến.
- Nội dung bên trong: nội dung hiển thị trên giao diện.

**Khi nào sử dụng?**

Dùng `Link` khi chỉ cần điều hướng thông thường, không cần biết link có đang active hay không.

## 2. NavLink là gì?

`NavLink` cũng dùng để điều hướng giữa các trang, nhưng có thêm khả năng nhận biết link nào đang active (tương ứng với trang hiện tại).

**Cú pháp:**

```tsx
import { NavLink } from "react-router";

<NavLink
  to="/dashboard"
  className={({ isActive }) =>
    isActive ? "bg-blue-500 text-white" : "text-gray-500"
  }
>
  Dashboard
</NavLink>;
```

- `to`: đường dẫn muốn điều hướng.
- `isActive`: giá trị boolean do React Router cung cấp.
  - `true`: link đang active.
  - `false`: link không active.
- `className`: có thể nhận function để thay đổi CSS theo trạng thái active.

**Khi nào sử dụng?**

Dùng `NavLink` khi muốn hiển thị trạng thái của trang hiện tại, ví dụ:

- Sidebar.
- Navbar.
- Menu điều hướng.

## 3. So sánh Link và NavLink

| Link                                 | NavLink                        |
| ------------------------------------ | ------------------------------ |
| Điều hướng giữa các trang            | Điều hướng giữa các trang      |
| Không cung cấp `isActive`            | Có `isActive`                  |
| Dùng cho liên kết thông thường       | Dùng cho menu điều hướng       |
| Không tự nhận biết trạng thái active | Tự nhận biết trạng thái active |

## 4. Ghi nhớ

- Cả `Link` và `NavLink` đều giúp điều hướng mà không reload toàn bộ trang.
- Dùng `Link` khi chỉ cần chuyển trang.
- Dùng `NavLink` khi cần biết người dùng đang ở trang nào để thay đổi giao diện.
