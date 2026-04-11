export const runtime = "edge";

export async function GET(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ status: "error", message: "APIキーなし" });
  const keyPreview = apiKey.substring(0, 10) + "...";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 10, messages: [{ role: "user", content: "hi" }] }),
    });
    const text = await res.text();
    return Response.json({ status: res.ok ? "ok" : "api_error", keyPreview, apiStatus: res.status, response: text.substring(0, 300) });
  } catch (err) {
    return Response.json({ status: "fetch_error", keyPreview, error: String(err) });
  }
}

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return Response.json({ success: false, error: "APIキーなし" }, { status: 500 });
  try {
    const { session, answers } = await request.json();
    const items = session.questions.map((q) => ({ id: q.id, title: q.title, model: session.modelAnswers?.[q.id] || "", answer: answers[q.id] || "", len: (answers[q.id] || "").length }));
    const prompt = `採点してください。JSON形式のみ返答：{"scores":[{"id":"ID","score":点数,"comment":"20字以内","is_off_topic":false}]}\n\n${items.map((i) => `【${i.title}】${i.len}文字\n模範:${i.model}\n回答:${i.answer || "(未記入)"}`).join("\n\n")}`;
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 800, messages: [{ role: "user", content: prompt }] }),
    });
    const text = await res.text();
    if (!res.ok) return Response.json({ success: false, error: `API ${res.status}: ${text.substring(0, 200)}` }, { status: 500 });
    const data = JSON.parse(text);
    const content = data.content?.[0]?.text || "";
    const parsed = JSON.parse(content.replace(/```json|```/g, "").trim());
    const result = {};
    parsed.scores.forEach((s) => { result[s.id] = { score: s.score, comment: s.comment, is_off_topic: s.is_off_topic || false }; });
    return Response.json({ success: true, scoring: result });
  } catch (err) {
    return Response.json({ success: false, error: String(err) }, { status: 500 });
  }
}
