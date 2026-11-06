# Bài 4: Vì sao hàm chạy xong mà biến vẫn còn? (Closure)

Ở [bài 2](02-execution-context.md), hàm này in ra `1 1 1`, vì mỗi lần gọi là một hộp mới và hộp bị bỏ đi khi hàm chạy xong:

```js
function nauCanh() {
  let muoi = 0;
  muoi = muoi + 1;
  console.log('số muỗng muối:', muoi);
}
```

Đoạn dưới đây chỉ chuyển biến ra một hàm bao ngoài, vậy mà kết quả lại đếm được:

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

`taoNoiLau` đã chạy xong từ dòng 9, vậy mà `rau` vẫn còn và vẫn tăng dần. Bài này trả lời ba câu hỏi:

1. `rau` đang nằm ở đâu?
2. Vì sao JS phải giữ nó lại?
3. Trước khi có closure, người ta giải quyết chuyện này thế nào?

## 0. Hình dung: nồi lẩu ở nhà hàng

Ở bài 2, nấu xong thì rửa nồi. Nhà hàng lẩu thì khác: bếp chuẩn bị nồi lẩu rồi mang ra bàn cho khách, kèm theo một cái muôi. Phần việc của bếp đến đó là xong, nhưng không ai đem nồi đi rửa, vì khách còn đang dùng. Mỗi lần khách thả thêm rau thì rau vào đúng nồi đó. Khách về rồi thì nồi mới được dọn đi rửa.

| Nhà hàng lẩu | JavaScript |
|---|---|
| Bếp chuẩn bị nồi lẩu | gọi `taoNoiLau()`, JS tạo hộp |
| Nồi lẩu | hộp biến của lần gọi đó (`{ rau }`) |
| Mang nồi ra bàn kèm cái muôi | `return themRau` |
| Khách thả thêm rau | gọi `ban1()` |
| Bếp xong việc nhưng chưa rửa nồi | `taoNoiLau` chạy xong nhưng hộp chưa bị bỏ |
| Khách về, nồi mới được dọn | không còn ai giữ `ban1` thì hộp mới bị bỏ |

## 1. Hàm bên trong nhớ hộp nơi nó được tạo

**Bước 1: dòng 9 gọi `taoNoiLau()`.** JS tạo hộp cho `taoNoiLau`. Như ở [bài 3](03-hoisting.md), JS đọc lướt thân hàm và tạo sẵn `rau` cùng `themRau`. Dòng 2 gán `rau = 0`.

Có một điều bài 2 chưa nói tới: khi tạo hàm `themRau`, JS **gắn vào hàm đó một ghi nhớ**, đó là hộp nơi hàm được tạo ra, tức hộp `taoNoiLau` của lần gọi này.

```
taoNoiLau    đang chạy dòng 7     { rau: 0, themRau: <hàm> }
                                    themRau nhớ: hộp taoNoiLau này
file         dừng ở dòng 9
```

**Bước 2: dòng 7 `return themRau`.** `taoNoiLau` chạy xong, nên hộp của nó bị lấy ra khỏi call stack. Ở bài 2, tới đây thì hộp bị bỏ đi. Nhưng lần này `themRau` được trả ra ngoài, gán vào `ban1`, và **vẫn còn ghi nhớ hộp đó**. Hộp còn có người cần dùng, nên JS chưa bỏ nó đi.

```
call stack:   file    đang chạy dòng 10    { ban1: <hàm themRau> }
ngoài stack:  hộp taoNoiLau cũ             { rau: 0 }   ← ban1 vẫn giữ
```

Hộp này đã ra khỏi call stack nhưng vẫn còn trong bộ nhớ, giống nồi lẩu đã rời bếp nhưng vẫn còn trên bàn khách.

**Bước 3: dòng 10 gọi `ban1()`.** JS tạo một hộp mới, đang trống, cho lần gọi `themRau` này. Dòng 4 cần `rau`, nhưng hộp `themRau` không có. Theo quy tắc ở [bài 1](01-lexical-scope.md), JS ra **hộp nơi hàm được viết**, cũng chính là hộp mà `themRau` đang ghi nhớ: hộp `taoNoiLau` cũ. JS tìm thấy `rau = 0` và tăng lên 1.

```
call stack:   themRau đang chạy dòng 4     { }  thiếu rau → ra hộp nó nhớ
              file    dừng ở dòng 10
ngoài stack:  hộp taoNoiLau cũ             { rau: 1 }
```

**Bước 4: `themRau` chạy xong.** JS bỏ hộp `themRau`, nhưng hộp `taoNoiLau` cũ vẫn còn nguyên, với `rau: 1`.

**Bước 5: dòng 11 và dòng 12** lặp lại bước 3 và bước 4. Mỗi lần gọi đều tạo hộp `themRau` mới, nhưng tất cả đều dùng chung một hộp `taoNoiLau` cũ, nên `rau` lên 2 rồi lên 3.

Như vậy chỗ khác với `nauCanh` ở bài 2 nằm ở **nơi chứa biến**. `muoi` nằm trong hộp của chính hàm được gọi, nên mỗi lần gọi lại có một `muoi` mới. Còn `rau` nằm trong hộp của hàm bao ngoài, và hộp đó được giữ lại vì `themRau` vẫn còn nhớ nó.

Một hàm cùng với hộp mà nó ghi nhớ được gọi là **closure**.

## 2. Vì sao JS phải giữ hộp lại

Không ai thiết kế closure để giải riêng một bài toán nào. Nó là hệ quả tất yếu khi một ngôn ngữ có cùng lúc hai thứ:

- **Hàm là một giá trị.** Hàm truyền đi được, trả về được, và có thể được gọi **sau**, khi hàm tạo ra nó đã chạy xong.
- **Lexical scope** ([bài 1](01-lexical-scope.md)): hàm tìm biến ở chỗ nó được viết.

Hàm chạy sau mà vẫn tìm biến ở chỗ nó được viết, thì hộp ở chỗ đó phải còn. JS chỉ có hai lựa chọn: hoặc giữ hộp lại, hoặc để code hỏng. JS lấy cả hai thứ trên từ ngôn ngữ Scheme (1975), nên có closure ngay từ đầu.

Trên web, rất nhiều hàm được chạy sau: hẹn giờ, bấm nút, chờ API trả về. Ví dụ hẹn giờ:

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

**Bước 1: dòng 7 gọi `henGio('lẩu')`.** JS tạo hộp `{ mon: 'lẩu' }`. Dòng 2 tạo một hàm mới (hàm hẹn giờ) và hàm này ghi nhớ hộp `henGio`. `setTimeout` cất hàm đó lại để 1 giây sau mới gọi.

**Bước 2: dòng 5 in ra `henGio chạy xong`.** `henGio` chạy xong, hộp của nó ra khỏi call stack, nhưng hàm hẹn giờ vẫn còn nhớ nó, nên hộp vẫn được giữ lại.

**Bước 3: 1 giây sau, Node gọi hàm hẹn giờ.** Dòng 3 cần `mon`. Hộp của hàm hẹn giờ không có, nên JS ra hộp `henGio` mà hàm đang nhớ, tìm thấy `'lẩu'`.

React cũng hoạt động như vậy: `onClick={() => xoa(item.id)}` chạy khi người dùng bấm, lúc đó component đã render xong từ lâu, nhưng hàm vẫn biết `item.id` nhờ closure.

## 3. Trước khi có closure, người ta làm thế nào

Có ba cách, và cả ba vẫn còn gặp tới bây giờ:

- **Dùng biến global.** Gặp đúng lỗi ở bài 1: các hàm đè biến của nhau, và cả chương trình chỉ có **một** bộ đếm. Muốn hai bàn đếm riêng là không được.
- **Tự mang dữ liệu theo hàm.** Ngôn ngữ C không có closure. Khi đăng ký một callback, lập trình viên phải truyền kèm con trỏ tới dữ liệu, và tự lo xem dữ liệu đó còn sống hay đã bị xoá. JS cũng còn giữ dấu vết của cách này: `setTimeout` cho phép truyền thêm tham số.

  ```js
  function baoXong(mon) {
    console.log('xong ' + mon);
  }
  setTimeout(baoXong, 1000, 'lẩu');
  ```

  ```
  xong lẩu
  ```

  Thời jQuery, người ta hay nhét dữ liệu vào HTML (`<button data-id="5">`), rồi trong hàm xử lý click thì đọc lại id từ chính nút đó.
- **Dùng object để giữ trạng thái:**

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

  Cách này chạy được, nhưng mỗi lần gọi phải nhớ truyền `ban1` vào, và ai cũng sửa được `ban1.rau`. Với closure, `rau` nằm trong hộp nên **không ai ở ngoài chạm vào được**, chỉ `themRau` đọc và sửa được nó.

Object và closure làm được cùng một việc, nên hai cách thường được dùng thay cho nhau. React trước đây dùng class (`this.state`), sau đó chuyển sang function component với hooks, và hooks dựa hoàn toàn vào closure.

## Tóm tắt

- Khi tạo một hàm, JS gắn vào hàm đó ghi nhớ về hộp nơi nó được tạo. Hàm cùng hộp đó gọi là closure.
- Hàm bao ngoài chạy xong thì hộp của nó ra khỏi call stack, nhưng còn hàm nào nhớ hộp đó thì hộp chưa bị bỏ.
- Closure là hệ quả của việc hàm là một giá trị (gọi sau được) cộng với lexical scope (tìm biến ở chỗ viết).
- Không có closure thì phải dùng biến global, tự mang dữ liệu theo hàm, hoặc dùng object.
