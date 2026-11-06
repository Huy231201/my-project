# Bài 3: Dùng biến trước dòng khai báo thì sao?

Ba đoạn code dưới đây chỉ khác nhau đúng một dòng, nhưng cho ra ba kết quả khác nhau:

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

Đoạn thứ hai báo "chưa khởi tạo" (before initialization), chứ không báo "không tồn tại" như đoạn thứ nhất. Nghĩa là JS **đã biết có biến `gia`**, dù chưa chạy tới dòng khai báo nó. Đoạn thứ ba thì dùng biến trước khi khai báo mà không lỗi gì. Bài này trả lời ba câu hỏi:

1. JS biết trước tên biến bằng cách nào?
2. Vì sao JS phải làm vậy?
3. Vì sao `var` và `let` lại cho kết quả khác nhau?

## 0. Hình dung: soạn bát trước khi nấu

Đầu bếp không vừa đọc công thức vừa nấu. Họ đọc hết công thức một lượt, bày sẵn ra bàn mỗi nguyên liệu một cái bát trống, có dán nhãn tên. Sau đó mới bắt đầu nấu, tới bước nào thì cho nguyên liệu vào bát đó.

| Nấu ăn | JavaScript |
|---|---|
| Đọc hết công thức trước | JS đọc lướt cả thân hàm trước khi chạy |
| Bát trống có dán nhãn | tên biến được tạo sẵn trong hộp, chưa có giá trị |
| Nấu tới bước nào, cho nguyên liệu vào bát | chạy tới dòng khai báo thì gán giá trị |

## 1. JS tạo tên biến trước, rồi mới chạy từng dòng

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

**Bước 1: dòng 6 gọi `tinhGia()`.** Như ở [bài 2](02-execution-context.md), JS tạo một hộp cho `tinhGia`. Nhưng trước khi chạy dòng 2, JS đọc lướt cả thân hàm, thấy dòng 3 có `var gia`, nên tạo sẵn tên `gia` trong hộp với giá trị `undefined`.

```
tinhGia      chưa chạy dòng nào   { gia: undefined }
file         dừng ở dòng 6
```

**Bước 2: dòng 2 `console.log(gia)`.** `gia` đã có trong hộp, giá trị là `undefined`, nên in ra `undefined`.

**Bước 3: dòng 3 `var gia = 100`.** Tên `gia` đã có sẵn, nên dòng này chỉ còn làm một việc là gán `100` vào.

```
tinhGia      đang chạy dòng 3     { gia: 100 }
file         dừng ở dòng 6
```

**Bước 4: dòng 4 in ra** `100`.

Việc tạo tên biến trước khi chạy dòng nào như vậy gọi là **hoisting** ("kéo lên"). Thực ra không có dòng code nào bị kéo đi đâu cả. Kết quả chỉ trông như thể dòng khai báo đã được đưa lên đầu hàm.

## 2. Vì sao JS phải tạo tên trước

Lần này có một biến `gia` ở ngoài hàm, và một biến `gia` khác khai báo bằng `let` ở trong hàm:

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

Nhiều người đoán dòng 3 sẽ in ra `1`, vì lúc đó `gia` bên trong hàm chưa được khai báo. Chạy từng bước sẽ thấy vì sao không phải vậy.

**Bước 1: dòng 6 gọi `tinhGia()`.** JS tạo hộp cho `tinhGia`, đọc lướt thân hàm, thấy dòng 4 có `let gia`, nên tạo sẵn tên `gia`. Khác với `var`, tên này được đánh dấu là **chưa khởi tạo**, chứ không có giá trị `undefined`.

```
tinhGia      chưa chạy dòng nào   { gia: <chưa khởi tạo> }
file         dừng ở dòng 6        { gia: 1, tinhGia }
```

**Bước 2: dòng 3 `console.log(gia)`.** JS tìm `gia` theo quy tắc ở [bài 1](01-lexical-scope.md): tìm trong hộp của mình trước. Hộp `tinhGia` **có** tên `gia`, nên JS dừng tìm, không ra ngoài lấy `gia = 1`. Nhưng `gia` đang ở trạng thái chưa khởi tạo, nên JS báo lỗi.

Giả sử JS không đọc lướt trước. Khi đó tới dòng 3, hộp `tinhGia` chưa có `gia`, JS sẽ ra ngoài lấy được `1`. Tới dòng 4 lại xuất hiện một `gia` khác có giá trị `2`. Cùng một chữ `gia` trong một hàm sẽ chỉ hai biến khác nhau, tuỳ code đã chạy tới đâu, và đọc code sẽ rất dễ nhầm. Nhờ tạo tên trước, chỉ cần nhìn code là biết: **trong cả hàm `tinhGia`, chữ `gia` luôn là biến của chính hàm**. Đây là lý do JS phải tạo tên trước.

## 3. Vì sao `var` và `let` khác nhau

Cả hai đều được tạo tên trước. Chỗ khác nhau là giá trị lúc mới tạo:

| Khai báo | Lúc mới tạo trong hộp | Đọc trước dòng khai báo |
|---|---|---|
| `var` | `undefined` | in ra `undefined`, không báo lỗi |
| `let`, `const` | chưa khởi tạo | báo lỗi `Cannot access ... before initialization` |

Hành vi của `var` không xuất phát từ một lý do hay ho nào. JS được viết rất vội vào năm 1995 (khoảng 10 ngày), với mục tiêu là ngôn ngữ dễ dãi cho các đoạn script nhỏ trên trang web. Brendan Eich, người tạo ra JS, từng nói hành vi này của `var` là hệ quả ngoài ý muốn của cách cài đặt lúc đó. Nó dễ gây lỗi, vì code chạy tiếp với giá trị `undefined` mà không ai hay biết.

JS không xoá được hành vi đó, vì xoá đi thì hàng triệu trang web cũ sẽ hỏng. Vì vậy năm 2015 JS thêm `let`/`const`: vẫn tạo tên trước để cả hàm hiểu chữ `gia` theo cùng một nghĩa, nhưng đọc sớm thì báo lỗi ngay.

Khi viết code, chỉ dùng `let`/`const`. TypeScript và ESLint (rule `no-var`) sẽ chặn `var` từ trước khi chạy. Bạn vẫn cần hiểu `var` để đọc được code cũ.

## 4. `function`: gọi trước dòng khai báo vẫn chạy được

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

**Bước 1: bắt đầu chạy file.** JS tạo hộp cho file và đọc lướt cả file trước khi chạy dòng 1. JS thấy hai khai báo `function`. Với `function`, JS không chỉ tạo tên mà **đưa luôn cả code của hàm** vào hộp.

```
file         chưa chạy dòng nào   { nauCanh: <hàm>, nauNuocDung: <hàm> }
```

**Bước 2: dòng 1 gọi `nauCanh()`.** Tên `nauCanh` đã có sẵn trong hộp, kèm theo code, nên gọi được ngay. Từ đây mọi thứ chạy y như bài 2: `nauCanh` gọi `nauNuocDung`, và lúc đó `nauNuocDung` cũng đã có sẵn trong hộp file.

Nhờ vậy, bạn có thể viết phần chính ở trên và các hàm phụ ở dưới, đọc từ trên xuống như đọc mục lục. Đây là phần hoisting được làm ra có chủ đích, khác với `var`.

Hàm viết bằng arrow function rồi gán vào `const` thì khác. Lúc này nó là một khai báo `const`, chứ không phải khai báo `function`:

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

Ở bước đọc lướt, `nauCanh` được tạo như mọi biến `const` khác, ở trạng thái chưa khởi tạo. Code của hàm chỉ được gán vào khi chạy tới dòng 3.

Bảng ở mục 3 có thêm một dòng:

| Khai báo | Lúc mới tạo trong hộp | Dùng trước dòng khai báo |
|---|---|---|
| `var` | `undefined` | ra `undefined`, không báo lỗi |
| `let`, `const` (kể cả `const f = () => {}`) | chưa khởi tạo | báo lỗi |
| `function f() {}` | đã có sẵn code của hàm | gọi được bình thường |

## 5. Vì sao `var` bỏ qua block

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

**Bước 1: dòng 9 gọi `nau()`.** JS tạo hộp cho `nau` và đọc lướt thân hàm. `var mon` nằm trong block `if`, nhưng `var` **luôn được ghi vào hộp của hàm**, nên `mon` có mặt trong hộp `nau` ngay từ đầu. Còn `let rau` thì không được ghi vào hộp `nau`.

```
nau          chưa chạy dòng nào   { mon: undefined }
file         dừng ở dòng 9
```

**Bước 2: dòng 2 chạy vào block `if`.** Với `let`/`const`, mỗi block có một hộp nhỏ riêng. JS tạo hộp nhỏ này nằm bên trong hộp `nau`, đọc lướt block, rồi tạo `rau` trong đó.

```
nau          đang chạy dòng 3     { mon: undefined }
  └ block if                      { rau: <chưa khởi tạo> }
file         dừng ở dòng 9
```

**Bước 3: dòng 3 và dòng 4.** Ở dòng 3, JS tìm `mon` trong hộp block nhưng không có, nên ra hộp `nau` và gán `'canh'` vào đó. Ở dòng 4, JS gán `'rau ngót'` vào `rau` trong hộp block.

```
nau          đang chạy dòng 4     { mon: 'canh' }
  └ block if                      { rau: 'rau ngót' }
file         dừng ở dòng 9
```

**Bước 4: dòng 5, hết block.** JS bỏ hộp block đi, và `rau` mất theo hộp, giống như hộp của một hàm chạy xong ở bài 2.

```
nau          đang chạy dòng 6     { mon: 'canh' }
file         dừng ở dòng 9
```

**Bước 5: dòng 6 in ra** `canh`. Tới dòng 7, JS tìm `rau` trong hộp `nau` rồi ra hộp file, đều không có, nên báo `rau is not defined`.

Lý do vẫn nằm ở lịch sử như mục 3. Năm 1995 JS chỉ có hộp cho hàm và cho file, chưa có hộp cho block, nên `var` chỉ biết ghi vào hộp của hàm. Hộp block chỉ xuất hiện từ năm 2015, cùng lúc với `let`/`const`. `var` vẫn giữ cách cũ để code cũ không bị hỏng.

## Tóm tắt

- Trước khi chạy một hàm, JS đọc lướt thân hàm và tạo sẵn mọi tên được khai báo trong hộp. Việc này gọi là hoisting.
- JS làm vậy để trong cả hàm, một tên luôn chỉ đúng một biến.
- `var` lúc mới tạo có giá trị `undefined`. `let`/`const` lúc mới tạo ở trạng thái chưa khởi tạo, đọc sớm thì báo lỗi. `function` có sẵn cả code của hàm.
- `const f = () => {}` là khai báo `const`, nên không gọi trước dòng khai báo được.
- `var` luôn ghi vào hộp của hàm, nên bỏ qua block. `let`/`const` có hộp riêng cho mỗi block.
