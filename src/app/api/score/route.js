export const runtime = "edge";
export const maxDuration = 60;

export async function POST(request) {
  try {
    const { session, answers } = await request.json();
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return Response.json({ success: false, error: "API key not configured" }, { status: 500 });
    }

    const items = session.questions.map((q) => ({
      id: q.id,
      title: q.title,
      model: session.modelAnswers?.[q.id] || "",
      answer: answers[q.id] || "",
      len: (answers[q.id] || "").length,
    }));

    const prompt = `あなたは入社時研修テストの採点官です。以下の採点ルールに従って採点してください。

【採点ルール】
STEP1: まず回答が「的外れかどうか」を判定する
- 的外れ = 模範解答と全く関係ない内容、または意味不明な回答
- 的外れの場合 → 0〜3点

STEP2: 的外れでない場合は以下で採点
- 内容点（0〜7点）: 模範解答の要点をどれだけ含んでいるか
- 文字量ボーナス（0〜3点）: 300文字以上+3点 / 200文字以上+2点 / 100文字以上+1点
- 合計 = 内容点 + 文字量ボーナス（最大10点）

必ずJSON形式のみで返答（他テキスト不要）：{"scores":[{"id":"問いID","score":点数,"comment":"20字以内","is_off_topic":true/false}]}

${items.map((i) => `【${i.title}】文字数:${i.len}文字\n模範解答: ${i.model}\n受験者回答: ${i.answer || "(未記入)"}`).join("\n\n")}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1200,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json({ success: false, error: err }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    const result = {};
    parsed.scores.forEach((s) => {
      result[s.id] = { score: s.score, comment: s.comment, is_off_topic: s.is_off_topic };
    });

    return Response.json({ success: true, scoring: result });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
