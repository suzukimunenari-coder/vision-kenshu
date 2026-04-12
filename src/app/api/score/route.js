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
      id: q.id,
      title: q.title,
      model: session.modelAnswers?.[q.id] || "",
      answer: answers[q.id] || "",
      len: (answers[q.id] || "").length,
      mode: q.scoringMode || "理解型（文字量あり）",
    }));

    const prompt = `あなたは新入社員研修テストの採点者です。加点思考で採点してください。迷ったら必ず高い点数を与えてください。

【暗記型の採点基準】
- 模範解答とほぼ同じ内容・キーワードが含まれている → 10点
- 方向性は合っているが表現や一部が違う → 8〜9点
- 半分程度合っている → 6〜7点
- 少しだけ関連がある → 4〜5点
- 的外れ・まったく違う・未記入 → 0〜3点
- 文字量ボーナスなし

【理解型（文字量あり）の採点基準】
- 趣旨が正しく理解できている → 8〜9点（ベース）
- 完璧に理解して詳しく説明できている → 9〜10点
- 方向性は合っているが説明が浅い → 6〜7点
- 少しずれているが関連はある → 4〜5点
- 的外れ・適当・未記入 → 0〜3点
- 文字量ボーナス：50文字以上+1点、100文字以上+2点、150文字以上+3点（最大10点）

【理解型（文字量なし）の採点基準】
- 趣旨・意味が合っていれば文字数に関わらず → 9〜10点
- 方向性は合っているが説明が不十分 → 7〜8点
- 少しずれているが関連はある → 5〜6点
- 的外れ・適当・未記入 → 0〜3点
- 文字量ボーナスなし

【重要】
- 採点は必ず加点思考で行う
- 迷ったら高い点数を選ぶ
- 表現が多少違っても意味が合っていれば満点に近い点数を与える
- 的外れでない限り5点以下にしない

【出力形式】JSONのみ。前後に説明文・コードブロック不要。
{"scores":[{"id":"問いID","score":9,"comment":"40字以内の具体的なフィードバック","is_off_topic":false}]}

【採点対象】
${items.map((i) => `【${i.title}】採点モード:${i.mode}　${i.len}文字\n模範解答:${i.model}\n受験者回答:${i.answer || "(未記入)"}`).join("\n\n")}`;

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
