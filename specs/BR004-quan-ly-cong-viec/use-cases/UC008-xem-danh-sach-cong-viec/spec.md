# UC-008: Xem danh sách công việc

## Metadata
- **ID:** UC-008
- **Bounded Context:** Tasks
- **Liên quan tới BR:** BR-004
- **Status:** draft
- **Owner:** chưa gán (chờ PO)
- **Last updated:** 2026-09-17

## Actor
Người dùng đã đăng nhập.

## Trigger
Người dùng chọn mục "Công việc" trên menu điều hướng.

## Preconditions
- Người dùng đã đăng nhập (UC-005).

## Main Flow
1. Người dùng chọn mục "Công việc" trên menu điều hướng.
2. Hệ thống hiển thị trang Công việc với tab trạng thái "Tất cả" đang chọn và ô tìm kiếm rỗng.
3. Hệ thống lấy danh sách công việc theo trạng thái đang chọn và từ khóa tìm kiếm hiện tại, hiển thị trang 1.
4. Hệ thống hiển thị bảng tối đa 5 công việc/trang, mỗi dòng gồm tiêu đề, người phụ trách (avatar viết tắt kèm tên), badge trạng thái, deadline, và menu thao tác "Sửa"/"Xóa".
5. Hệ thống hiển thị dòng thông tin phân trang ("Hiển thị X-Y / Z") và các nút số trang tương ứng.
6. Người dùng gõ từ khóa vào ô tìm kiếm.
7. Hệ thống lọc danh sách theo tên công việc hoặc tên người phụ trách có chứa từ khóa (không phân biệt hoa/thường), giữ nguyên tab trạng thái đang chọn, đưa về trang 1, cập nhật lại bảng và phân trang.
8. Người dùng chọn một tab trạng thái khác (Todo/Đang làm/Xong).
9. Hệ thống lọc danh sách theo trạng thái vừa chọn kết hợp với từ khóa tìm kiếm đang có, đưa về trang 1, cập nhật lại bảng và phân trang.
10. Người dùng bấm một số trang trên thanh phân trang.
11. Hệ thống hiển thị đúng trang được chọn, giữ nguyên tab trạng thái và từ khóa tìm kiếm hiện tại.

## Alternative Flows
- **6a. Xóa hết từ khóa tìm kiếm:** người dùng xóa hết nội dung ô tìm kiếm, hệ thống coi như không có từ khóa, lọc lại danh sách theo tab trạng thái đang chọn, đưa về trang 1.
- **8a. Chọn lại tab đang active:** người dùng bấm vào tab trạng thái đang chọn sẵn, danh sách không đổi.

## Exceptions
- **E1. Không có công việc nào khớp bộ lọc:** bảng rỗng, ẩn thanh phân trang, hiển thị empty state "Không có công việc nào" kèm gợi ý đổi bộ lọc/tìm kiếm khác và nút "Thêm công việc".
- **E2. Lỗi tải dữ liệu:** hệ thống không lấy được danh sách công việc do lỗi mạng/server, hiển thị thông báo lỗi, không hiển thị dữ liệu sai hoặc dữ liệu cũ đã cache.

## Postconditions
- Người dùng thấy đúng danh sách công việc khớp với từ khóa tìm kiếm, tab trạng thái, và trang hiện tại đã chọn.

## Acceptance Criteria

### AC-1: Xem danh sách mặc định
Given: hệ thống có công việc ở nhiều trạng thái
When: người dùng vào trang Công việc lần đầu
Then: tab "Tất cả" đang chọn, ô tìm kiếm rỗng, bảng hiển thị tối đa 5 công việc đầu tiên
And: dòng thông tin phân trang hiển thị đúng số lượng đang hiển thị trên tổng số

### AC-2: Tìm kiếm theo tên công việc
Given: người dùng đang ở trang Công việc
When: gõ từ khóa trùng một phần tên của một công việc vào ô tìm kiếm
Then: bảng chỉ còn hiển thị các công việc có tên chứa từ khóa đó
And: trang hiện tại được đưa về trang 1

### AC-3: Tìm kiếm theo tên người phụ trách
Given: người dùng đang ở trang Công việc
When: gõ từ khóa trùng một phần tên người phụ trách vào ô tìm kiếm
Then: bảng chỉ còn hiển thị các công việc có người phụ trách chứa từ khóa đó

### AC-4: Lọc theo trạng thái
Given: hệ thống có công việc ở cả 3 trạng thái todo/doing/done
When: người dùng chọn tab "Todo"
Then: bảng chỉ hiển thị công việc có trạng thái todo
And: trang hiện tại được đưa về trang 1

### AC-5: Kết hợp tìm kiếm và lọc trạng thái
Given: người dùng đã chọn tab "Đang làm"
When: gõ thêm từ khóa tìm kiếm
Then: bảng chỉ hiển thị công việc vừa có trạng thái "Đang làm" vừa khớp từ khóa

### AC-6: Phân trang
Given: danh sách sau khi lọc có nhiều hơn 5 công việc
When: người dùng bấm số trang 2 trên thanh phân trang
Then: bảng hiển thị đúng các công việc thuộc trang 2
And: bộ lọc trạng thái và từ khóa tìm kiếm hiện tại không đổi

### AC-7: Không có kết quả khớp
Given: người dùng nhập từ khóa hoặc chọn tổ hợp bộ lọc không khớp công việc nào
When: hệ thống lọc xong danh sách
Then: bảng rỗng, hiển thị empty state "Không có công việc nào" kèm nút "Thêm công việc"
And: thanh phân trang không hiển thị

### AC-8: Lỗi tải dữ liệu
Given: người dùng vào trang Công việc
When: hệ thống không lấy được dữ liệu công việc do lỗi mạng/server
Then: hệ thống hiển thị thông báo lỗi
And: không hiển thị dữ liệu sai hoặc dữ liệu cũ đã cache

## Dependencies
- **Upstream UC:** UC-005 (Đăng nhập, BR-002)
- **Downstream UC:** UC-009 (Thêm công việc), UC-010 (Sửa công việc), UC-011 (Xóa công việc) — cả 3 thao tác trên đều thực hiện từ trang danh sách này.
- **External Systems:** <chưa xác định — API/nguồn dữ liệu công việc>

## Notes
Tìm kiếm, lọc theo trạng thái và phân trang gộp vào một UC vì cùng một trigger (vào trang Công việc), cùng một luồng xem/duyệt danh sách, không phải các hành động ghi dữ liệu độc lập — không đáp ứng tiêu chí tách UC riêng.

pageSize = 5 công việc/trang lấy theo mockup (mockup.html), cần PO xác nhận số liệu thật. Mockup lọc danh sách theo từng ký tự gõ vào ô tìm kiếm, không debounce — hành vi debounce khi implement là quyết định kỹ thuật, không làm thay đổi AC.

Phạm vi dữ liệu hiển thị (chỉ công việc của người dùng hiện tại hay toàn hệ thống) chưa xác định, phụ thuộc Open Question của BR-004 và BR-002 — cần PO chốt trước khi viết plan.md.

## History
- v1 (2026-09-17): initial
