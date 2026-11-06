# Bài 1: Một biến được nhìn thấy ở đâu? (Lexical scope)

Sau bài này cần trả lời được:

1. Bên ngoài hàm có dùng được biến khai báo trong hàm không?
2. Không có scope thì code hỏng ở đâu?
3. JS tìm một tên biến theo thứ tự nào?
4. Hàm tìm biến ở chỗ nó được viết hay chỗ nó được gọi?

## 0. Khái niệm nền

- **Biến** (variable): một cái tên gắn với một giá trị, như `let count = 0`.
- **Khai báo** (declaration): dòng tạo ra tên mới bằng `let`, `const`, `var`, `function`, `class`.
- **Block**: đoạn code trong cặp `{ }`, ví dụ thân của `if`, `for`.
- **Scope** (phạm vi): vùng code mà trong đó một tên biến dùng được.

**Hình dung: toà chung cư.** Toà nhà có các căn hộ, căn hộ có các phòng. Muốn tìm một món đồ, bạn tìm trong phòng mình trước, rồi ra căn hộ, rồi xuống kho chung của toà nhà. Bạn chỉ đi từ trong ra ngoài, không vào căn hộ của người khác.

| Chung cư | JavaScript |
|---|---|
| Toà nhà | global / module scope |
| Căn hộ | function scope |
| Phòng | block scope |
| Món đồ dán nhãn tên | biến |

## 1. Scope để làm gì

Biến khai báo trong hàm thì chỉ hàm đó thấy:

```js
function demTao() {
  let tong = 5;
}
demTao();
console.log(tong);
```

```
$ node a1b.js
ReferenceError: tong is not defined
```

Nếu không có scope thì sao? Quên `let` là cách dễ nhất để thấy điều đó. Khi đó JS đặt biến vào kho chung (global), và mọi hàm dùng chung một biến:

```js
function demTao() { tong = 5; }
function demCam() { tong = 3; }
demTao();
demCam();
console.log(tong);
```

```
$ node a1.js
3
```

Số táo (`5`) đã bị số cam (`3`) ghi đè. Scope tồn tại để mỗi hàm có biến riêng, đặt tên trùng cũng không đè lên nhau.

## 2. Các loại scope

Xếp từ ngoài vào trong:

- **Global**: ở đâu cũng thấy.
- **Module**: mỗi file có `import`/`export` có hộp riêng.
- **Function**: mỗi hàm là một hộp.
- **Block**: mỗi `{ }` là một hộp, nhưng chỉ `let`/`const` chịu ở trong.

```js
if (true) {
  let a = 1;
  var b = 2;
}
console.log(b);
console.log(a);
```

```
$ node a2.js
2
ReferenceError: a is not defined
```

`let a` ở yên trong block nên bên ngoài không thấy. `var b` bỏ qua block và thoát ra ngoài. Vì sao như vậy thì bài 3 (hoisting) sẽ giải thích.

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
$ node a3.js
Láng Hà Nội
```

```
street:  trong showAddress có → 'Láng'
city:    trong showAddress không có ▼
         ra ngoài, có → 'Hà Nội'
```

Engine tìm từ trong ra ngoài, thấy là dừng. Đi hết ra tới ngoài cùng mà vẫn không thấy thì báo `ReferenceError`. Chuỗi hộp mà engine đi qua gọi là **scope chain**.

## 4. Hàm tìm biến ở chỗ nó được viết, không phải chỗ nó được gọi

```js
const place = 'chỗ viết show';
function show() {
  console.log(place);
}
function run() {
  const place = 'chỗ gọi show';
  show();
}
run();
```

```
$ node a4.js
chỗ viết show
```

`show` không có biến `place` của riêng nó, nên phải tìm ra bên ngoài. "Bên ngoài" ở đây là khung code bao quanh chỗ `show` được viết, chứ không phải hàm đã gọi nó:

```
┌ file ──────────────────────────────────────┐
│ const place = 'chỗ viết show'              │
│                                            │
│ ┌ show ──────────────┐                     │
│ │ console.log(place) │ ← không có place,   │
│ └────────────────────┘   tìm ra khung file │
│                                            │
│ ┌ run ───────────────┐                     │
│ │ const place = ...  │                     │
│ │ show()             │ ← chỉ là lời gọi,   │
│ └────────────────────┘   show không nằm    │
│                          trong khung run   │
└────────────────────────────────────────────┘
```

**Hình dung:** `run` gọi điện cho `show` nhờ đọc tên món đồ `place`. `show` vẫn đang ở nhà của mình, nên chỉ nhìn thấy đồ trong nhà mình và kho chung của toà nhà. Nó không thấy đồ trong nhà `run`, dù `run` là người gọi.

Muốn `show` thấy được `place` của `run` thì phải **viết** `show` bên trong `run`:

```js
function run() {
  const place = 'chỗ gọi show';
  function show() { console.log(place); }
  show();
}
run(); // chỗ gọi show
```

Quy tắc này có tên là **lexical scope**. Không cần nhớ tên, chỉ cần nhớ quy tắc, vì closure (bài 4) và cách callback trong React đọc `state` đều dựa trên nó.

## Tóm tắt

- Biến trong hàm thì chỉ hàm đó thấy. Không có scope thì các hàm đè biến của nhau.
- Có 4 loại scope: global, module, function, block. `var` bỏ qua block.
- Tìm biến từ trong ra ngoài, thấy là dừng, không thấy thì báo `ReferenceError`.
- Hàm tìm biến ở chỗ nó được viết, không phải chỗ nó được gọi (lexical scope).
