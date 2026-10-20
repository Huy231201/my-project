# Quy ước React

Tài liệu này ghi lại quy ước chung của team khi viết React, để code của mọi người nhìn giống nhau và dễ review. Mỗi quy ước viết theo cùng một khung: nêu quy tắc, giải thích lý do, rồi cho ví dụ đúng và sai.

## Đặt tên

### Component dùng PascalCase, tên file trùng tên component

**Component** là một hàm trả về giao diện, dùng lại được ở nhiều nơi. **PascalCase** là cách viết hoa chữ cái đầu của mỗi từ và nối liền, ví dụ `UserCard`.

React dựa vào chữ hoa đầu tên để phân biệt component với thẻ HTML thường. `<UserCard />` được hiểu là component, còn `<usercard />` bị hiểu là một thẻ HTML không tồn tại. Đặt tên file trùng tên component giúp tìm file bằng tên ngay, không phải mở ra xem bên trong.

Đúng, file tên `UserCard.tsx`:

```tsx
export function UserCard({ name }: { name: string }) {
  return <div>{name}</div>;
}
```

Sai, file tên `userCard.tsx`:

```tsx
export function userCard({ name }: { name: string }) {
  return <div>{name}</div>;
}
```

## Thêm quy ước mới

Mỗi quy ước mới thêm vào đúng nhóm của nó (đặt tên, cấu trúc file, hooks...) theo khung ở trên:

1. Tiêu đề là quy tắc, viết thành một câu.
2. Đoạn giải thích: thuật ngữ nào lần đầu xuất hiện thì định nghĩa một câu, rồi nêu lý do của quy tắc.
3. Ví dụ đúng.
4. Ví dụ sai.
