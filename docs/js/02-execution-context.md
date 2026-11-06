# Bài 2: Gọi một hàm thì JS làm gì bên trong?

Mỗi lần code lỗi, bạn đều thấy một đoạn như sau:

```
ReferenceError: xuong is not defined
    at ruaXuong (h1.js:8:3)
    at nauNuocDung (h1.js:5:3)
    at nauCanh (h1.js:2:3)
```

Lỗi xảy ra trong `ruaXuong`, nhưng Node vẫn biết hàm nào đã gọi nó, và gọi ở dòng nào. Để hiểu Node lấy thông tin đó ở đâu ra, cần xem JS làm gì mỗi khi gọi một hàm. Sau bài này cần trả lời được:

1. Gọi một hàm nhiều lần thì biến bên trong có dùng chung không?
2. Hàm gọi hàm khác thì JS chạy theo thứ tự nào, và làm sao biết quay về đâu?
3. Đoạn `at ...` ở trên là gì?

## 0. Hình dung: nấu ăn theo công thức

Mỗi lần nấu canh, bạn lấy một cái nồi sạch rồi bỏ nguyên liệu vào theo công thức. Nấu xong thì đổ canh ra và rửa nồi. Lần nấu sau lại bắt đầu từ một nồi trống.

| Nấu ăn | JavaScript |
|---|---|
| Công thức | code của hàm |
| Mỗi lần nấu | mỗi lần gọi hàm |
| Cái nồi | hộp chứa biến của lần gọi đó |
| Nguyên liệu trong nồi | biến |
| Nấu xong, rửa nồi | hàm chạy xong, hộp bị bỏ đi |

## 1. Mỗi lần gọi hàm là một hộp mới

```js
function nauCanh() {
  let muoi = 0;
  muoi = muoi + 1;
  console.log('số muỗng muối:', muoi);
}
nauCanh();
nauCanh();
nauCanh();
```

```
số muỗng muối: 1
số muỗng muối: 1
số muỗng muối: 1
```

Mỗi lần gọi `nauCanh()`, JS tạo một hộp mới với `muoi = 0`, cộng thêm 1, in ra, rồi bỏ hộp đó đi. Lần gọi sau không thấy hộp cũ, nên kết quả không cộng dồn thành 3.

Hộp của mỗi lần gọi hàm có tên là **execution context**. Mỗi hộp ghi hai thứ: biến của lần gọi đó, và hàm đang chạy hay đang dừng ở dòng nào.

## 2. Hàm gọi hàm: chạy từng bước

Bếp thật cũng hay gặp chuyện này: đang nấu canh thì cần nước dùng, nên phải bắc thêm một nồi nấu nước dùng trước. Nồi canh vẫn để trên bếp chờ, xong nước dùng thì quay lại nấu tiếp canh. Code dưới đây làm đúng như vậy:

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

Các hộp xếp chồng lên nhau, và JS chỉ chạy hộp **trên cùng**. Hộp mới luôn được đặt lên trên.

**Bước 1: bắt đầu chạy file.** JS tạo hộp cho file và nhảy tới dòng 10.

```
file         đang chạy dòng 10
```

**Bước 2: dòng 10 gọi `nauCanh()`.** JS ghi vào hộp file là "dừng ở dòng 10", tạo hộp cho `nauCanh` đặt lên trên, rồi chạy dòng 6.

```
nauCanh      đang chạy dòng 6     { rau: 'rau ngót' }
file         dừng ở dòng 10
```

**Bước 3: dòng 7 gọi `nauNuocDung()`.** `nauCanh` cần kết quả thì mới gán được vào `nuocDung`, nên JS ghi "dừng ở dòng 7, chờ kết quả", tạo hộp cho `nauNuocDung` đặt lên trên, rồi chạy dòng 2.

```
nauNuocDung  đang chạy dòng 2     { nuoc: 'nước xương' }
nauCanh      dừng ở dòng 7        { rau: 'rau ngót' }
file         dừng ở dòng 10
```

Hộp `nauCanh` vẫn giữ nguyên `rau` và đứng chờ, giống nồi canh để trên bếp.

**Bước 4: dòng 3 `return nuoc`.** JS lấy giá trị `'nước xương'` rồi bỏ hộp `nauNuocDung` đi (biến `nuoc` mất theo hộp). Hộp trên cùng bây giờ là `nauCanh`, đang ghi "dừng ở dòng 7", nên JS quay về dòng 7 và gán `nuocDung = 'nước xương'`.

```
nauCanh      đang chạy dòng 7     { rau: 'rau ngót', nuocDung: 'nước xương' }
file         dừng ở dòng 10
```

**Bước 5: dòng 8 in ra** `rau ngót + nước xương`.

**Bước 6: `nauCanh` hết code.** JS bỏ hộp `nauCanh` và quay về hộp file ở dòng 10. File cũng hết code nên JS bỏ luôn hộp file. Chồng trống thì chương trình kết thúc.

Chồng hộp này có tên là **call stack**. Chữ "stack" nghĩa là cái chồng, giống chồng bát: thêm vào ở trên cùng thì cũng lấy ra từ trên cùng. Từ đó JS chỉ lặp lại đúng ba việc:

1. **Gặp lời gọi hàm**: ghi lại hộp hiện tại đang dừng ở dòng nào, tạo hộp mới đặt lên trên.
2. **Hàm chạy xong**: bỏ hộp trên cùng, mang theo giá trị `return` nếu có.
3. **Quay về hộp ngay bên dưới**, chạy tiếp từ đúng dòng đã ghi.

## 3. Đọc stack trace

Quay lại đoạn lỗi ở đầu bài:

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

Tại lúc lỗi xảy ra, chồng hộp trông như sau:

```
ruaXuong     đang chạy dòng 8     ← lỗi ở đây
nauNuocDung  dừng ở dòng 5
nauCanh      dừng ở dòng 2
file         dừng ở dòng 10
```

Đó chính là đoạn `at ...` mà Node in ra. Node đọc nguyên chồng hộp tại thời điểm lỗi, dòng trên cùng là hộp trên cùng. `Object.<anonymous>` là hộp của file. Đọc từ dưới lên sẽ thấy đúng con đường code đã đi để tới chỗ lỗi.

## Tóm tắt

- Mỗi lần gọi hàm, JS tạo một hộp mới (execution context) chứa biến của lần gọi đó. Các lần gọi không dùng chung biến.
- Các hộp xếp chồng thành call stack. Gọi hàm thì thêm hộp lên trên, hàm chạy xong thì bỏ hộp trên cùng và quay về đúng dòng đã ghi ở hộp bên dưới.
- Stack trace khi có lỗi là chồng hộp tại đúng thời điểm lỗi xảy ra.
