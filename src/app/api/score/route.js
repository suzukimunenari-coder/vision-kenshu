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
      mode: q.scoringMode || "理解型（文字量なし）",
    }));

    const prompt = `あなたは新入社員研修テストの採点者です。加点思考で採点してください。迷ったら必ず高い点数を与えてください。

【暗記型の採点基準】
- 模範解答とほぼ同じ内容・キーワードが含まれている → 10点
- 意味・趣旨が合っていれば表現が多少違っても → 10点
- 方向性は合っているが表現や一部が違う → 8〜9点
- 半分程度合っている → 6〜7点
- 少しだけ関連がある → 4〜5点
- 的外れ・まったく違う・未記入 → 0〜3点
- 文字量ボーナスなし
- 【絶対ルール】指定個数以上書いた場合は余分を完全に無視する。正しいキーワードが指定個数以上あれば必ず10点にする。多く書いたことは減点理由にしない。

【穴埋め問題の採点基準（暗記型）】
- 数字の穴埋めは数値が合っていれば単位（千円・%・位・割など）がなくても正解とする
- 例：「23.0」の答えに「23」と書いても正解
- 例：「1位」の答えに「1」と書いても正解
- 例：「2割」の答えに「2」と書いても正解
- 例：「235,674千円」の答えに「235674」や「235,674」と書いても正解
- 数値が正確に合っていれば必ず高得点にする
- 回答欄に①②③…と番号が書いてある場合、その番号に対応する数値のみ評価する

【理解型（文字量あり）の採点基準】
- 趣旨・意味が正しく理解できている → 必ず10点
- 短くても意味・趣旨が伝わっていれば → 必ず10点
- 方向性は合っているが説明が浅い → 8点
- 少しずれているが関連はある → 6点
- 的外れ・適当・未記入 → 0〜3点
- 文字量ボーナスなし（理解度のみで採点）
- 【絶対ルール】趣旨・本質が伝わっていれば文字数に関係なく必ず10点にする

【理解型（文字量なし）の採点基準】
- 趣旨・意味が合っていれば文字数に関わらず → 必ず10点
- 方向性が合っていれば → 必ず10点
- 方向性は合っているが説明が不十分 → 8点
- 少しずれているが関連はある → 6点
- 的外れ・適当・未記入 → 0〜3点
- 文字量ボーナスなし
- 【絶対ルール】趣旨・本質が伝わっていれば必ず10点にする

【全モード共通の絶対ルール】
- 採点は必ず加点思考で行う
- 迷ったら必ず高い点数を選ぶ
- 的外れでない限り6点以上にする
- 趣旨・本質が合っていれば必ず10点にする
- 暗記型でも意味・趣旨が合っていれば表現が違っても10点にする
- 指定個数より多く書いた場合は絶対に減点しない
- 穴埋め問題は数値が合っていれば単位なしでも正解

【出力形式】JSONのみ。前後に説明文・コードブロック不要。idは必ず元のIDをそのまま使うこと。
{"scores":[{"id":"q1_kodo","score":9,"comment":"40字以内のフィードバック","is_off_topic":false}]}

【採点対象】
${items.map((i) => `ID:${i.id} 【${i.title}】採点モード:${i.mode}　${i.len}文字\n模範解答:${i.model}\n受験者回答:${i.answer || "(未記入)"}`).join("\n\n")}`;

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
