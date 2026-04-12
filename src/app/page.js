export const runtime = "edge";

export async function GET(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ status: "error", message: "APIキーなし" });
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 10, messages: [{ role: "user", content: "hi" }] }),
    });
    const text = await res.text();
    return Response.json({ status: res.ok ? "ok" : "error", httpStatus: res.status, response: text.substring(0, 300) });
  } catch (err) {
    return Response.json({ status: "fetch_error", error: String(err) });
  }
}

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ success: false, error: "APIキーなし" }, { status: 500 });
  try {
    const { session, answers } = await request.json();
    const items = session.questions.map((q) => ({
      id: q.id, title: q.title,
      model: session.modelAnswers?.[q.id] || "",
      answer: answers[q.id] || "",
      len: (answers[q.id] || "").length,
    }));
    const prompt = `あなたは新入社員研修テストの採点者です。以下のルールで厳密に採点してください。

【採点ルール】
- 模範解答の「意味・内容」が含まれているかだけで判定する
- 順番・表現・箇条書きか文章かは一切問わない
- 自分の言葉で言い換えていても、意味が合っていれば正解とする
- 的外れ（内容がまったく違う）→ 0〜3点
- 内容が部分的に合っている → 4〜6点
- 内容が模範解答とほぼ一致している → 7〜9点
- 模範解答の意味を正しく理解し説明できている → 10点
- 文字量ボーナス：50文字以上+1点、100文字以上+2点、150文字以上+3点（最大10点を超えない）

【出力形式】JSONのみ。前後に説明文・コードブロック不要。
{"scores":[{"id":"問いID","score":8,"comment":"40字以内の具体的なフィードバック","is_off_topic":false}]}

【採点対象】
${items.map((i) => `【${i.title}】${i.len}文字\n模範解答:${i.model}\n受験者回答:${i.answer || "(未記入)"}`).join("\n\n")}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 800, messages: [{ role: "user", content: prompt }] }),
    });
    const text = await res.text();
    if (!res.ok) return Response.json({ success: false, error: `API ${res.status}: ${text.substring(0, 300)}` }, { status: 500 });
    const data = JSON.parse(text);
    const content = data.content?.[0]?.text || "";
    const clean = content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    const result = {};
    parsed.scores.forEach((s) => {
      const score = Math.min(10, Math.max(0, parseInt(s.score, 10) || 0));
      result[s.id] = { score, comment: s.comment || "", is_off_topic: s.is_off_topic || false };
    });
    return Response.json({ success: true, scoring: result });
  } catch (err) {
    return Response.json({ success: false, error: String(err) }, { status: 500 });
  }
}
