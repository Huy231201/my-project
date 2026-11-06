# Bài 4: Vì sao hàm chạy xong mà biến vẫn còn? (Closure)

Ở [bài 2](02-execution-context.md), `nauCanh` in `1 1 1` vì mỗi lần gọi là một hộp mới. Đoạn dưới chỉ chuyển biến ra hàm bao ngoài, vậy mà lại đếm được:

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
- Bài 2 hộp bị xoá, sao giờ lại được giữ?
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

## 1. Hàm bên trong nhớ hộp nơi nó được tạo

**Bước 1: dòng 9 gọi `taoNoiLau()`.**

- JS tạo hộp `taoNoiLau`, tạo sẵn `rau` và `themRau` ([bài 3](03-hoisting.md)). Dòng 2 gán `rau = 0`.
- Khi tạo hàm `themRau`, JS **gắn vào nó một ghi nhớ**: hộp nơi nó được tạo, tức hộp `taoNoiLau` lần này.

```
taoNoiLau    đang chạy dòng 7     { rau: 0, themRau: <hàm> }
                                    themRau nhớ: hộp taoNoiLau này
file         dừng ở dòng 9
```

**Bước 2: dòng 7 `return themRau`.**

- `taoNoiLau` chạy xong, hộp ra khỏi call stack.
- `themRau` được gán vào `ban1`, và vẫn nhớ hộp `taoNoiLau`.
- Còn có người trỏ tới, nên hộp **không bị xoá** (mục 2).

```
call stack:   file    đang chạy dòng 10    { ban1: <hàm themRau> }
ngoài stack:  hộp taoNoiLau cũ             { rau: 0 }   ← ban1 vẫn trỏ tới
```

**Bước 3: dòng 10 gọi `ban1()`.**

- JS tạo hộp mới, trống, cho lần gọi `themRau` này.
- Dòng 4 cần `rau`, hộp `themRau` không có.
- Ra **hộp nơi hàm được viết** ([bài 1](01-lexical-scope.md)), chính là hộp `themRau` đang nhớ. Thấy `rau = 0`, tăng lên 1.

```
call stack:   themRau đang chạy dòng 4     { }  thiếu rau → ra hộp nó nhớ
              file    dừng ở dòng 10
ngoài stack:  hộp taoNoiLau cũ             { rau: 1 }
```

**Bước 4: `themRau` chạy xong.** Hộp `themRau` bị xoá, hộp `taoNoiLau` cũ vẫn còn với `rau: 1`.

**Bước 5: dòng 11, 12** lặp lại bước 3–4. Mọi lần gọi dùng chung hộp `taoNoiLau` cũ, nên `rau` lên 2, lên 3.

- Một hàm cùng với hộp mà nó ghi nhớ gọi là **closure**.

## 2. Hộp bị xoá khi nào

JS chỉ có **một quy tắc**: hộp bị xoá khi **không còn ai trỏ tới nó**. Không phải khi hàm chạy xong.

Hai việc khác nhau:

- **Ra khỏi call stack**: ngay khi hàm chạy xong. Hàm không chạy nữa.
- **Bị xoá khỏi bộ nhớ**: khi không còn ai trỏ tới. Do garbage collector (bộ dọn rác) làm.

So sánh:

- Bài 2, `nauCanh`: chạy xong, không ai trỏ tới hộp `{ muoi }`, nên bị xoá. Lần sau `muoi` lại từ `0`.
- Bài 4, `taoNoiLau`: chạy xong, `ban1` vẫn trỏ tới hộp `{ rau }`, nên được giữ. Gán `ban1 = null` thì hộp mới bị xoá.

```
bài 2:  hộp { muoi }  ← không ai trỏ tới  → xoá
bài 4:  hộp { rau }   ← ban1 trỏ tới      → giữ lại
```

Vì sao JS không xoá luôn khi hàm xong:

- Xoá luôn thì `ban1()` sẽ tìm `rau` trong hộp đã mất, code hỏng.
- JS không biết trước ai sẽ cần hộp nào, nên dùng quy tắc an toàn: còn người trỏ tới thì còn giữ.

## 3. Vì sao JS cần closure

Closure là hệ quả tất yếu khi ngôn ngữ có cùng lúc hai thứ:

- **Hàm là một giá trị**: truyền đi, trả về, và được gọi **sau**, khi hàm tạo ra nó đã chạy xong.
- **Lexical scope** ([bài 1](01-lexical-scope.md)): hàm tìm biến ở chỗ nó được viết.

Hàm chạy sau mà vẫn tìm biến ở chỗ viết, thì hộp ở chỗ đó phải còn. JS lấy cả hai thứ này từ ngôn ngữ Scheme (1975), nên có closure ngay từ đầu.

Trên web, rất nhiều hàm chạy sau: hẹn giờ, bấm nút, chờ API.

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

- **Dòng 7**: tạo hộp `{ mon: 'lẩu' }`. Dòng 2 tạo hàm hẹn giờ, hàm này nhớ hộp `henGio`. `setTimeout` cất hàm lại.
- **Dòng 5**: in `henGio chạy xong`. `henGio` ra khỏi call stack, nhưng hàm hẹn giờ vẫn trỏ tới hộp, nên hộp còn.
- **1 giây sau**: Node gọi hàm hẹn giờ. Dòng 3 cần `mon`, ra hộp `henGio` đang nhớ, thấy `'lẩu'`.

React cũng vậy: `onClick={() => xoa(item.id)}` chạy khi người dùng bấm, component đã render xong từ lâu, nhưng hàm vẫn biết `item.id`.

## 4. Trước khi có closure, người ta làm thế nào

**Biến global:**

- Gặp đúng lỗi ở bài 1: các hàm đè biến của nhau.
- Cả chương trình chỉ có một bộ đếm, hai bàn không đếm riêng được.

**Tự mang dữ liệu theo hàm:**

- Ngôn ngữ C không có closure. Đăng ký callback phải truyền kèm con trỏ tới dữ liệu, và tự lo dữ liệu còn sống hay đã bị xoá.
- JS còn giữ dấu vết cách này: `setTimeout` cho truyền thêm tham số.

```js
function baoXong(mon) {
  console.log('xong ' + mon);
}
setTimeout(baoXong, 1000, 'lẩu');
```

```
xong lẩu
```

- Thời jQuery: nhét dữ liệu vào HTML (`<button data-id="5">`), lúc click đọc lại từ nút.

**Object giữ trạng thái:**

```js
const ban1 = { rau: 0 };
function themRau(ban) {
  ban.rau = ban.rau + 1;
  console.log('số đĩa rau:', ban.rau);
}
themRau(ban1);
ban1.rau = 100;
themRau(ban1);
```

```
số đĩa rau: 1
số đĩa rau: 101
```

- Mỗi lần gọi phải nhớ truyền `ban1`.
- Ai cũng sửa được `ban1.rau`.
- Với closure, `rau` nằm trong hộp, chỉ `themRau` đọc và sửa được.

Object và closure làm được cùng việc. React trước dùng class (`this.state`), sau chuyển sang function component với hooks, và hooks dựa hoàn toàn vào closure.

## Tóm tắt

- Khi tạo một hàm, JS gắn vào nó ghi nhớ về hộp nơi nó được tạo. Hàm cùng hộp đó là closure.
- Hàm chạy xong thì hộp ra khỏi call stack. Hộp chỉ bị xoá khi không còn ai trỏ tới.
- Closure là hệ quả của: hàm là giá trị (gọi sau được) + lexical scope (tìm biến ở chỗ viết).
- Không có closure thì dùng biến global, tự mang dữ liệu theo hàm, hoặc object.
