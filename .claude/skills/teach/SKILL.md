---
name: teach
description: Dạy một chủ đề kỹ thuật theo kiểu "hỏi tại sao": viết bài học có minh hoạ và output thật cho từng mục, dạy trực tiếp trong chat, hoặc ra bài luyện tập và chấm. Dùng khi người dùng gõ "/teach", "dạy tôi", "giải thích kỹ", "viết bài học", "bài này sơ sài quá", "ra bài tập", "kiểm tra tôi", "training", "ôn lại".
---

# Teach

The learner is a fresher developer who reads Vietnamese. They do not want definitions — they want to know why a thing exists, what it looks like, and what happens inside, in the order it happens. The reference lesson for tone and depth is `docs/web/web-request-flow.md`; `docs/nestjs/01-web-server.md` is the second one.

The global CLAUDE.md rules on writing docs still apply and win on conflict.

## Pick the mode

| The user says | Mode |
|---|---|
| "viết bài", "bài này sơ sài", gives a file path or a topic to document | **Write** a lesson file |
| "dạy tôi", "giải thích", asks a concept question in chat | **Tutor** in chat |
| "ra bài tập", "kiểm tra tôi", "quiz", "training", "ôn lại" | **Train**: exercises and grading |

Unclear → Tutor. Write mode on an existing file → read it first, keep what is correct, rewrite what is thin.

## The four questions

Every concept, in every mode, gets these four questions answered. They are the method, not a section template — weave them into prose.

1. **Bỏ nó đi thì sao?** What breaks without it. This is why it exists. "Why DNS instead of typing the IP" is answered by showing what breaks when you type the IP.
2. **Nó trông như thế nào?** Make it visible: a command and its real output, a DevTools tab, a file on disk, a diagram.
3. **Chạy theo thứ tự nào, ai gọi ai?** The execution order. Cache lookup order, TCP before TLS, parse before render.
4. **Khác gì thứ gần giống nó?** Put it next to its neighbour: TCP vs TLS, A vs NS record, `http` vs `https`. The boundary is where understanding happens.

Before writing, list the questions a curious learner would ask about the topic (the user's own questions first, verbatim). The lesson opens with that list and must answer every one.

## Every section opens with a non-tech picture

Every section starts with a short "hình dung" a person who has never coded can follow: a scene from daily life (post office, phone call, apartment reception desk, moving house in numbered boxes, ID card with a government stamp). Rules:

- **No jargon inside the picture.** If a reader must already know "packet", "port" or "server" to follow it, it is not the picture yet. Test: read only that paragraph and ask whether a parent or a shop owner would get it.
- **Map each part explicitly**, as a small table or arrows: `danh bạ ↔ DNS`, `tên người ↔ tên miền`, `số điện thoại ↔ IP`. An analogy without the mapping leaves the learner guessing which part is which.
- **Say where the picture breaks** in one sentence when it matters ("khác danh bạ thường ở chỗ chủ tên miền sửa được bất kỳ lúc nào").
- **One picture per concept, reused.** If IP is a building and port is a room in section 3, do not make path a room in section 1. Keep the same picture across the lesson so pieces fit together.
- Common words only; no slang, no invented metaphors.

Then the technical version follows, with at least one of these:

- **ASCII diagram** inside a code block: sequence diagrams (`Browser ──► Server`), decision ladders (`có → dùng luôn / không ▼`), nested boxes for layers, trees for DOM or certificate chains, annotated lines (`GET / HTTP/1.1  ← làm gì · lấy gì`). Keep diagrams under ~80 columns so they do not wrap.
- **Real output**: run the command and paste what came back.
- **Side-by-side**: two columns showing the same thing with and without the concept (plain HTTP vs TLS bytes).

Open the lesson with one overview diagram where each line points to a section number.

## Real output, not imagined output

Run the commands yourself before writing about them (DNS lookups, `curl -v`, `curl -w` timings, `netstat`, a small Node script). Paste real output, trimmed with `...` if long, and state the date and OS once at the top. Numbers beat adjectives: "186 ms without cache, 7 ms with cache", not "much faster". Derive numbers honestly — `curl` `time_*` values are cumulative, subtract to get each phase.

When a picture cannot be real (what an attacker on Wi-Fi sees), say it is an illustration.

If a command fails, that failure is often the best teaching material (`curl https://<ip>` failing on the certificate explains why domains matter). Keep it.

Give the macOS/Linux equivalent the first time a Windows command appears.

## Define from the parent down

Before each section, list the concept chain hidden in its title and define from parent to child. "TCP handshake" hides: network → packet → router → IP → TCP → sequence number → ACK → handshake. The most basic words get skipped because they feel obvious — check them hardest. Define each term in one sentence at first use, with the English term in parentheses.

## Write mode

Structure that worked:

1. Title as a plain question or event ("Chuyện gì xảy ra từ lúc gõ `facebook.com`...").
2. The list of questions the lesson answers.
3. Overview diagram.
4. Section 0: background concepts the rest depends on.
5. One section per step, in execution order. Each answers the four questions and has an illustration.
6. A command table: "muốn xem gì → lệnh Windows → lệnh macOS/Linux".
7. "Lỗi thường gặp" when the topic has them (real error messages).
8. Short summary, one bullet per section.

Link to existing lessons instead of repeating them (`[Bài 1, mục 5](../nestjs/01-web-server.md)`). Look at sibling files in the docs folder and match their numbering and tone.

Do not add a quiz to the lesson file unless asked — offer Train mode instead.

## Tutor mode

Teach in small steps in chat:

1. Ask what the learner already knows, in one question, unless the message already shows it.
2. Explain one idea: non-tech picture with its mapping, then diagram or real output, then the precise version. Max ~15 lines.
3. End with one check question that needs reasoning, not recall ("Nếu TTL là 1 ngày thì Facebook đổi IP sẽ gặp chuyện gì?").
4. Wait. Use the answer to choose the next step: wrong → re-explain from a different angle; right → go one level deeper.

Do not dump the whole topic in one reply.

## Train mode

Source: a lesson file, a topic, or what was just taught. Mix question types and levels; mixing topics beats blocks of one type.

| Level | Example |
|---|---|
| Nhớ | "Bản ghi DNS nào chứa IP?" |
| Hiểu | "Vì sao `1.1.1.1` trả TTL 28 mà authoritative trả 60?" |
| Dự đoán | "Chạy `curl https://157.240.15.35/` sẽ ra gì? Vì sao?" — then let them run it |
| Gỡ lỗi | Show a real error message, ask for the cause |
| So sánh | "TCP lo gì mà TLS không lo, và ngược lại?" |
| Giải thích lại | "Giải thích HTTPS cho người không biết code, 3 câu." |
| Thực hành | A small task with expected output, like `docs/exercises/*.md` |

Flow:

1. Ask one question at a time. Wait for the answer.
2. Grade: say what is right first, then what is missing or wrong and why. Never just "sai".
3. Wrong or stuck → hint ladder, one step per reply: (a) where to look, (b) narrow it down, (c) the answer with the explanation. Let them try between steps.
4. After 5–8 questions: summary of strong and weak points, and which section to re-read.
5. Offer a review schedule for the weak points: again after 1 day, 3 days, 7 days, with new questions each time, not the same ones.

If the user wants a written exercise file, follow the format of `docs/exercises/auth-form-validation.md`: what to do, input/output table, references. Put answers in a `<details>` block so they are hidden by default.

## Why this method

These choices come from learning research, mainly Dunlosky et al. (2013) and the six strategies of The Learning Scientists:

- **Elaborative interrogation** — asking "why" and "what if not" — is the four questions.
- **Concrete examples** and **dual coding** (words plus pictures) — real output and a diagram per section.
- **Retrieval practice** — answering from memory beats re-reading — Train mode questions.
- **Spaced practice** and **interleaving** — review after 1/3/7 days, mixed question types.
- **Self-explanation** (the Feynman technique) — "giải thích lại" questions.
