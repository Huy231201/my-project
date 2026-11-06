# Bài 2: Gọi một hàm thì JS làm gì bên trong? (Execution context, call stack)

Mỗi lần code lỗi, bạn đều thấy một đoạn như sau:

```
ReferenceError: xuong is not defined
    at ruaXuong (h1.js:8:3)
    at nauNuocDung (h1.js:5:3)
    at nauCanh (h1.js:2:3)
```

Lỗi nằm trong `ruaXuong`, nhưng Node vẫn biết hàm nào đã gọi nó, gọi ở dòng nào. Sau bài này cần trả lời được:

- Gọi một hàm nhiều lần thì biến bên trong có dùng chung không?
- Hàm gọi hàm khác thì JS chạy theo thứ tự nào, làm sao biết quay về đâu?
- Đoạn `at ...` ở trên là gì?

## 0. Hình dung: nấu ăn theo công thức

Mỗi lần nấu canh, bạn lấy một cái nồi sạch, bỏ nguyên liệu vào theo công thức. Nấu xong, không ai dùng nồi nữa thì đem rửa. Lần nấu sau lại bắt đầu từ nồi trống.

| Nấu ăn | JavaScript |
|---|---|
| Công thức | code của hàm |
| Mỗi lần nấu | mỗi lần gọi hàm |
| Cái nồi | hộp chứa biến của lần gọi đó |
| Nguyên liệu trong nồi | biến |
| Không ai dùng nồi nữa thì rửa | không còn ai trỏ tới hộp thì hộp bị xoá |

## 1. Mỗi lần gọi hàm là một hộp mới

```js
1  function nauCanh() {
2    let muoi = 0;
3    muoi = muoi + 1;
4    console.log('số muỗng muối:', muoi);
5  }
6  nauCanh();
7  nauCanh();
8  nauCanh();
```

```
số muỗng muối: 1
số muỗng muối: 1
số muỗng muối: 1
```

**Dòng 1–5**: JS ghi nhận hàm `nauCanh`. Thân hàm chưa chạy.

**Dòng 6: gọi lần 1.**

- JS tạo một **hộp mới** cho lần gọi này.
- Dòng 2: tạo `muoi = 0` trong hộp đó.
- Dòng 3: `muoi` thành `1`.
- Dòng 4: in `1`.
- Dòng 5: hết hàm.
  - Hộp **ra khỏi call stack** (mục 2): lần gọi này kết thúc.
  - Không còn gì trỏ tới hộp đó, nên **garbage collector** (bộ dọn rác của JS) xoá nó. `muoi` mất theo.

**Dòng 7: gọi lần 2.**

- JS tạo một **hộp mới khác**. Hộp của lần 1 đã bị xoá.
- Dòng 2 chạy lại: tạo `muoi = 0` mới.
- Dòng 3–4: `muoi` thành `1`, in `1`.
- Hết hàm, hộp bị xoá.

**Dòng 8: gọi lần 3.** Giống hệt lần 2, in `1`.

Kết luận:

- Mỗi lần gọi là một hộp mới, và dòng `let muoi = 0` chạy lại, nên không cộng dồn.
- Hộp của mỗi lần gọi hàm gọi là **execution context**. Hộp ghi hai thứ: biến của lần gọi đó, và hàm đang ở dòng nào.
- Hộp bị xoá vì **không còn ai trỏ tới**, không phải vì hàm chạy xong. [Bài 4](04-closure.md) sẽ gặp trường hợp hàm chạy xong nhưng vẫn còn thứ trỏ tới hộp, nên hộp được giữ lại.

## 2. Hàm gọi hàm: chạy từng bước

Bếp thật hay gặp chuyện này: đang nấu canh thì cần nước dùng, nên bắc thêm một nồi nấu nước dùng. Nồi canh để trên bếp chờ, xong nước dùng thì quay lại nấu tiếp canh.

```js
1  function nauNuocDung() {
2    const nuoc = 'nước xương';
3    return nuoc;
4  }
5  function nauCanh() {
6    const rau = 'rau ngót';
7    const nuocDung = nauNuocDung();
8    console.log(rau + ' + ' + nuocDung);
9  }
10 nauCanh();
```

```
rau ngót + nước xương
```

Các hộp xếp chồng lên nhau. JS chỉ chạy hộp **trên cùng**.

**Bước 1: bắt đầu chạy file.**

- JS tạo hộp cho file.
- Dòng 1–9: ghi nhận hai hàm `nauNuocDung` và `nauCanh`. Chưa chạy thân hàm nào.
- Tới dòng 10.

```
file         đang chạy dòng 10
```

**Bước 2: dòng 10 gọi `nauCanh()`.**

- Hộp file ghi lại "dừng ở dòng 10".
- JS tạo hộp `nauCanh`, đặt lên trên.
- Nhảy vào thân `nauCanh`. Dòng 6: tạo `rau = 'rau ngót'` trong hộp `nauCanh`.

```
nauCanh      đang chạy dòng 6     { rau: 'rau ngót' }
file         dừng ở dòng 10
```

**Bước 3: dòng 7 `const nuocDung = nauNuocDung();`**

- Dòng này có hai việc: gọi `nauNuocDung()` ở bên phải, rồi gán kết quả vào `nuocDung` ở bên trái.
- Bên phải phải chạy trước. `nuocDung` chưa có giá trị, đứng chờ.
- Hộp `nauCanh` ghi lại "dừng ở dòng 7, chờ kết quả".
- JS tạo hộp `nauNuocDung`, đặt lên trên.
- Nhảy vào thân `nauNuocDung`. Dòng 2: tạo `nuoc = 'nước xương'`.
- Hộp `nauCanh` vẫn giữ nguyên `rau`, giống nồi canh để trên bếp.

```
nauNuocDung  đang chạy dòng 2     { nuoc: 'nước xương' }
nauCanh      dừng ở dòng 7        { rau: 'rau ngót' }
file         dừng ở dòng 10
```

**Bước 4: dòng 3 `return nuoc`.**

- `return` lấy giá trị của `nuoc`, tức `'nước xương'`, mang về **đúng chỗ đã gọi** `nauNuocDung()`, tức dòng 7.
- `nauNuocDung` kết thúc, hộp của nó ra khỏi call stack.
- Hộp trên cùng giờ là `nauCanh`, đang ghi "dừng ở dòng 7".
- JS quay về dòng 7, làm nốt việc còn lại: gán `'nước xương'` vào `nuocDung`.

```
nauCanh      đang chạy dòng 7     { rau: 'rau ngót', nuocDung: 'nước xương' }
file         dừng ở dòng 10
```

**Bước 5: dòng 8** in `rau ngót + nước xương`.

**Bước 6: dòng 9, hết `nauCanh`.**

- Hộp `nauCanh` ra khỏi call stack.
- Hộp trên cùng giờ là file, đang ghi "dừng ở dòng 10". Quay về dòng 10.
- Dòng 10 là dòng cuối, file hết code, hộp file ra nốt. Chồng trống thì chương trình kết thúc.

Chồng hộp này gọi là **call stack** ("stack" là cái chồng, như chồng bát: thêm và lấy đều ở trên cùng). JS chỉ lặp lại ba việc:

- **Gọi hàm**: ghi hộp hiện tại đang dừng ở dòng nào, tạo hộp mới đặt lên trên.
- **Hàm chạy xong**: lấy hộp trên cùng ra, mang giá trị `return` (nếu có) về chỗ đã gọi.
- **Quay về hộp bên dưới**, chạy tiếp từ dòng đã ghi.

Vì sao cần call stack:

- JS phải biết chạy xong một hàm thì quay về đâu, và biến của hàm đang chờ là gì.
- Ngôn ngữ đời đầu như FORTRAN cho mỗi hàm đúng **một** chỗ cố định để chứa biến và chỗ quay về. Vì vậy hàm không tự gọi lại chính nó được: lần gọi sau sẽ ghi đè lên lần gọi trước.
- Call stack cho mỗi lần gọi một hộp riêng, nên gọi lồng nhau bao nhiêu lần cũng được.

## 3. Đọc stack trace

Quay lại lỗi ở đầu bài:

```js
1  function nauCanh() {
2    nauNuocDung();
3  }
4  function nauNuocDung() {
5    ruaXuong();
6  }
7  function ruaXuong() {
8    xuong.rua();
9  }
10 nauCanh();
```

```
ReferenceError: xuong is not defined
    at ruaXuong (h1.js:8:3)
    at nauNuocDung (h1.js:5:3)
    at nauCanh (h1.js:2:3)
    at Object.<anonymous> (h1.js:10:1)
```

- **Dòng 10**: gọi `nauCanh()`. Hộp file ghi "dừng ở dòng 10", hộp `nauCanh` lên trên.
- **Dòng 2**: gọi `nauNuocDung()`. Hộp `nauCanh` ghi "dừng ở dòng 2", hộp `nauNuocDung` lên trên.
- **Dòng 5**: gọi `ruaXuong()`. Hộp `nauNuocDung` ghi "dừng ở dòng 5", hộp `ruaXuong` lên trên.
- **Dòng 8**: cần `xuong`. Không tìm thấy ở đâu, lỗi.

Chồng hộp lúc lỗi xảy ra:

```
ruaXuong     đang chạy dòng 8     ← lỗi ở đây
nauNuocDung  dừng ở dòng 5
nauCanh      dừng ở dòng 2
file         dừng ở dòng 10
```

- Đoạn `at ...` chính là chồng hộp này. Dòng trên cùng là hộp trên cùng.
- `Object.<anonymous>` là hộp của file.
- Đọc từ dưới lên là thấy con đường code đã đi tới chỗ lỗi.

## Tóm tắt

- Mỗi lần gọi hàm, JS tạo một hộp mới (execution context). Các lần gọi không dùng chung biến.
- Hàm chạy xong thì hộp ra khỏi call stack. Hộp chỉ bị xoá khi không còn ai trỏ tới.
- Gọi hàm thì thêm hộp lên trên. Chạy xong thì lấy ra, mang giá trị `return` về đúng chỗ gọi, rồi chạy tiếp hộp bên dưới.
- Stack trace khi lỗi là chồng hộp tại thời điểm lỗi.
