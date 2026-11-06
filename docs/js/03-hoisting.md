# Bài 3: Dùng biến trước dòng khai báo thì sao? (Hoisting)

Ba đoạn code chỉ khác nhau một dòng, nhưng ra ba kết quả khác nhau:

```js
console.log(gia);
```
```
ReferenceError: gia is not defined
```

```js
console.log(gia);
let gia = 100;
```
```
ReferenceError: Cannot access 'gia' before initialization
```

```js
console.log(gia);
var gia = 100;
```
```
undefined
```

- Đoạn 1 báo "không tồn tại" (`is not defined`).
- Đoạn 2 báo "chưa khởi tạo" (`before initialization`). Tức là JS **đã biết có `gia`**, dù chưa chạy tới dòng khai báo.
- Đoạn 3 dùng biến trước khai báo mà không lỗi, ra `undefined`.

Sau bài này cần trả lời được:

- JS biết trước tên biến bằng cách nào?
- Vì sao JS phải làm vậy?
- Vì sao `var`, `let`, `function` cho kết quả khác nhau?

## 0. Hình dung: soạn bát trước khi nấu

Đầu bếp đọc hết công thức một lượt, bày sẵn mỗi nguyên liệu một cái bát trống có dán nhãn. Sau đó mới nấu, tới bước nào thì cho nguyên liệu vào bát đó.

| Nấu ăn | JavaScript |
|---|---|
| Đọc hết công thức trước | JS đọc lướt cả thân hàm trước khi chạy |
| Bát trống có dán nhãn | tên biến tạo sẵn trong hộp, chưa có giá trị |
| Tới bước nào, cho nguyên liệu vào bát | chạy tới dòng khai báo thì gán giá trị |

## 1. Tạo tên trước, chạy sau

```js
1  function tinhGia() {
2    console.log(gia);
3    var gia = 100;
4    console.log(gia);
5  }
6  tinhGia();
```

```
undefined
100
```

**Bước 1: dòng 6 gọi `tinhGia()`.**

- JS tạo hộp cho lần gọi này ([bài 2](02-execution-context.md)).
- **Trước khi chạy dòng 2**, JS đọc lướt cả thân hàm (dòng 2–4).
- Thấy dòng 3 có `var gia`, JS tạo sẵn tên `gia` trong hộp, giá trị tạm là `undefined`.

```
tinhGia      chưa chạy dòng nào   { gia: undefined }
file         dừng ở dòng 6
```

**Bước 2: dòng 2 `console.log(gia)`.**

- Tìm `gia` trong hộp `tinhGia`: có, vì đã tạo sẵn ở bước 1.
- Giá trị đang là `undefined`, nên in `undefined`.

**Bước 3: dòng 3 `var gia = 100`.**

- Tên `gia` đã có từ bước 1, không tạo lại.
- Dòng này chỉ còn làm một việc: gán `100`.

```
tinhGia      đang chạy dòng 3     { gia: 100 }
file         dừng ở dòng 6
```

**Bước 4: dòng 4** in `100`.

Kết luận:

- Việc tạo tên trước khi chạy dòng nào gọi là **hoisting** ("kéo lên").
- Không dòng code nào bị kéo đi đâu. Kết quả chỉ trông như dòng khai báo được đưa lên đầu hàm.

## 2. Vì sao phải tạo tên trước

```js
1  const gia = 1;
2  function tinhGia() {
3    console.log(gia);
4    let gia = 2;
5  }
6  tinhGia();
```

```
ReferenceError: Cannot access 'gia' before initialization
```

Nhiều người đoán dòng 3 in `1`. Chạy từng bước:

**Bước 1: dòng 1.** Tạo `gia = 1` trong hộp file.

**Bước 2: dòng 6 gọi `tinhGia()`.**

- JS tạo hộp `tinhGia`.
- Đọc lướt thân hàm, thấy dòng 4 có `let gia`, tạo sẵn tên `gia` trong hộp `tinhGia`.
- Khác `var`: tên này ở trạng thái **chưa khởi tạo**, không phải `undefined`.

```
tinhGia      chưa chạy dòng nào   { gia: <chưa khởi tạo> }
file         dừng ở dòng 6        { gia: 1, tinhGia }
```

**Bước 3: dòng 3 `console.log(gia)`.**

- Tìm `gia` từ hộp trong cùng ra ngoài ([bài 1](01-lexical-scope.md)). Hộp trong cùng là `tinhGia`.
- Hộp `tinhGia` **có** tên `gia`, nên dừng tìm. Không ra hộp file lấy `1`.
- `gia` đang chưa khởi tạo, nên báo lỗi.

Nếu JS **không** tạo tên trước thì sao:

- Dòng 3: hộp `tinhGia` chưa có `gia`, nên ra hộp file lấy `1`.
- Dòng 4: tạo `gia = 2` trong hộp `tinhGia`.
- Kết quả: cùng chữ `gia` trong một hàm, dòng 3 là biến ở file, dòng 4 là biến của hàm. Đọc code không biết `gia` là biến nào, tuỳ đang chạy tới đâu.

Tạo tên trước thì chỉ cần nhìn code là biết: **trong cả hàm `tinhGia`, `gia` luôn là biến của chính hàm**.

## 3. Vì sao `var` và `let` khác nhau

| Khai báo | Lúc mới tạo | Đọc trước dòng khai báo |
|---|---|---|
| `var` | `undefined` | ra `undefined`, không lỗi |
| `let`, `const` | chưa khởi tạo | báo lỗi |

- Cả hai đều được tạo tên trước. Chỉ khác giá trị lúc mới tạo.
- `var` ra `undefined` là tai nạn lịch sử: JS được viết vội trong khoảng 10 ngày năm 1995. Brendan Eich (người tạo ra JS) từng nói đây là hệ quả ngoài ý muốn của cách cài đặt lúc đó.
- Nó dễ gây lỗi: code chạy tiếp với `undefined` mà không ai biết.
- Không xoá được, vì xoá thì hàng triệu trang web cũ hỏng.
- Năm 2015 JS thêm `let`/`const`:
  - Giữ phần có ích: vẫn tạo tên trước.
  - Bỏ phần dễ lỗi: đọc sớm thì báo lỗi ngay.
- Code mới: chỉ dùng `let`/`const`. TypeScript và ESLint (rule `no-var`) sẽ chặn `var`.

## 4. `function`: gọi trước dòng khai báo vẫn được

```js
1  nauCanh();
2
3  function nauCanh() {
4    nauNuocDung();
5    console.log('xong canh');
6  }
7  function nauNuocDung() {
8    console.log('xong nước dùng');
9  }
```

```
xong nước dùng
xong canh
```

**Bước 1: bắt đầu chạy file.**

- JS tạo hộp file.
- **Trước khi chạy dòng 1**, JS đọc lướt cả file, thấy hai khai báo `function` ở dòng 3 và dòng 7.
- Với `function`, JS đưa **cả code của hàm** vào hộp, không chỉ tên.

```
file         chưa chạy dòng nào   { nauCanh: <hàm>, nauNuocDung: <hàm> }
```

**Bước 2: dòng 1 gọi `nauCanh()`.**

- Tìm `nauCanh` trong hộp file: có, kèm code. Gọi được.
- Hộp file ghi "dừng ở dòng 1". Tạo hộp `nauCanh`, nhảy vào dòng 4.

**Bước 3: dòng 4 gọi `nauNuocDung()`.**

- Tìm `nauNuocDung`: hộp `nauCanh` không có, ra hộp file, có (đã tạo sẵn ở bước 1).
- Tạo hộp `nauNuocDung`, nhảy vào dòng 8, in `xong nước dùng`.
- Hết `nauNuocDung`, quay về `nauCanh` ở dòng 4.

**Bước 4: dòng 5** in `xong canh`. Hết `nauCanh`, quay về file ở dòng 1. Dòng 3–9 là khai báo đã xử lý ở bước 1, nên file kết thúc.

Kết luận:

- `function` được đưa cả code vào hộp từ trước, nên gọi trước dòng khai báo được.
- Nhờ vậy viết phần chính ở trên, hàm phụ ở dưới được. Phần này là có chủ đích, khác `var`.

Arrow function gán vào `const` thì khác, vì nó là khai báo `const`:

```js
1  nauCanh();
2
3  const nauCanh = () => {
4    console.log('xong canh');
5  };
```

```
ReferenceError: Cannot access 'nauCanh' before initialization
```

- **Bước 1**: đọc lướt file, thấy `const nauCanh` ở dòng 3. Tạo tên `nauCanh`, trạng thái chưa khởi tạo. Code của hàm **chưa** được đưa vào.
- **Bước 2**: dòng 1 gọi `nauCanh()`. `nauCanh` chưa khởi tạo, báo lỗi.
- Code của hàm chỉ được gán vào `nauCanh` khi chạy tới dòng 3.

| Khai báo | Lúc mới tạo | Dùng trước dòng khai báo |
|---|---|---|
| `var` | `undefined` | ra `undefined` |
| `let`, `const` (kể cả `const f = () => {}`) | chưa khởi tạo | báo lỗi |
| `function f() {}` | có sẵn code của hàm | gọi được |

## 5. Vì sao `var` không chịu ở trong block

```js
1  function nau() {
2    if (true) {
3      var mon = 'canh';
4      let rau = 'rau ngót';
5    }
6    console.log(mon);
7    console.log(rau);
8  }
9  nau();
```

```
canh
ReferenceError: rau is not defined
```

**Bước 1: dòng 9 gọi `nau()`.**

- JS tạo hộp `nau`, đọc lướt thân hàm.
- Thấy `var mon` ở dòng 3. Dòng này nằm trong block `if`, nhưng `var` **luôn ghi vào hộp của hàm**. Tạo `mon = undefined` trong hộp `nau`.
- Thấy `let rau` ở dòng 4. `let` thuộc về block, nên **không** ghi vào hộp `nau`.

```
nau          chưa chạy dòng nào   { mon: undefined }
file         dừng ở dòng 9
```

**Bước 2: dòng 2, điều kiện đúng, vào block.**

- Với `let`/`const`, mỗi block có hộp nhỏ riêng, nằm trong hộp hàm.
- JS tạo hộp block, đọc lướt block, tạo `rau` (chưa khởi tạo).

```
nau          đang chạy dòng 3     { mon: undefined }
  └ block if                      { rau: <chưa khởi tạo> }
file         dừng ở dòng 9
```

**Bước 3: dòng 3 `var mon = 'canh'`.** Tìm `mon`: hộp block không có, ra hộp `nau`, có. Gán `'canh'`.

**Bước 4: dòng 4 `let rau = 'rau ngót'`.** Gán vào `rau` trong hộp block.

**Bước 5: dòng 5, hết block.** Không còn gì trỏ tới hộp block, nên nó bị xoá. `rau` mất theo.

```
nau          đang chạy dòng 6     { mon: 'canh' }
file         dừng ở dòng 9
```

**Bước 6: dòng 6.** Tìm `mon` trong hộp `nau`, có, in `canh`.

**Bước 7: dòng 7.** Tìm `rau`: hộp `nau` không có, hộp file không có. Báo lỗi.

Vì sao:

- Năm 1995 JS chỉ có hộp cho hàm và file, chưa có hộp cho block. `var` chỉ biết ghi vào hộp hàm.
- Hộp block có từ 2015, cùng `let`/`const`.
- `var` giữ cách cũ để code cũ không hỏng.

## Tóm tắt

- Trước khi chạy một hàm, JS đọc lướt và tạo sẵn mọi tên được khai báo. Đó là hoisting.
- Làm vậy để trong cả hàm, một tên luôn chỉ đúng một biến.
- `var` mới tạo là `undefined`. `let`/`const` là chưa khởi tạo, đọc sớm báo lỗi. `function` có sẵn code.
- `const f = () => {}` là khai báo `const`, không gọi trước được.
- `var` ghi vào hộp hàm nên không chịu ở trong block. `let`/`const` có hộp riêng cho mỗi block.
