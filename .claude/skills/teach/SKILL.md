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

Run the commands yourself before writing about them (DNS lookups, `curl -v`, `curl -w` timings, `netstat`, a small Node script). Paste real output, trimmed with `...` if long; strip stack frames and absolute paths down to the lines that teach something. Do not add a "Chạy trên <OS>, Node <version>, ngày <date>" line to the lesson. Numbers beat adjectives: "186 ms without cache, 7 ms with cache", not "much faster". Derive numbers honestly — `curl` `time_*` values are cumulative, subtract to get each phase.

When a picture cannot be real (what an attacker on Wi-Fi sees), say it is an illustration.

If a command fails, that failure is often the best teaching material (`curl https://<ip>` failing on the certificate explains why domains matter). Keep it.

Give the macOS/Linux equivalent the first time a Windows command appears.

## Define from the parent down

Before each section, list the concept chain hidden in its title and define from parent to child. "TCP handshake" hides: network → packet → router → IP → TCP → sequence number → ACK → handshake. The most basic words get skipped because they feel obvious — check them hardest. Define each term in one sentence at first use, with the English term in parentheses.

## Keep it short and the examples tiny

The learner rejected a full-length draft as "dài quá" and the next one as "ví dụ khó hiểu quá". Rules that came out of it:

- **Short first, but never cut the mechanism.** Aim for 4–5 sections of a few paragraphs each. Cut side topics (`this` in a scope lesson), comparisons with other languages, command tables, long "lỗi thường gặp" lists. Never cut what the concept is, why it is needed, and how it is built step by step — after trimming those, the learner asked "sao cắt hết ý rồi", "call stack là gì, làm sao build call stack???".
- **One idea per example, 3–8 lines.** No nested loops, no tracing several variables at once. Everyday names and values (`demTao`, `tong = 5`, `city = 'Hà Nội'`) beat abstract ones (`outer`, `inner`, `x`). If the example needs a trace table to follow, it is too hard — split it.
- **Teach the rule, not the term.** State the behaviour in one plain sentence ("hàm tìm biến ở chỗ nó được viết, không phải chỗ nó được gọi"), show it, and only then give the official name as a label to recognise in docs. Do not spend a paragraph on etymology. If the learner asks "có cần hiểu X không?", answer which rule matters and what later topic depends on it.
- **Bullets over paragraphs for explanations.** After lesson 4 the learner said "viết quá dài, sao không viết dễ hiểu kiểu bullet". Explain a mechanism as short bullets, one fact each; keep paragraphs only for the hook and the picture.
- **Never simplify a rule in a way a later lesson contradicts.** Lesson 2 said "hàm chạy xong thì hộp bị bỏ đi"; lesson 4 then kept the box, and the learner asked why JS dropped it before but keeps it now. State the real rule from the start ("hộp ra khỏi call stack khi hàm xong; hộp chỉ bị xoá khi không còn ai trỏ tới nó"), even if the second half is only used later.
- **When the learner says they do not get it**, re-explain in chat with a different angle (a box diagram drawn over the same code works well) before touching the file.

## Explain the essence by running it step by step

What finally worked for the JS series ("ổn rồi đó") is `docs/js/02-execution-context.md` — use it as the reference for concept lessons about how code runs. The learner's own words: "phải giải thích được bản chất, kiểu nó chạy từng bước một". The shape:

1. **Hook**: a real output the learner already sees at work (an error stack trace), plus the puzzle it raises ("Node biết ai gọi hàm này bằng cách nào?"). The lesson ends by coming back to it.
2. **Picture and one tiny example** for the first idea (approved earlier, kept as is).
3. **Walk the engine through a numbered example, one step per paragraph.** Number the code lines. Each step: a bold title with the line and the event ("Bước 3: dòng 7 gọi `nauNuocDung()`"), one or two sentences on what the engine does and why, then a snapshot of the full state after that step:

   ```
   nauNuocDung  đang chạy dòng 2     { nuoc: 'nước xương' }
   nauCanh      dừng ở dòng 7        { rau: 'rau ngót' }
   file         dừng ở dòng 10
   ```

   Show the state, not just the output: which boxes exist, which line each is on, which variables each holds. Point at the moment the picture matches ("giống nồi canh để trên bếp").
4. **Name the concept after the steps**, then reduce the steps to the 2–3 rules the engine repeats.
5. **Close the hook** with the same snapshot format, so the learner sees the hook output is that state.

Keep the walkthrough to one example of ~10 lines and 5–7 steps. The earlier 7-row trace table carried the same facts but was called "chán": steps as short paragraphs with state snapshots read better than a table.

## Always explain why it exists and what came before

In lessons 3 and 4 the learner stopped after the mechanism and asked "Tại sao JS phải làm vậy, nó dễ lỗi mà tại sao lại có khái niệm này" and "Tại sao sinh ra nó làm gì, gặp vấn đề gì mà phải có closure, không dùng closure thì trước đó người ta làm như thế nào". Both times the version they approved had these as sections right after the mechanism walkthrough. Put them in the first draft, do not wait to be asked:

1. **Vì sao phải có nó** — show what breaks without it, with the same step-by-step snapshots ("giả sử JS không đọc lướt trước, dòng 3 sẽ ra ngoài lấy `gia = 1`, rồi dòng 4 lại có một `gia` khác"). If it is a consequence of two other features, say which two (closure = functions are values + lexical scope).
2. **Lịch sử** — which part was designed on purpose and which was an accident or a compromise (`var` → `undefined` is an artifact of 1995; `let`/`const` in 2015 kept the useful part; old behaviour stays so old sites do not break). One short paragraph, no dates beyond what explains the design.
3. **Trước đó / không có nó thì làm thế nào** — the real alternatives, each with a runnable example and its real output, and the concrete downside (global variable collides; C passes a data pointer by hand; jQuery `data-id`; an object whose field anyone can overwrite).
4. **Áp dụng** — one line on what to do in today's code (`let`/`const` only, ESLint `no-var`; hooks rely on closures).

References: `docs/js/03-hoisting.md` sections 2–3 and `docs/js/04-closure.md` sections 2–3.

When the learner answers such an explanation with "viết lại", rewrite the lesson-so-far from the top with the explanation woven in as its own sections, in the same step-by-step style — do not append it at the end.

## Make it interesting, not a lecture

The learner called a correct, complete explanation "chán": definition → why → rules → a 7-row trace table, all in textbook headings. What to do instead:

- **Hook with something the learner already sees at work.** For call stack: the stack trace printed under every error in the console is the call stack — start there, not from a definition. For scope: a bug they would really write. For closure: a React callback reading old state.
- **Open with a puzzle, not a heading.** Show short code with a surprising output, or ask "JS gọi hàm xong thì làm sao biết quay về dòng nào?", and let the explanation be the answer to that.
- **Talk, do not lecture.** Plain sentences like a colleague at the next desk; at most one table per idea; no section headings inside a chat reply for a single idea.
- **Answer the learner's own words first.** When they ask "X là gì, làm sao Y", the first lines answer exactly that, before any picture.
- **Fix only what was criticised.** Each complaint so far ("dài quá", "ví dụ khó", "phi logic", "cắt hết ý") was answered by swinging to the opposite extreme, which produced the next complaint. Change the one thing named and keep the rest.

## The picture must be realistic and carry the whole lesson

The learner rejected pictures that do not happen in real life ("không thực tế", "phi logic") and pictures that were stretched to cover an idea of a different nature ("không cùng bản chất"). Before using a picture, check:

- **Every step in it is something people really do.** Act it out in your head. If a step only exists to make the mapping work, the picture is wrong.
- **One picture covers every idea of the lesson naturally.** List the lesson's ideas first, then pick the picture. If one idea does not fit, either the picture is wrong or that idea belongs to another lesson — move it, do not bend the picture.
- **The code example uses the picture's own names**, so the learner reads the picture and the code as one thing.

Real case, lesson "execution context" with two ideas: (1) each call gets fresh variables, (2) a function calling another pauses and resumes (call stack).

| Picture | Verdict |
|---|---|
| Giấy nháp: mỗi bài một tờ nháp mới | Fits idea 1 only |
| Giấy nháp, "góc tờ ghi: thiếu số thì xem tờ khác" | Rejected: nobody writes that; the idea was really scope chain (lesson 1), not execution context |
| Giấy nháp, "đặt tờ nháp b lên trên tờ nháp a" | Rejected: "nháp đặt lên nháp là sao", nobody does that |
| Nấu ăn: mỗi lần nấu một nồi sạch; đang nấu canh thì bắc thêm nồi nấu nước dùng, xong quay lại canh | Accepted: both ideas happen in a real kitchen |

Example that went with the accepted picture — names come from the picture, one idea, real output:

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

## Write mode

Lessons in a series (`docs/js/01-…`, `02-…`) are built **one idea at a time in chat**, not as a full draft. For each idea: non-tech picture with its mapping, one tiny example with real output, the name of the concept, and one check question — then stop and wait. Do not post the next idea, the rest of the lesson, or the next lesson until the learner reacts.

"ok ghi" approves only the ideas already shown in chat. Write exactly those to the file and nothing more — never fill in unreviewed sections to "complete" the lesson. Then continue with the next idea of the same lesson in chat. Move to the next lesson only after every idea of the current one has been shown and approved, and the learner says so.

Structure that worked:

1. Title as a plain question or event ("Chuyện gì xảy ra từ lúc gõ `facebook.com`...").
2. The list of questions the lesson answers.
3. Section 0: background concepts the rest depends on, plus the non-tech picture and its mapping table.
4. One section per step, in execution order, each with one small example and its real output.
5. Short summary, one bullet per section.

Add an overview diagram, a command table or "Lỗi thường gặp" only when the topic is long enough to need them.

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

If the user wants a written exercise file, follow the format of `docs/exercises/01-auth-form-validation.md`: what to do, input/output table, references. Put answers in a `<details>` block so they are hidden by default.

## Why this method

These choices come from learning research, mainly Dunlosky et al. (2013) and the six strategies of The Learning Scientists:

- **Elaborative interrogation** — asking "why" and "what if not" — is the four questions.
- **Concrete examples** and **dual coding** (words plus pictures) — real output and a diagram per section.
- **Retrieval practice** — answering from memory beats re-reading — Train mode questions.
- **Spaced practice** and **interleaving** — review after 1/3/7 days, mixed question types.
- **Self-explanation** (the Feynman technique) — "giải thích lại" questions.
