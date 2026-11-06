# Bài 1: Một biến được nhìn thấy ở đâu? (Lexical scope)

Lỗi này chắc bạn từng gặp: biến rõ ràng đã khai báo, mà JS vẫn báo là không có.

```js
function demTao() {
  let tong = 5;
}
demTao();
console.log(tong);
```

```
ReferenceError: tong is not defined
```

Sau bài này cần trả lời được:

- Vì sao bên ngoài hàm không thấy `tong`?
- Không có scope thì code hỏng ở đâu?
- JS tìm một biến theo thứ tự nào?
- Hàm tìm biến ở chỗ nó được viết hay chỗ nó được gọi?

## 0. Hình dung: toà chung cư

Toà nhà có các căn hộ, căn hộ có các phòng. Tìm đồ thì tìm trong phòng trước, rồi ra căn hộ, rồi xuống kho chung. Chỉ đi từ trong ra ngoài, không vào căn hộ của người khác.

| Chung cư | JavaScript |
|---|---|
| Toà nhà | global / module scope |
| Căn hộ | function scope |
| Phòng | block scope |
| Món đồ dán nhãn tên | biến |

- **Scope** (phạm vi): vùng code mà trong đó một tên biến dùng được.

## 1. Scope để làm gì

Bỏ `let` đi để xem không có scope thì chuyện gì xảy ra:

```js
function demTao() { tong = 5; }
function demCam() { tong = 3; }
demTao();
demCam();
console.log(tong);
```

```
3
```

- Không có `let`, JS đặt `tong` vào kho chung (global).
- `demTao` và `demCam` dùng chung **một** biến `tong`, nên số `5` bị ghi đè thành `3`.
- Có `let` thì mỗi hàm có `tong` riêng, và bên ngoài không thấy nó. Đó là lỗi ở đầu bài.
- Không có scope thì mọi tên đều phải khác nhau trên toàn chương trình, và chương trình càng lớn càng dễ đụng tên.

## 2. Các loại scope

- **Global**: ở đâu cũng thấy.
- **Module**: mỗi file có `import`/`export` có hộp riêng.
- **Function**: mỗi hàm là một hộp.
- **Block**: mỗi `{ }` là một hộp, nhưng chỉ `let`/`const` chịu ở trong hộp này.

```js
if (true) {
  let a = 1;
  var b = 2;
}
console.log(b);
console.log(a);
```

```
2
ReferenceError: a is not defined
```

- `let a` ở yên trong block.
- `var b` bỏ qua block và thoát ra ngoài. Lý do nằm ở [bài 3](03-hoisting.md).

## 3. Tìm biến theo thứ tự nào

```js
const city = 'Hà Nội';
function showAddress() {
  const street = 'Láng';
  console.log(street, city);
}
showAddress();
```

```
Láng Hà Nội
```

- `street`: có trong `showAddress`, dùng luôn.
- `city`: không có trong `showAddress`, nên tìm ra ngoài và thấy ở file.
- Tìm từ trong ra ngoài, thấy là dừng.
- Ra tới ngoài cùng mà vẫn không thấy thì báo `ReferenceError`.
- Chuỗi hộp mà JS đi qua gọi là **scope chain**.

## 4. Tìm theo chỗ viết, không theo chỗ gọi

```js
1  const place = 'chỗ viết show';
2  function show() {
3    console.log(place);
4  }
5  function run() {
6    const place = 'chỗ gọi show';
7    show();
8  }
9  run();
```

```
chỗ viết show
```

```
┌ file ──────────────────────────────────────┐
│ const place = 'chỗ viết show'              │
│ ┌ show ──────────────┐                     │
│ │ console.log(place) │ ← không có place,   │
│ └────────────────────┘   ra khung file     │
│ ┌ run ───────────────┐                     │
│ │ const place = ...  │                     │
│ │ show()             │ ← chỉ là lời gọi    │
│ └────────────────────┘                     │
└────────────────────────────────────────────┘
```

- `show` không có `place`, nên tìm ra ngoài.
- "Ngoài" là khung bao quanh chỗ `show` được **viết**, tức khung file.
- `show()` ở dòng 7 chỉ là một lời gọi, không đưa `show` vào trong khung `run`.
- Muốn `show` thấy `place` của `run` thì phải **viết** `show` bên trong `run`.
- Quy tắc này có tên là **lexical scope**. Closure ([bài 4](04-closure.md)) và callback trong React đều dựa trên nó.

## Tóm tắt

- Biến trong hàm thì chỉ hàm đó thấy.
- Không có scope thì các hàm đè biến của nhau.
- Có 4 loại scope: global, module, function, block. `var` bỏ qua block.
- Tìm biến từ trong ra ngoài, thấy là dừng, không thấy thì báo `ReferenceError`.
- Hàm tìm biến ở chỗ nó được viết, không phải chỗ nó được gọi.
