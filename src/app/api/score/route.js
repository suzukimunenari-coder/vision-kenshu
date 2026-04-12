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
    const prompt = `あなたは新入社員研修テストの採点者です。以下のルールで採点してください。

【採点方針】
- 趣旨・意味が合っていれば表現や順番が違っても高得点を与える
- 模範解答と完全一致でなくても、内容を理解していれば9〜10点
- 理解が不十分・説明が薄い場合は7〜8点
- 一部しか合っていない場合は4〜6点
- 的外れ・まったく理解できていない場合は0〜3点
- 文字量ボーナス：50文字以上+1点、100文字以上+2点、150文字以上+3点（最大10点を超えない）
- 採点は厳しすぎず、理解度を正しく評価することを優先する

【出力形式】JSONのみ。前後に説明文・コードブロック不要。
{"scores":[{"id":"問いID","score":9,"comment":"40字以内の具体的なフィードバック","is_off_topic":false}]}

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
