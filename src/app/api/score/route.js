export const runtime = "edge";

export async function GET(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ status: "error", message: "APIキーなし" });
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5", max_tokens: 10, messages: [{ role: "user", content: "hi" }] }),
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
    const prompt = `入社時研修テストの採点をしてください。各問の採点基準：的外れ→0-3点、内容点0-7点＋文字量ボーナス（100文字+1点、200文字+2点、300文字+3点）最大10点。scoreは必ず0から10の整数で返してください。JSON形式のみ返答：{"scores":[{"id":"問いID","score":8,"comment":"20字以内のコメント","is_off_topic":false}]}\n\n${items.map((i) => `【${i.title}】${i.len}文字\n模範:${i.model}\n回答:${i.answer || "(未記入)"}`).join("\n\n")}`;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5", max_tokens: 800, messages: [{ role: "user", content: prompt }] }),
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
