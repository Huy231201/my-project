# Bài 4: Vì sao hàm chạy xong mà biến vẫn còn? (Closure)

Ở [bài 2](02-execution-context.md), `nauCanh` in `1 1 1`, vì mỗi lần gọi là một hộp mới. Đoạn dưới đây lại đếm được:

```js
1  function taoNoiLau() {
2    let rau = 0;
3    function themRau() {
4      rau = rau + 1;
5      console.log('số đĩa rau:', rau);
6    }
7    return themRau;
8  }
9  const ban1 = taoNoiLau();
10 ban1();
11 ban1();
12 ban1();
```

```
số đĩa rau: 1
số đĩa rau: 2
số đĩa rau: 3
```

`taoNoiLau` chạy xong từ dòng 9, vậy mà `rau` vẫn còn và vẫn tăng. Sau bài này cần trả lời được:

- `rau` đang nằm ở đâu?
- Ở bài 2 hộp bị xoá, sao giờ lại được giữ?
- Vì sao JS cần closure? Trước đó người ta làm thế nào?

## 0. Hình dung: nồi lẩu ở nhà hàng

Bếp chuẩn bị nồi lẩu, mang ra bàn cho khách kèm cái muôi. Bếp xong việc, nhưng không ai rửa nồi vì khách còn dùng. Khách thả rau thì vào đúng nồi đó. Khách về rồi nồi mới được dọn.

| Nhà hàng lẩu | JavaScript |
|---|---|
| Bếp chuẩn bị nồi lẩu | gọi `taoNoiLau()`, JS tạo hộp |
| Nồi lẩu | hộp `{ rau }` |
| Mang nồi ra bàn kèm cái muôi | `return themRau` |
| Khách thả thêm rau | gọi `ban1()` |
| Bếp xong việc nhưng chưa rửa nồi | `taoNoiLau` chạy xong nhưng hộp chưa bị xoá |
| Khách về, nồi mới được dọn | không còn ai trỏ tới hộp thì hộp bị xoá |

## 1. Chạy từng bước

**Bước 1: bắt đầu chạy file.**

- JS tạo hộp file, đọc lướt file ([bài 3](03-hoisting.md)).
- Thấy `function taoNoiLau` ở dòng 1: đưa cả code của hàm vào hộp file.
- Thấy `const ban1` ở dòng 9: tạo tên `ban1`, chưa khởi tạo.

```
file         chưa chạy dòng nào   { taoNoiLau: <hàm>, ban1: <chưa khởi tạo> }
```

**Bước 2: dòng 9 `const ban1 = taoNoiLau();`**

- Dòng này có hai việc: gọi `taoNoiLau()` ở bên phải, rồi gán kết quả vào `ban1` ở bên trái.
- Bên phải chạy trước. `ban1` đứng chờ kết quả.
- Hộp file ghi "dừng ở dòng 9, chờ kết quả".
- JS tạo hộp cho lần gọi `taoNoiLau` này, đặt lên trên.

**Bước 3: JS đọc lướt thân `taoNoiLau`.**

- Thấy `let rau` ở dòng 2: tạo tên `rau`, chưa khởi tạo.
- Thấy `function themRau` ở dòng 3: tạo hàm `themRau`, đưa vào hộp. Thân `themRau` (dòng 4–5) **chưa chạy**.
- Lúc tạo `themRau`, JS **gắn vào hàm một ghi nhớ**: hộp đang chạy lúc nó được tạo, tức hộp `taoNoiLau` của lần gọi này.
  - Vì sao phải nhớ: theo [bài 1](01-lexical-scope.md), hàm tìm biến ở chỗ nó được viết. Sau này `themRau` có thể được gọi ở bất cứ đâu, nên phải ghi lại chỗ đó ngay từ lúc tạo.

**Bước 4: dòng 2 `let rau = 0`.** Gán `0` vào `rau`.

```
taoNoiLau    đang chạy dòng 2     { rau: 0, themRau: <hàm> }
                                    themRau nhớ: hộp taoNoiLau này
file         dừng ở dòng 9
```

**Bước 5: dòng 7 `return themRau`.**

- `themRau` **không có** dấu `()`, nên đây không phải lời gọi hàm. `return themRau` trả về **chính cái hàm `themRau`**, như trả về một giá trị bình thường.
- (Nếu viết `return themRau()` thì sẽ gọi `themRau` và trả về kết quả của nó. Ở đây không phải vậy.)
- `taoNoiLau` kết thúc. Hộp `taoNoiLau` **ra khỏi call stack**.
- Giá trị trả về (hàm `themRau`) được mang về đúng chỗ đã gọi: dòng 9.

**Bước 6: quay về dòng 9, gán vào `ban1`.**

- Bên phải đã có kết quả: hàm `themRau`.
- Gán vào `ban1`. Từ giờ `ban1` **chính là hàm `themRau`**, nên gọi `ban1()` là chạy thân `themRau` (dòng 4–5).

**Bước 7: hộp `taoNoiLau` có bị xoá không?**

- Hộp bị xoá khi không còn ai trỏ tới ([bài 2](02-execution-context.md)).
- Kiểm tra: `ban1` trỏ tới hàm `themRau`, và hàm `themRau` nhớ hộp `taoNoiLau`.

  ```
  ban1 ──► hàm themRau ──nhớ──► hộp taoNoiLau { rau: 0 }
  ```

- Vẫn còn đường trỏ tới hộp, nên hộp **không bị xoá**. Nó đã ra khỏi call stack nhưng vẫn còn trong bộ nhớ.

```
call stack:   file    đang chạy dòng 10    { taoNoiLau, ban1: <hàm themRau> }
ngoài stack:  hộp taoNoiLau cũ             { rau: 0 }   ← themRau vẫn nhớ
```

**Bước 8: dòng 10 `ban1()`.**

- `ban1` là hàm `themRau`, nên JS chạy thân `themRau`.
- Tạo một hộp mới cho lần gọi này. `themRau` không khai báo biến nào, nên hộp trống.
- Dòng 4 `rau = rau + 1`: cần đọc `rau`.
  - Tìm trong hộp lần gọi: không có.
  - Ra bên ngoài. Bên ngoài của `themRau` là chỗ nó được viết, chính là hộp mà nó nhớ: hộp `taoNoiLau` cũ.
  - Có `rau = 0`. Tính `0 + 1`, gán lại vào `rau` trong hộp đó: `rau = 1`.
- Dòng 5: in `số đĩa rau: 1`.

```
call stack:   themRau đang chạy dòng 4     { }  thiếu rau → ra hộp nó nhớ
              file    dừng ở dòng 10
ngoài stack:  hộp taoNoiLau cũ             { rau: 1 }
```

**Bước 9: hết `themRau`.**

- Hộp của lần gọi này ra khỏi call stack.
- Không ai trỏ tới hộp lần gọi này, nên nó bị xoá.
- Hộp `taoNoiLau` cũ vẫn còn, vì `themRau` vẫn nhớ nó. `rau` vẫn là `1`.

**Bước 10: dòng 11 `ban1()`.**

- Lặp lại bước 8–9 với một hộp lần gọi mới.
- Dòng `let rau = 0` **không chạy lại**, vì nó nằm trong `taoNoiLau`, mà `taoNoiLau` không được gọi lại.
- `rau` trong hộp cũ đang là `1`, tăng lên `2`. In `2`.

**Bước 11: dòng 12 `ban1()`.** Tương tự, `rau` lên `3`. In `3`.

Kết luận:

- Hàm `themRau` cùng với hộp mà nó ghi nhớ gọi là **closure**.

## 2. Hộp nào bị xoá, hộp nào được giữ

Quy tắc chỉ có một: **hộp bị xoá khi không còn ai trỏ tới**.

Mọi hàm đều nhớ hộp nơi nó được tạo, không có ngoại lệ:

- `nauCanh` (bài 2) được tạo ở file, nên nhớ **hộp file**.
- `themRau` được tạo trong lúc `taoNoiLau` đang chạy, nên nhớ **hộp `taoNoiLau`** của lần gọi đó.

Hàm **không** nhớ hộp của những lần chính nó chạy. Vậy:

| Hộp | Có ai trỏ tới sau khi chạy xong? | Kết quả |
|---|---|---|
| Hộp lần gọi `nauCanh` `{ muoi }` | không | xoá |
| Hộp lần gọi `themRau` `{ }` | không | xoá |
| Hộp lần gọi `taoNoiLau` `{ rau }` | có: `ban1` → `themRau` → hộp | giữ |

Vì sao bài 2 không đếm được, bài 4 đếm được:

- `nauCanh` có nhớ, nhưng nhớ hộp file, mà hộp file **không có `muoi`**.
- `muoi` nằm trong hộp lần gọi `nauCanh`. Mỗi lần gọi, dòng `let muoi = 0` chạy lại trong hộp mới.
- `rau` nằm trong hộp mà `themRau` nhớ. Gọi `ban1()` không chạy lại dòng `let rau = 0`.

Kiểm chứng: chuyển `muoi` ra ngoài `nauCanh`, vào hộp file mà `nauCanh` nhớ:

```js
1  let muoi = 0;
2  function nauCanh() {
3    muoi = muoi + 1;
4    console.log('số muỗng muối:', muoi);
5  }
6  nauCanh();
7  nauCanh();
8  nauCanh();
```

```
số muỗng muối: 1
số muỗng muối: 2
số muỗng muối: 3
```

- Dòng 1 chạy **một lần**, tạo `muoi = 0` trong hộp file.
- Mỗi lần gọi `nauCanh`, dòng 3 tìm `muoi`: hộp lần gọi không có, ra hộp file, có. Tăng lên.
- Kết quả đếm được, cùng cơ chế như bài 4.

Mỗi lần gọi `taoNoiLau` là một hộp riêng, nên mỗi bàn có nồi riêng:

```js
const ban1 = taoNoiLau();
const ban2 = taoNoiLau();
ban1();
ban1();
ban2();
```

```
số đĩa rau: 1
số đĩa rau: 2
số đĩa rau: 1
```

- Dòng 1: gọi `taoNoiLau` lần 1, tạo hộp lần 1 `{ rau: 0 }`. `themRau` lần 1 nhớ hộp này, gán vào `ban1`.
- Dòng 2: gọi `taoNoiLau` lần 2, tạo hộp lần 2 `{ rau: 0 }`. Một hàm `themRau` **mới** được tạo, nhớ hộp lần 2, gán vào `ban2`.
- `ban1()` hai lần: tăng `rau` trong hộp lần 1, lên `2`.
- `ban2()` một lần: tăng `rau` trong hộp lần 2, lên `1`.

```
ban1 ──► themRau (lần 1) ──nhớ──► hộp lần 1 { rau: 2 }
ban2 ──► themRau (lần 2) ──nhớ──► hộp lần 2 { rau: 1 }
```

Vì sao JS không xoá hộp ngay khi hàm chạy xong:

- Xoá ngay thì ở bước 8, `ban1()` tìm `rau` trong một hộp đã mất, code hỏng.
- JS không biết trước ai sẽ cần hộp nào, nên dùng quy tắc an toàn: còn ai trỏ tới thì còn giữ.

## 3. Vì sao JS cần closure

Closure là hệ quả tất yếu khi ngôn ngữ có cùng lúc hai thứ:

- **Hàm là một giá trị**: trả về được (như `return themRau`), truyền đi được, và được gọi **sau**, khi hàm tạo ra nó đã chạy xong.
- **Lexical scope** ([bài 1](01-lexical-scope.md)): hàm tìm biến ở chỗ nó được viết.

Hàm được gọi sau mà vẫn tìm biến ở chỗ viết, thì hộp ở chỗ đó phải còn. JS lấy cả hai thứ này từ ngôn ngữ Scheme (1975), nên có closure ngay từ đầu.

Trên web, rất nhiều hàm được gọi sau: hẹn giờ, bấm nút, chờ API.

```js
1  function henGio(mon) {
2    setTimeout(function () {
3      console.log('xong ' + mon);
4    }, 1000);
5    console.log('henGio chạy xong');
6  }
7  henGio('lẩu');
```

```
henGio chạy xong
xong lẩu
```

- **Dòng 7**: gọi `henGio('lẩu')`. Tạo hộp lần gọi, `mon = 'lẩu'`.
- **Dòng 2**: tạo một hàm mới (gọi là hàm hẹn giờ, dòng 2–4). Hàm này được tạo trong lúc `henGio` đang chạy, nên nhớ hộp `henGio`.
- Hàm hẹn giờ được **truyền vào** `setTimeout`, chưa chạy. `setTimeout` cất hàm lại, hẹn 1000 ms (1 giây) sau sẽ gọi nó.
- **Dòng 5**: in `henGio chạy xong`.
- **Dòng 6**: hết `henGio`. Hộp ra khỏi call stack. `setTimeout` còn giữ hàm hẹn giờ, hàm đó nhớ hộp `henGio`, nên hộp **không bị xoá**.
- **1 giây sau**: Node gọi hàm hẹn giờ. Dòng 3 cần `mon`: hộp lần gọi không có, ra hộp `henGio` mà hàm nhớ, có `'lẩu'`. In `xong lẩu`.

React cũng vậy: `onClick={() => xoa(item.id)}` tạo một hàm trong lúc component render. Hàm đó được gọi khi người dùng bấm, lúc component đã render xong từ lâu, nhưng vẫn biết `item.id` nhờ nhớ hộp của lần render đó.

## 4. Trước khi có closure, người ta làm thế nào

**Biến global:**

- Gặp đúng lỗi ở bài 1: các hàm đè biến của nhau.
- Cả chương trình chỉ có một bộ đếm, hai bàn không đếm riêng được.

**Tự mang dữ liệu theo hàm:**

- Ngôn ngữ C không có closure. Đăng ký callback phải truyền kèm con trỏ tới dữ liệu, và tự lo dữ liệu còn sống hay đã bị xoá.
- JS còn giữ dấu vết cách này: `setTimeout` cho truyền thêm tham số.

```js
1  function baoXong(mon) {
2    console.log('xong ' + mon);
3  }
4  setTimeout(baoXong, 1000, 'lẩu');
```

```
xong lẩu
```

- Dòng 4: truyền hàm `baoXong` và giá trị `'lẩu'` vào `setTimeout`.
- 1 giây sau, `setTimeout` gọi `baoXong('lẩu')`, tức tự đưa `'lẩu'` vào làm tham số `mon`. Không cần nhớ hộp nào.
- Thời jQuery: nhét dữ liệu vào HTML (`<button data-id="5">`), lúc click đọc lại từ nút.

**Object giữ trạng thái:**

```js
1  const ban1 = { rau: 0 };
2  function themRau(ban) {
3    ban.rau = ban.rau + 1;
4    console.log('số đĩa rau:', ban.rau);
5  }
6  themRau(ban1);
7  ban1.rau = 100;
8  themRau(ban1);
```

```
số đĩa rau: 1
số đĩa rau: 101
```

- Dòng 6: truyền `ban1` vào, `rau` lên `1`.
- Dòng 7: code bên ngoài sửa thẳng `ban1.rau = 100`.
- Dòng 8: `rau` lên `101`.
- Nhược điểm:
  - Mỗi lần gọi phải nhớ truyền `ban1`.
  - Ai cũng sửa được `ban1.rau`, như dòng 7.
- Với closure, `rau` nằm trong hộp, chỉ `themRau` đọc và sửa được.

Object và closure làm được cùng việc. React trước dùng class (`this.state`), sau chuyển sang function component với hooks, và hooks dựa hoàn toàn vào closure.

## Tóm tắt

- Mọi hàm khi được tạo đều nhớ hộp đang chạy lúc đó. Hàm cùng hộp nó nhớ là closure.
- `return themRau` trả về chính hàm, gán vào `ban1`, nên `ban1()` là chạy `themRau`.
- Hộp chỉ bị xoá khi không còn ai trỏ tới. `ban1` → `themRau` → hộp `{ rau }`, nên hộp được giữ.
- Biến trong hộp lần gọi thì mới mỗi lần. Biến trong hộp được nhớ thì dùng chung qua các lần gọi.
- Closure là hệ quả của: hàm là giá trị (gọi sau được) + lexical scope (tìm biến ở chỗ viết).
- Không có closure thì dùng biến global, tự mang dữ liệu theo hàm, hoặc object.
