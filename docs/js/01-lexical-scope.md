# Bài 1: Một biến được nhìn thấy ở đâu? (Lexical scope)

Lỗi này chắc bạn từng gặp: biến rõ ràng đã khai báo, mà JS vẫn báo là không có.

```js
1  function demTao() {
2    let tong = 5;
3  }
4  demTao();
5  console.log(tong);
```

```
ReferenceError: tong is not defined
```

Sau bài này cần trả lời được:

- Vì sao dòng 5 không thấy `tong`?
- Không có scope thì code hỏng ở đâu?
- JS tìm một biến theo thứ tự nào?
- Hàm tìm biến ở chỗ nó được viết hay chỗ nó được gọi?

## 0. Hình dung: toà chung cư

Toà nhà có các căn hộ, căn hộ có các phòng. Tìm đồ thì tìm trong phòng trước, rồi ra căn hộ, rồi xuống kho chung. Chỉ đi từ trong ra ngoài, không vào căn hộ của người khác.

| Chung cư | JavaScript |
|---|---|
| Toà nhà | global / module scope |
| Căn hộ | function scope (vùng của một hàm) |
| Phòng | block scope (vùng của một cặp `{ }`) |
| Món đồ dán nhãn tên | biến |

- **Biến**: một cái tên gắn với một giá trị, ví dụ `let tong = 5`.
- **Scope** (phạm vi): vùng code mà trong đó một tên biến dùng được. Mỗi vùng giống một cái hộp chứa các biến của nó.

## 1. Vì sao dòng 5 không thấy `tong`

Chạy đoạn code ở đầu bài từng bước:

- **Dòng 1–3**: JS ghi nhận có hàm `demTao`. Thân hàm (dòng 2) **chưa chạy**.
- **Dòng 4**: gọi `demTao()`. JS nhảy vào thân hàm.
- **Dòng 2**: tạo `tong = 5`. Dòng này nằm trong `{ }` của `demTao`, nên `tong` được cất trong **hộp của `demTao`**.
- **Dòng 3**: hết hàm. JS quay về file, chạy tiếp dòng 5.
- **Dòng 5**: cần `tong`. JS tìm ở hộp của file. Hộp file không có `tong`, vì `tong` nằm trong hộp `demTao`.
- Không tìm thấy, nên báo `tong is not defined`.

Kết luận: biến khai báo trong hàm thì chỉ hàm đó dùng được.

## 2. Không có scope thì sao

Bỏ chữ `let` đi để xem:

```js
1  function demTao() { tong = 5; }
2  function demCam() { tong = 3; }
3  demTao();
4  demCam();
5  console.log(tong);
```

```
3
```

- **Dòng 1–2**: JS ghi nhận hai hàm. Chưa chạy gì.
- **Dòng 3**: gọi `demTao()`, chạy `tong = 5`.
  - Không có `let`, tức là `tong` chưa được khai báo ở đâu cả.
  - JS (chế độ cũ) tự tạo `tong` trong **kho chung** (global), gán `5`.
- **Dòng 4**: gọi `demCam()`, chạy `tong = 3`.
  - JS tìm `tong`: thấy `tong` trong kho chung, chính là biến vừa tạo ở dòng 3.
  - Ghi đè thành `3`.
- **Dòng 5**: in `tong` trong kho chung, ra `3`. Số táo `5` đã mất.

Kết luận:

- Không có scope thì mọi hàm dùng chung một chỗ, đặt trùng tên là đè lên nhau.
- Có `let` thì mỗi hàm có `tong` riêng trong hộp của mình, không đè lên nhau.

## 3. Các loại scope

- **Global**: hộp ngoài cùng, ở đâu cũng thấy.
- **Module**: mỗi file có `import`/`export` có hộp riêng.
- **Function**: mỗi hàm là một hộp.
- **Block**: mỗi cặp `{ }` (của `if`, `for`...) là một hộp, nhưng chỉ `let`/`const` chịu ở trong hộp này.

```js
1  if (true) {
2    let a = 1;
3    var b = 2;
4  }
5  console.log(b);
6  console.log(a);
```

```
2
ReferenceError: a is not defined
```

- **Dòng 1**: điều kiện đúng, JS đi vào block `{ }`, tạo một hộp cho block.
- **Dòng 2**: `let a = 1`. `let` ở trong block, nên `a` vào **hộp block**.
- **Dòng 3**: `var b = 2`. `var` không chịu ở trong block, nên `b` vào **hộp bên ngoài** (hộp file).
- **Dòng 4**: hết block. Hộp block bị bỏ, `a` mất theo.
- **Dòng 5**: tìm `b` ở hộp file, có, in `2`.
- **Dòng 6**: tìm `a` ở hộp file, không có, báo lỗi.

Vì sao `var` không chịu ở trong block: xem [bài 3](03-hoisting.md).

## 4. Tìm biến theo thứ tự nào

```js
1  const city = 'Hà Nội';
2  function showAddress() {
3    const street = 'Láng';
4    console.log(street, city);
5  }
6  showAddress();
```

```
Láng Hà Nội
```

- **Dòng 1**: tạo `city` trong hộp file.
- **Dòng 2–5**: ghi nhận hàm `showAddress`. Chưa chạy.
- **Dòng 6**: gọi `showAddress()`, nhảy vào thân hàm.
- **Dòng 3**: tạo `street` trong hộp `showAddress`.
- **Dòng 4**: cần hai biến:
  - `street`: tìm trong hộp `showAddress`, có, lấy `'Láng'`.
  - `city`: tìm trong hộp `showAddress`, không có. Ra hộp bên ngoài (hộp file), có, lấy `'Hà Nội'`.
- In `Láng Hà Nội`.

Quy tắc:

- Tìm từ hộp trong cùng ra ngoài.
- Thấy ở hộp nào thì dừng ở đó.
- Ra tới hộp ngoài cùng mà vẫn không có thì báo `ReferenceError`.
- Chuỗi hộp mà JS đi qua gọi là **scope chain**.

## 5. "Bên ngoài" là chỗ viết, không phải chỗ gọi

Mục 4 nói "ra hộp bên ngoài". Nhưng bên ngoài là ở đâu khi một hàm được gọi từ một hàm khác?

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

- **Dòng 1**: tạo `place = 'chỗ viết show'` trong hộp file.
- **Dòng 2–4**: ghi nhận hàm `show`. `show` được **viết** ở cấp file.
- **Dòng 5–8**: ghi nhận hàm `run`.
- **Dòng 9**: gọi `run()`, nhảy vào thân `run`.
- **Dòng 6**: tạo `place = 'chỗ gọi show'` trong hộp `run`. Lúc này có **hai** biến tên `place`: một ở hộp file, một ở hộp `run`.
- **Dòng 7**: gọi `show()`, nhảy vào thân `show`.
- **Dòng 3**: cần `place`.
  - Tìm trong hộp `show`: không có.
  - Ra bên ngoài. Bên ngoài của `show` là **chỗ `show` được viết**, tức hộp file. Không phải hộp `run`, dù `run` là người gọi.
  - Hộp file có `place = 'chỗ viết show'`.
- In `chỗ viết show`.

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

Muốn `show` thấy `place` của `run` thì phải **viết** `show` bên trong `run`:

```js
1  function run() {
2    const place = 'chỗ gọi show';
3    function show() {
4      console.log(place);
5    }
6    show();
7  }
8  run();
```

```
chỗ gọi show
```

- `show` giờ được viết bên trong `run`, nên bên ngoài của `show` là hộp `run`.
- Dòng 4 tìm `place`: hộp `show` không có, ra hộp `run`, có `'chỗ gọi show'`.

Quy tắc "tìm theo chỗ viết" có tên là **lexical scope**. Closure ([bài 4](04-closure.md)) dựa hoàn toàn vào quy tắc này.

## Tóm tắt

- Biến khai báo trong hàm thì chỉ hàm đó dùng được.
- Không có scope thì các hàm đè biến của nhau.
- Có 4 loại scope: global, module, function, block. `var` không chịu ở trong block.
- Tìm biến từ hộp trong ra ngoài, thấy là dừng, không thấy thì báo `ReferenceError`.
- "Bên ngoài" của một hàm là chỗ hàm được viết, không phải chỗ hàm được gọi.
