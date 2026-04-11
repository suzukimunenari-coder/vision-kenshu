'use client'
import { useState, useEffect, useCallback } from "react";

const GAS_URL = "https://script.google.com/macros/s/AKfycbxOOhjOqe9GfdX9DfUdcLpBW6apPM7eyrP8_bWXGWUmwkQ6G1fzPWzHmnR6BDwHBNGFSQ/exec";

const MEMBERS = [
  "中嶋寛彩","大野裕貴","佐藤北斗","小川泰佑","望月梨花",
  "相澤","小金澤葵","廣瀬紫音","菊川太翼","鈴木翔"
];

// 4/9採点済みデータ
const SEED_SCORING_0409 = {
  "中嶋寛彩": {"total":57,"scoring":{"q1_mission":{"score":6,"comment":"応援→サポートに変更あり"},"q2_vision":{"score":10,"comment":"完璧"},"q3_value":{"score":8,"comment":"全社員→従業員の差あり"},"q4_shisei":{"score":7,"comment":"要点は押さえているが不完全"},"q5_shuhari":{"score":9,"comment":"ほぼ完璧"},"q6_kikikata":{"score":9,"comment":"6個揃っている"},"q7_shakaijin":{"score":8,"comment":"お金の流れを理解"}}},
  "大野裕貴": {"total":64,"scoring":{"q1_mission":{"score":10,"comment":"完璧"},"q2_vision":{"score":10,"comment":"完璧"},"q3_value":{"score":9,"comment":"ほぼ正確"},"q4_shisei":{"score":9,"comment":"完全結果の概念も含む"},"q5_shuhari":{"score":9,"comment":"疑わずという表現が良い"},"q6_kikikata":{"score":10,"comment":"6個完璧"},"q7_shakaijin":{"score":7,"comment":"責任の観点は良いが浅い"}}},
  "佐藤北斗": {"total":61,"scoring":{"q1_mission":{"score":10,"comment":"完璧"},"q2_vision":{"score":10,"comment":"完璧"},"q3_value":{"score":9,"comment":"ほぼ正確"},"q4_shisei":{"score":9,"comment":"要点を押さえている"},"q5_shuhari":{"score":6,"comment":"内容が薄い"},"q6_kikikata":{"score":8,"comment":"目を見てが模範外だが良い"},"q7_shakaijin":{"score":9,"comment":"プロ意識の観点が優秀"}}},
  "小川泰佑": {"total":57,"scoring":{"q1_mission":{"score":9,"comment":"語尾が切れているが内容OK"},"q2_vision":{"score":10,"comment":"完璧"},"q3_value":{"score":9,"comment":"ほぼ正確"},"q4_shisei":{"score":7,"comment":"例示はあるが定義が薄い"},"q5_shuhari":{"score":8,"comment":"真似するという表現が良い"},"q6_kikikata":{"score":9,"comment":"6個揃っている"},"q7_shakaijin":{"score":5,"comment":"内容が浅い"}}},
  "望月梨花": {"total":62,"scoring":{"q1_mission":{"score":9,"comment":"作り→創りだが内容OK"},"q2_vision":{"score":10,"comment":"完璧"},"q3_value":{"score":9,"comment":"ほぼ正確"},"q4_shisei":{"score":9,"comment":"やるかやらないかを明確に説明"},"q5_shuhari":{"score":9,"comment":"そっくりそのままが正確"},"q6_kikikata":{"score":9,"comment":"6個揃っている"},"q7_shakaijin":{"score":7,"comment":"責任の観点はあるが浅い"}}},
  "相澤": {"total":44,"scoring":{"q1_mission":{"score":8,"comment":"作り→創りだが内容OK"},"q2_vision":{"score":10,"comment":"完璧"},"q3_value":{"score":5,"comment":"誤字あり・全社員表記"},"q4_shisei":{"score":6,"comment":"短すぎて説明不足"},"q5_shuhari":{"score":5,"comment":"基礎体得は方向性が違う"},"q6_kikikata":{"score":9,"comment":"6個揃っている"},"q7_shakaijin":{"score":1,"comment":"バリュー提供の説明は違う"}}},
  "小金澤葵": {"total":63,"scoring":{"q1_mission":{"score":9,"comment":"ひらがな表記だが内容OK"},"q2_vision":{"score":10,"comment":"完璧"},"q3_value":{"score":9,"comment":"ほぼ正確"},"q4_shisei":{"score":9,"comment":"能力無関係を明確に説明"},"q5_shuhari":{"score":8,"comment":"型から入るが良い"},"q6_kikikata":{"score":9,"comment":"6個揃っている"},"q7_shakaijin":{"score":9,"comment":"会社への影響を理解"}}},
  "廣瀬紫音": {"total":61,"scoring":{"q1_mission":{"score":8,"comment":"法人名が省略されている"},"q2_vision":{"score":10,"comment":"完璧"},"q3_value":{"score":9,"comment":"ほぼ正確"},"q4_shisei":{"score":9,"comment":"意思でルール破るの表現が良い"},"q5_shuhari":{"score":7,"comment":"忠実に守るはOKだが薄い"},"q6_kikikata":{"score":9,"comment":"6個揃っている"},"q7_shakaijin":{"score":9,"comment":"お金の流れを理解"}}},
  "菊川太翼": {"total":62,"scoring":{"q1_mission":{"score":10,"comment":"完璧"},"q2_vision":{"score":10,"comment":"完璧"},"q3_value":{"score":7,"comment":"物心両面は違う表現"},"q4_shisei":{"score":9,"comment":"要点を押さえている"},"q5_shuhari":{"score":8,"comment":"良い点悪い点も真似は良い"},"q6_kikikata":{"score":9,"comment":"体・顔・耳は独自だが良い"},"q7_shakaijin":{"score":9,"comment":"お金の立場変化を理解"}}},
  "鈴木翔": {"total":40,"scoring":{"q1_mission":{"score":7,"comment":"ひらがな・語尾が違う"},"q2_vision":{"score":5,"comment":"21世紀が抜けている"},"q3_value":{"score":7,"comment":"幸福→幸せの違いあり"},"q4_shisei":{"score":3,"comment":"基本的なルールのみ"},"q5_shuhari":{"score":7,"comment":"教えを守るは正しいが薄い"},"q6_kikikata":{"score":6,"comment":"5個のみ・姿勢は模範外"},"q7_shakaijin":{"score":5,"comment":"責任の所在のみ"}}},
};

const SEED_ANSWERS_0409 = {
  "中嶋寛彩": {"q1_mission":"100年経営とワクワクする会社づくりをサポートする","q2_vision":"21世紀の日本経済を元気にします","q3_value":"お客様第一主義の実現を通して、全社員が幸せになり、社会に貢献する","q4_shisei":"能力に関係せずに誰であろうと実践できるもの。やるかやらないかの違いのみ。","q5_shuhari":"師の教えをまずはそのまま実践すること。自己流やオリジナルなものを出さずにアドバイスされたことを言われた通り実践すること","q6_kikikata":"相手の立場になって聞く、自分の価値観で聞かない、うなずきながら聞く、メモを取りながら聞く、笑顔で聞く、話の内容を聞く","q7_shakaijin":"お金を出す側から、サービスを提供してお金をもらう側になること。それに伴い様々な責任が発生する"},
  "大野裕貴": {"q1_mission":"100年経営とワクワクする良い会社創りを応援します","q2_vision":"21世紀の日本経済を元気にします。","q3_value":"お客様第一主義の実現を通じて全社員が幸せになり社会に貢献する。","q4_shisei":"完全結果であり、できる・できないが存在しないルールで、途中経過や言い訳は存在せず、社会や上司に対しての姿勢を表すもの","q5_shuhari":"師の教えを一切疑わず、教えられたことをそのまま忠実に守り、確実に成長をする段階のこと。","q6_kikikata":"うなずきながら聞く。笑顔で聞く。メモをしながら聞く。相手の立場で聞く。自分の価値観で聞かない。話の内容を聞く。","q7_shakaijin":"社会人は学生と違って、お客様という存在がいて、社会人としての責任が大きくなるところ。"},
  "佐藤北斗": {"q1_mission":"100年経営とワクワクする良い会社創りを応援します","q2_vision":"21世紀の日本経済を元気にします","q3_value":"お客様第一主義の実現を通じて全社員が幸せになり社会に貢献する","q4_shisei":"できる・できないが存在しないルール。やるかやらないかの意思の問題で、上司・組織に対する姿勢を表す。","q5_shuhari":"師の教えを忠実に守ること。","q6_kikikata":"頷きながら聞く、笑顔で聞く、内容を聞く、メモをとりながら聞く、体全体で聞く、相手の目を見て聞く","q7_shakaijin":"お金を払って学ぶ側からお金を貰ってプロとして働く側でことなる。社会人は限られた時間で優先順位をつけて取り組む必要があり、会社の看板を背負っているという自覚をもつようになる。"},
  "小川泰佑": {"q1_mission":"100年経営とワクワクする良い会社創りを応援しま","q2_vision":"21世紀の日本経済を元気にします。","q3_value":"お客様第一主義の実現を通じて全社員が幸せになり社会に貢献する","q4_shisei":"挨拶、時間を守ることや報連相など、出来る出来ないが存在しない全員が守るべきルール","q5_shuhari":"まずは、師である先輩のやり方をそのまま真似して行うこと","q6_kikikata":"自分の価値観で聞かない、うなずきながら聞く、相手の立場で聞く、笑顔で聞く、話の内容を聞く、メモをしながら聞く","q7_shakaijin":"主に責任の重さと業務の幅、それを自ら管理する必要がある。"},
  "望月梨花": {"q1_mission":"100年経営とワクワクする良い会社作りを応援します。","q2_vision":"21世紀の日本経済を元気にします。","q3_value":"お客様第一主義の実現を通じて全社員が幸せになり、社会に貢献する。","q4_shisei":"姿勢のルールとは、上司や社員に対して姿勢を見せるということ。できる、できないが存在しないものであり、能力に関係なくやるか、やらないかだけである。","q5_shuhari":"守とは、まず師からの教えをそっくりそのままやってみるということ。それが、成長への1番の早道になる。","q6_kikikata":"笑顔で聞く、頷きながら聞く、メモをとりながら聞く、相手の立場で聞く、自分の価値観で聞かない、話の内容を聞く","q7_shakaijin":"社会人と学生の違いは責任の重さと行動の意識の違いだと思う。"},
  "相澤": {"q1_mission":"100年経営とワクワクする良い会社作りを応援します","q2_vision":"21世紀の日本経済を元気にします","q3_value":"お客様の第一主義の実現を通じて全社員が幸せになひ社会に貢献する","q4_shisei":"でかるかできないかではなく、やるかやらないか。","q5_shuhari":"成長するためにまずは1番大事な基礎を体得すること","q6_kikikata":"自分の価値観で聞かない、うなずきながらきく、相手の立場できく、笑顔できく、話の内容をきく、メモを取りながらきく","q7_shakaijin":"自分の提供したバリューに対し対価をもらうこと"},
  "小金澤葵": {"q1_mission":"100年経営とわくわくする良い会社創りを応援します","q2_vision":"21世紀の日本経済を元気にします","q3_value":"お客様第一主義の実現を通じて全社員が幸せになり社会に貢献する","q4_shisei":"できる、できないが存在しないルールです。自身の能力の有無には関係なく、その姿勢のルールをやるかやらないかだけの問題です。","q5_shuhari":"師の教えの意味をすぐには理解できなくても、まずは疑わずにやって見る、型から入るということ。","q6_kikikata":"自分の価値観で聞かない、笑顔で聞く、相手の立場で聞く、メモをとりながら聞く、うなずきながら聞く、話の内容をちゃんと聞く","q7_shakaijin":"自分の軽率な行動が会社に大きく影響してしまうということ。お客様がいるのが当たり前ではないということ。"},
  "廣瀬紫音": {"q1_mission":"100年経営とワクワクする会社創りを応援します","q2_vision":"21世紀の日本経済を元気にします","q3_value":"お客様第一主義の実現を通じて全社員が幸せになり、社会に貢献する","q4_shisei":"できるできないが存在しないルールであり、守らないということは自分の意思でルールを破っているということになる。","q5_shuhari":"教えられたことを忠実に守り、身につけること","q6_kikikata":"話の内容を聴く、笑顔で聴く、頷きながら聴く、メモを取りながら聴く、自分の価値観で聴かない、相手の立場になって聴く","q7_shakaijin":"学生時代はお金を払って勉強していたが、社会人はお金を貰う側になるため、その分責任や求められる成果が上がる。"},
  "菊川太翼": {"q1_mission":"100年経営とワクワクする良い会社創りを応援します。","q2_vision":"21世紀の日本経済を元気にします","q3_value":"お客様第一主義の実現を通じて全従業員の物心の両面を幸せにする社会に貢献する","q4_shisei":"できるできないが存在しないルールであり、能力の有無は関係なく、やるかやらないかである。","q5_shuhari":"師の教えを忠実に守ること。良いところも、悪いところもそのまま真似をする。修行の最初の段階","q6_kikikata":"体、顔、耳を向けて聞く、自分の価値観で聞かない、相手の立場で聞く、うなずきながら聞く、笑顔で聞く、メモをとりながら聞く","q7_shakaijin":"学生はお金を払い教育を受けるお客様だが、社会になると、お客様からお金をいただき提供する立場になる。"},
  "鈴木翔": {"q1_mission":"100年経営とわくわくする会社作りを応援します","q2_vision":"日本の経済を元気にします","q3_value":"お客様第一主義の実現を通じ全従業員が幸福になり、社会に貢献します","q4_shisei":"会社での行動の基本的なルール","q5_shuhari":"教えられたことを教えられた通りに行動すること。教えを守ること。","q6_kikikata":"目を見て話を聞く、うなづきながら聞く、メモをとりながら聞く、姿勢を良くして聞く、体を向ける","q7_shakaijin":"私が思う社会人と学生の違いは責任の所在だと思います。"},
};

const SESSIONS = [
  {
    id: "test_0409",
    title: "テスト①｜MVV・姿勢・守破離",
    date: "2026年4月9日",
    isTest: true,
    totalScore: 70,
    modelAnswers: {
      q1_mission:   "100年経営とワクワクする良い会社創りを応援します",
      q2_vision:    "21世紀の日本経済を元気にします",
      q3_value:     "お客様第一主義の実現を通じて全従業員が幸せになり、社会に貢献する",
      q4_shisei:    "「できる・できない」が存在しないルール。やるかやらないかの意思の問題。会社・上司への姿勢を表すもの。",
      q5_shuhari:   "師の教えをそっくりそのまま忠実に守ること。自己流を出さず、言われた通りに実践すること。",
      q6_kikikata:  "①うなずきながら聞く ②笑顔で聞く ③メモをしながら聞く ④相手の立場で聞く ⑤自分の価値観で聞かない ⑥話の内容を聞く",
      q7_shakaijin: "学生はお金を「受け取る側・消費する側」だが、社会人はお金を「生み出す側」になる。責任の主体が自分と会社に広がる。",
    },
    questions: [
      { id:"q1_mission",   title:"問1：ミッション",         question:"ビジョン税理士法人のミッションを答えてください。", maxScore:10 },
      { id:"q2_vision",    title:"問2：ビジョン",           question:"ビジョン税理士法人のビジョンを答えてください。", maxScore:10 },
      { id:"q3_value",     title:"問3：バリュー",           question:"ビジョン税理士法人のバリューを答えてください。", maxScore:10 },
      { id:"q4_shisei",    title:"問4：姿勢のルール",       question:"姿勢のルールとは何ですか？\n自分の言葉で説明してください。", maxScore:10 },
      { id:"q5_shuhari",   title:"問5：守破離の「守」",     question:"守破離の「守」とは何ですか？\n具体的に説明してください。", maxScore:10 },
      { id:"q6_kikikata",  title:"問6：人の話の聴き方",     question:"人の話の聴き方を6個書いてください。", maxScore:10 },
      { id:"q7_shakaijin", title:"問7：社会人と学生の違い", question:"社会人と学生の違いを自分の言葉で説明してください。", maxScore:10 },
    ],
  },
  {
    id: "test_0413",
    title: "テスト②｜行動指針・良樹細根・成果の三原則",
    date: "2026年4月13日",
    isTest: true,
    totalScore: 50,
    modelAnswers: {
      q1_kodo:    "お客様第一主義、素直と謙虚さ、良樹細根、熱意、人間として何が正しいか、原理・原則を守る、正直な仕事をする、時間を大切にする、成長、プラス発想、毎日0.1％成長する、一人の100歩より百人の1歩",
      q2_ryoju:   "良樹細根とは、細かく根が張っている木は枝葉もよく茂り立派な木になるという言葉。良い成果は日頃の行い・心・基礎など見えない部分から生まれるという意味。",
      q3_ne:      "感謝・挨拶・清掃・環境整備・素直・人格・人間力・誠実・誠意・熱意・笑顔・規律・勤勉・親孝行・礼儀・謙虚・報連相・約束を守る・読書・仲間（20個中10個）",
      q4_stage1:  "インプット中心・仕事がわかる喜び。勉強の習慣を身につける。会計・税務・労務の知識習得。掃除・挨拶を実践する。",
      q5_seika:   "①スピード（即応性）②文字量（熱量と論理）③愚直に実践（試行回数と量）",
    },
    questions: [
      { id:"q1_kodo",   title:"問1：行動指針12個",       question:"行動指針を全て（12個）答えてください。", maxScore:10 },
      { id:"q2_ryoju",  title:"問2：良樹細根とは",       question:"「良樹細根」とは何ですか？\n自分の言葉で説明してください。", maxScore:10 },
      { id:"q3_ne",     title:"問3：根の部分10個",       question:"「良樹細根」図内の「根（環境整備）」の部分を10個答えてください。", maxScore:10 },
      { id:"q4_stage1", title:"問4：第1ステージ",        question:"従業員の未来像の第1ステージで意識するべきことは何ですか？", maxScore:10 },
      { id:"q5_seika",  title:"問5：成果が出る人の三原則", question:"「成果が出る人の三原則」は何ですか？\n3つ答えてください。", maxScore:10 },
    ],
  },
];

async function scoreWithAI(session, answers) {
  const items = session.questions.map(q => ({
    id: q.id, title: q.title,
    model: session.modelAnswers?.[q.id] || "",
    answer: answers[q.id] || "",
  }));
  const prompt = `あなたは新卒研修のテスト採点官です。各問いについて模範解答と受験者の回答を比較して採点してください。採点基準：10点=完璧、8-9点=大半正しい、6-7点=一部正しい、4-5点=不足多い、1-3点=ごく一部正しい、0点=未記入or全く違う。必ずJSON形式のみで返答：{"scores":[{"id":"問いID","score":点数,"comment":"一言コメント20字以内"}]}\n\n${items.map(i=>`【${i.title}】\n模範解答: ${i.model}\n受験者回答: ${i.answer||"(未記入)"}`).join("\n\n")}`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:prompt}] })
    });
    const data = await res.json();
    const parsed = JSON.parse(data.content?.[0]?.text.replace(/```json|```/g,"").trim());
    const result = {};
    parsed.scores.forEach(s => { result[s.id] = { score:s.score, comment:s.comment }; });
    return result;
  } catch {
    const result = {};
    items.forEach(i => { result[i.id] = { score:7, comment:"採点エラー" }; });
    return result;
  }
}

async function saveToGAS(userName, sessionId, answers, scoring, submittedAt) {
  try {
    await fetch(GAS_URL, {
      method:"POST", headers:{"Content-Type":"text/plain"},
      body:JSON.stringify({ userName, sessionId, answers, scoring, submittedAt })
    });
  } catch(e) { console.error(e); }
}

const LKEY = "vt_kenshu_v4";
function lsLoad() { try { return JSON.parse(localStorage.getItem(LKEY)||"{}"); } catch { return {}; } }
function lsSave(d) { try { localStorage.setItem(LKEY, JSON.stringify(d)); } catch {} }

function initData() {
  const d = lsLoad();
  let changed = false;
  MEMBERS.forEach(name => {
    if (!d[name]) d[name] = {};
    if (!d[name]["test_0409"] && SEED_SCORING_0409[name]) {
      d[name]["test_0409"] = {
        answers: SEED_ANSWERS_0409[name],
        scoring: SEED_SCORING_0409[name].scoring,
        submittedAt: "2026-04-09T01:10:00Z",
      };
      changed = true;
    }
  });
  if (changed) lsSave(d);
  return d;
}

export default function App() {
  const [page, setPage]           = useState("login");
  const [user, setUser]           = useState("");
  const [data, setData]           = useState({});
  const [selSession, setSelSession] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => { setData(initData()); setLoading(false); }, []);

  if (loading) return <div style={S.centerWrap}><div style={S.spinner}/></div>;

  return (
    <div style={{background:"#F5F3EF",minHeight:"100vh"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} .fade{animation:fadeIn 0.25s ease}`}</style>
      {page==="login"    && <LoginPage    onStart={n=>{setUser(n);setPage("sessions")}} onAdmin={()=>setPage("admin")} />}
      {page==="sessions" && <SessionList  user={user} data={data} onSelect={s=>{setSelSession(s);setPage("quiz")}} onBack={()=>setPage("login")} />}
      {page==="quiz"     && selSession && <QuizPage user={user} session={selSession} data={data}
        onDone={async rec => {
          const d=lsLoad(); if(!d[user])d[user]={}; d[user][selSession.id]=rec;
          lsSave(d); setData({...d});
          await saveToGAS(user,selSession.id,rec.answers,rec.scoring,rec.submittedAt);
          setPage("done");
        }}/>}
      {page==="done"    && <DonePage    user={user} session={selSession} data={data} onBack={()=>setPage("sessions")} />}
      {page==="admin"   && <AdminPage   data={data} onBack={()=>setPage("login")}
        onDelete={async(name,sid)=>{
          const d=lsLoad(); if(d[name]){delete d[name][sid]; if(!Object.keys(d[name]).length)delete d[name];}
          lsSave(d); setData({...d});
        }}/>}
      {page==="ranking" && <RankingPage data={data} onBack={()=>setPage("admin")} selSession={selSession} />}
    </div>
  );
}

function LoginPage({onStart,onAdmin}){
  const [sel,setSel]=useState("");
  return(<div style={S.centerWrap}><div style={{width:"100%",maxWidth:400}} className="fade">
    <div style={S.logoBg}><div style={S.logoSub}>ビジョン税理士法人</div><div style={S.logoMain}>新卒研修テスト</div><div style={S.logoDesc}>回答・採点・ランキング</div></div>
    <div style={S.card}>
      <label style={S.label}>名前を選んでください</label>
      <select value={sel} onChange={e=>setSel(e.target.value)} style={{...S.input,cursor:"pointer"}}>
        <option value="">― 選択してください ―</option>
        {MEMBERS.map(m=><option key={m} value={m}>{m}</option>)}
      </select>
      <button style={{...S.btnOrange,opacity:sel?1:0.5}} onClick={()=>sel&&onStart(sel)}>始める</button>
    </div>
    <button onClick={onAdmin} style={S.adminLink}>管理者画面</button>
  </div></div>);
}

function SessionList({user,data,onSelect,onBack}){
  const ud=data[user]||{};
  return(<div style={S.pageWrap} className="fade">
    <div style={S.header}><div><div style={S.headerSub}>新卒研修テスト</div><div style={{fontSize:16,fontWeight:700}}>{user} さん</div></div><button style={S.btnSmGray} onClick={onBack}>ログアウト</button></div>
    <p style={{fontSize:13,color:"#999",marginBottom:16}}>受けるテストを選んでください</p>
    {SESSIONS.map(s=>{
      const done=ud[s.id]; const sc=done?.scoring;
      const tot=sc?Object.values(sc).reduce((a,v)=>a+(v.score||0),0):null;
      const max=s.totalScore||s.questions.length*10;
      return(<div key={s.id} style={S.sessionCard} onClick={()=>onSelect(s)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
              <span style={{background:"#E8590C",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4}}>テスト</span>
              <div style={{fontSize:15,fontWeight:700,color:"#1A1A2E"}}>{s.title}</div>
            </div>
            <div style={{fontSize:12,color:"#999"}}>{s.date}　｜　{s.questions.length}問　｜　満点{max}点</div>
          </div>
          {done?<span style={{...S.tagGreen,fontSize:13}}>{tot!==null?`${tot}/${max}点`:"提出済"}</span>:<span style={S.tagOrange}>未回答</span>}
        </div>
      </div>);
    })}
  </div>);
}

function QuizPage({user,session,data,onDone}){
  const existing=data[user]?.[session.id];
  const [answers,setAnswers]=useState(()=>{if(existing?.answers)return{...existing.answers};const init={};session.questions.forEach(q=>{init[q.id]=""});return init;});
  const [cur,setCur]=useState(0);
  const [showHints,setShowHints]=useState(false);
  const [submitting,setSubmitting]=useState(false);
  const [msg,setMsg]=useState("");
  const q=session.questions[cur]; const total=session.questions.length;
  const filled=Object.values(answers).filter(v=>v?.trim()).length;
  const submit=async()=>{
    setSubmitting(true); let scoring=null;
    if(session.isTest&&session.modelAnswers){setMsg("AIが採点中... しばらくお待ちください");scoring=await scoreWithAI(session,answers);}
    else setMsg("提出中...");
    onDone({answers:{...answers},submittedAt:new Date().toISOString(),scoring});
  };
  if(submitting)return(<div style={{...S.centerWrap,flexDirection:"column"}}><div style={S.spinner}/><p style={{fontSize:15,fontWeight:700,color:"#1A1A2E",marginTop:16}}>{msg}</p><p style={{fontSize:12,color:"#999",marginTop:8}}>10〜20秒かかります</p></div>);
  return(<div style={S.pageWrap} className="fade">
    <div style={{...S.header,marginBottom:8}}><div><div style={S.headerSub}>{session.title}</div><div style={{fontSize:12,color:"#aaa"}}>{user} さん</div></div><div style={{fontSize:13,color:"#E8590C",fontWeight:700}}>{filled}/{total} 記入</div></div>
    <div style={{display:"flex",gap:4,marginBottom:16}}>{session.questions.map((_,i)=><div key={i} onClick={()=>{setCur(i);setShowHints(false)}} style={{flex:1,height:4,borderRadius:2,cursor:"pointer",background:i===cur?"#E8590C":answers[session.questions[i].id]?.trim()?"#2E7D32":"#ddd"}}/>)}</div>
    <div style={S.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={S.qTag}>問{cur+1}/{total}</span><span style={{fontSize:12,color:"#999"}}>{q.title}</span></div>
      <p style={S.qText}>{q.question}</p>
      {q.hints&&<div style={{marginTop:12}}><button onClick={()=>setShowHints(!showHints)} style={S.hintToggle}>{showHints?"▾ ヒントを閉じる":"▸ 考えるヒント"}</button>{showHints&&<div style={S.hintBox}>{q.hints.map((h,i)=><div key={i} style={S.hintItem}>▸ {h}</div>)}</div>}</div>}
      <textarea value={answers[q.id]||""} onChange={e=>setAnswers(prev=>({...prev,[q.id]:e.target.value}))} placeholder="自分の言葉で書いてください" style={S.textarea}/>
    </div>
    <div style={{display:"flex",gap:8,marginTop:12}}>
      {cur>0&&<button style={{...S.btnGray,flex:1}} onClick={()=>{setCur(cur-1);setShowHints(false)}}>← 前</button>}
      {cur<total-1?<button style={{...S.btnDark,flex:1}} onClick={()=>{setCur(cur+1);setShowHints(false)}}>次 →</button>:<button style={{...S.btnOrange,flex:1}} onClick={submit}>提出して採点 ✓</button>}
    </div>
  </div>);
}

function DonePage({user,session,data,onBack}){
  const rec=data[user]?.[session.id]; if(!rec)return null;
  const scoring=rec.scoring; const total=scoring?Object.values(scoring).reduce((a,v)=>a+(v.score||0),0):null;
  const max=session.totalScore||session.questions.length*10;
  return(<div style={S.pageWrap} className="fade">
    <div style={{textAlign:"center",marginBottom:20}}>
      {total!==null?<><div style={{fontSize:56,marginBottom:8}}>{total>=max*0.8?"🏆":total>=max*0.6?"✅":"📝"}</div><h2 style={{fontSize:22,color:"#1A1A2E",marginBottom:4}}>{user} さんの得点</h2><div style={{fontSize:48,fontWeight:700,color:"#E8590C",margin:"8px 0"}}>{total}</div><div style={{fontSize:16,color:"#999"}}>/ {max} 点</div></>:<><div style={{fontSize:56,marginBottom:8}}>✅</div><h2 style={{fontSize:20,color:"#1A1A2E"}}>{user} さん、提出完了！</h2></>}
    </div>
    {session.questions.map(q=>{const val=rec.answers?.[q.id];const model=session.modelAnswers?.[q.id];const sc=scoring?.[q.id];return(<div key={q.id} style={S.card}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{fontSize:12,fontWeight:700,color:"#1A1A2E"}}>{q.title}</div>{sc&&<div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:18,fontWeight:700,color:sc.score>=8?"#2E7D32":sc.score>=5?"#E8590C":"#c00"}}>{sc.score}</span><span style={{fontSize:12,color:"#999"}}>/{q.maxScore}</span></div>}</div>
      {sc?.comment&&<div style={{fontSize:11,color:"#666",marginBottom:6,background:"#f5f5f5",padding:"4px 8px",borderRadius:6}}>💬 {sc.comment}</div>}
      <div style={S.answerBox}>{val||"(未記入)"}</div>
      {model&&<div style={{marginTop:8}}><div style={{fontSize:11,color:"#E8590C",fontWeight:700,marginBottom:4}}>模範解答</div><div style={{...S.answerBox,background:"#FEF3EC",fontSize:12}}>{model}</div></div>}
    </div>);})}
    <button style={S.btnGray} onClick={onBack}>テスト一覧に戻る</button>
  </div>);
}

function RankingPage({data,onBack,selSession}){
  const [selSId, setSelSId] = useState(selSession?.id || SESSIONS[0]?.id);
  const session=SESSIONS.find(s=>s.id===selSId);
  const max=session?.totalScore||((session?.questions.length||0)*10);
  const ranked=MEMBERS.map(name=>{const rec=data[name]?.[selSId];if(!rec)return{name,total:null,submitted:false};const sc=rec.scoring;const tot=sc?Object.values(sc).reduce((a,v)=>a+(v.score||0),0):null;return{name,total:tot,submitted:!!rec.submittedAt};}).filter(r=>r.submitted).sort((a,b)=>(b.total||0)-(a.total||0));
  const avg=ranked.filter(r=>r.total!==null).length>0?Math.round(ranked.filter(r=>r.total!==null).reduce((a,r)=>a+r.total,0)/ranked.filter(r=>r.total!==null).length):null;
  return(<div style={S.pageWrap} className="fade">
    <button style={{...S.btnSmGray,marginBottom:12}} onClick={onBack}>← 戻る</button>
    <div style={{...S.logoBg,marginBottom:12,borderRadius:12}}>
      <div style={S.logoSub}>得点ランキング</div>
      <div style={{fontSize:20,fontWeight:700,color:"#fff"}}>🏆 {session?.title}</div>
      <div style={{fontSize:12,color:"#aaa",marginTop:4}}>満点 {max}点</div>
    </div>
    <div style={{display:"flex",gap:4,marginBottom:16,overflowX:"auto"}}>
      {SESSIONS.map(s=><button key={s.id} onClick={()=>setSelSId(s.id)} style={{...S.btnSmGray,whiteSpace:"nowrap",...(selSId===s.id?{background:"#E8590C",color:"#fff"}:{})}}>{s.date}</button>)}
    </div>
    {ranked.length===0&&<div style={{...S.card,textAlign:"center"}}><p style={S.sub}>採点済みデータがありません</p></div>}
    {ranked.map((r,i)=><div key={r.name} style={{...S.card,borderLeft:i===0?"4px solid #FFD700":i===1?"4px solid #C0C0C0":i===2?"4px solid #CD7F32":"4px solid #eee"}}>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{fontSize:24,width:32,textAlign:"center"}}>{["🥇","🥈","🥉"][i]||String(i+1)}</div>
        <div style={{flex:1}}><div style={{fontSize:15,fontWeight:700,color:"#1A1A2E"}}>{r.name}</div><div style={{marginTop:6,background:"#eee",borderRadius:4,height:8,overflow:"hidden"}}><div style={{width:`${r.total!==null?Math.round(r.total/max*100):0}%`,height:"100%",background:i===0?"#E8590C":"#1A1A2E",borderRadius:4}}/></div></div>
        <div style={{textAlign:"right"}}>{r.total!==null?<span style={{fontSize:22,fontWeight:700,color:"#E8590C"}}>{r.total}</span>:<span style={{fontSize:14,color:"#ccc"}}>未採点</span>}<div style={{fontSize:11,color:"#999"}}>/{max}点</div></div>
      </div>
    </div>)}
    {avg!==null&&<div style={{...S.card,textAlign:"center",marginTop:8}}><div style={{fontSize:12,color:"#999",marginBottom:4}}>クラス平均</div><div style={{fontSize:28,fontWeight:700,color:"#1A1A2E"}}>{avg}</div><div style={{fontSize:12,color:"#999"}}>/ {max} 点</div></div>}
  </div>);
}

function AdminPage({data,onBack,onDelete}){
  const [detail,setDetail]=useState(null);
  const [selSId,setSelSId]=useState(SESSIONS[0]?.id);
  const [viewMode,setViewMode]=useState("byPerson");
  const [delConfirm,setDelConfirm]=useState(null);
  const [subPage,setSubPage]=useState("main");
  const session=SESSIONS.find(s=>s.id===selSId);
  const entries=Object.entries(data).filter(([_,v])=>v[selSId]?.submittedAt);
  const max=session?.totalScore||(session?.questions.length||0)*10;
  if(subPage==="ranking")return<RankingPage data={data} onBack={()=>setSubPage("main")} selSession={session}/>;
  if(delConfirm)return(<div style={S.centerWrap}><div style={{...S.card,maxWidth:340,width:"100%"}}><p style={{fontSize:16,fontWeight:700,color:"#1A1A2E",marginBottom:8}}>回答を削除しますか？</p><p style={{...S.sub,marginBottom:16}}>{delConfirm.name}さんの回答を削除します。</p><button style={{...S.btnOrange,marginBottom:8}} onClick={async()=>{await onDelete(delConfirm.name,selSId);setDelConfirm(null);setDetail(null);}}>削除する</button><button style={S.btnGray} onClick={()=>setDelConfirm(null)}>キャンセル</button></div></div>);
  if(detail){const rec=data[detail]?.[selSId];if(!rec){setDetail(null);return null;}const scoring=rec.scoring;const totalScore=scoring?Object.values(scoring).reduce((a,v)=>a+(v.score||0),0):null;return(<div style={S.pageWrap} className="fade"><div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><button style={S.btnSmGray} onClick={()=>setDetail(null)}>← 戻る</button><button style={{...S.btnSmGray,color:"#c00"}} onClick={()=>setDelConfirm({name:detail})}>🗑 削除</button></div><h2 style={{fontSize:18,fontWeight:700,color:"#1A1A2E",marginBottom:4}}>{detail}</h2>{totalScore!==null&&<div style={{...S.card,display:"flex",justifyContent:"center",alignItems:"baseline",gap:8,marginBottom:4}}><span style={{fontSize:36,fontWeight:700,color:"#E8590C"}}>{totalScore}</span><span style={{fontSize:16,color:"#999"}}>/ {max} 点</span></div>}{session?.questions.map(q=>{const sc=scoring?.[q.id];return(<div key={q.id} style={S.card}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{fontSize:12,fontWeight:700,color:"#1A1A2E"}}>{q.title}</div>{sc&&<div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:18,fontWeight:700,color:sc.score>=8?"#2E7D32":sc.score>=5?"#E8590C":"#c00"}}>{sc.score}</span><span style={{fontSize:11,color:"#999"}}>/{q.maxScore}</span></div>}</div>{sc?.comment&&<div style={{fontSize:11,color:"#666",marginBottom:6,background:"#f5f5f5",padding:"4px 8px",borderRadius:6}}>💬 {sc.comment}</div>}<div style={S.answerBox}>{rec.answers?.[q.id]||"(未記入)"}</div>{session.modelAnswers?.[q.id]&&<div style={{marginTop:8}}><div style={{fontSize:11,color:"#E8590C",fontWeight:700,marginBottom:4}}>模範解答</div><div style={{...S.answerBox,background:"#FEF3EC",fontSize:12}}>{session.modelAnswers[q.id]}</div></div>}</div>);})}</div>);}
  return(<div style={S.pageWrap} className="fade">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><h2 style={{fontSize:18,fontWeight:700,color:"#1A1A2E"}}>管理者画面</h2><div style={{display:"flex",gap:6}}><button style={S.btnSmOrange} onClick={()=>setSubPage("ranking")}>🏆 順位</button><button style={S.btnSmGray} onClick={onBack}>戻る</button></div></div>
    <div style={{display:"flex",gap:4,marginBottom:12,overflowX:"auto"}}>
      {SESSIONS.map(s=><button key={s.id} onClick={()=>{setSelSId(s.id);setDetail(null);}} style={{...S.btnSmGray,whiteSpace:"nowrap",...(selSId===s.id?{background:"#E8590C",color:"#fff"}:{})}}>{s.date}</button>)}
    </div>
    <div style={{...S.card,display:"flex",justifyContent:"space-around",textAlign:"center",marginBottom:8}}>
      <div><div style={{fontSize:28,fontWeight:700,color:"#1A1A2E"}}>{entries.length}</div><div style={S.sub}>提出数</div></div>
      <div><div style={{fontSize:28,fontWeight:700,color:"#E8590C"}}>{MEMBERS.length}</div><div style={S.sub}>受験者数</div></div>
      <div><div style={{fontSize:28,fontWeight:700,color:"#2E7D32"}}>{entries.filter(([_,v])=>v[selSId]?.scoring).length}</div><div style={S.sub}>採点済</div></div>
    </div>
    <div style={{display:"flex",borderBottom:"2px solid #eee",marginBottom:16}}>{["byPerson","byQuestion"].map((mode,i)=><div key={mode} onClick={()=>setViewMode(mode)} style={{flex:1,padding:"10px 0",textAlign:"center",fontSize:14,fontWeight:700,cursor:"pointer",color:viewMode===mode?"#E8590C":"#999",borderBottom:viewMode===mode?"3px solid #E8590C":"3px solid transparent"}}>{i===0?"個人ごと":"問いごと"}</div>)}</div>
    {viewMode==="byPerson"&&<div>{entries.length===0&&<div style={{...S.card,textAlign:"center"}}><p style={S.sub}>まだ回答がありません</p></div>}{entries.map(([name,v])=>{const rec=v[selSId];const sc=rec?.scoring;const tot=sc?Object.values(sc).reduce((a,v)=>a+(v.score||0),0):null;return{name,rec,tot};}).sort((a,b)=>(b.tot||0)-(a.tot||0)).map(({name,rec,tot},i)=><div key={name} style={{...S.card,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}} onClick={()=>setDetail(name)}><div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:18,width:28}}>{["🥇","🥈","🥉"][i]||""}</span><div style={{fontSize:15,fontWeight:700,color:"#1A1A2E"}}>{name}</div></div><div style={{fontSize:11,color:"#999"}}>{new Date(rec.submittedAt).toLocaleString("ja-JP")}</div></div><div style={{display:"flex",alignItems:"center",gap:8}}>{tot!==null?<span style={{fontSize:18,fontWeight:700,color:"#E8590C"}}>{tot}/{max}</span>:<span style={{...S.tagOrange,fontSize:11}}>未採点</span>}<span style={{fontSize:18,color:"#ccc"}}>›</span></div></div>)}</div>}
    {viewMode==="byQuestion"&&session?.questions.map(q=>{const cnt=entries.filter(([_,v])=>v[selSId]?.answers?.[q.id]?.trim()).length;const scored=entries.filter(([_,v])=>v[selSId]?.scoring?.[q.id]);const avg=scored.length>0?Math.round(scored.reduce((a,[_,v])=>a+(v[selSId].scoring[q.id]?.score||0),0)/scored.length*10)/10:null;return(<div key={q.id} style={{...S.card,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#1A1A2E",marginBottom:2}}>{q.title}</div><div style={{fontSize:11,color:"#999",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"60vw"}}>{q.question.replace(/\n/g," ")}</div></div><div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>{avg!==null&&<span style={{fontSize:13,fontWeight:700,color:"#E8590C"}}>平均{avg}</span>}<span style={{fontSize:13,color:"#999"}}>{cnt}名</span></div></div>);})}
  </div>);
}

const S={
  centerWrap:{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"100vh",padding:20,background:"#F5F3EF",flexDirection:"column"},
  spinner:{width:32,height:32,borderRadius:"50%",border:"3px solid #E8590C",borderTopColor:"transparent",animation:"spin 0.8s linear infinite"},
  pageWrap:{maxWidth:560,margin:"0 auto",padding:"16px 16px 60px"},
  logoBg:{background:"#1A1A2E",color:"#fff",borderRadius:16,padding:"28px 20px",marginBottom:20,textAlign:"center"},
  logoSub:{fontSize:11,color:"#E8590C",fontWeight:700,letterSpacing:2,marginBottom:4},
  logoMain:{fontSize:22,fontWeight:700},
  logoDesc:{fontSize:12,color:"#999",marginTop:8},
  adminLink:{display:"block",margin:"20px auto 0",background:"none",border:"none",color:"#999",fontSize:12,cursor:"pointer",textDecoration:"underline"},
  header:{background:"#1A1A2E",color:"#fff",borderRadius:12,padding:16,marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"},
  headerSub:{fontSize:11,color:"#E8590C",fontWeight:700,marginBottom:2},
  card:{background:"#fff",borderRadius:12,padding:16,marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"},
  label:{fontSize:14,fontWeight:700,color:"#1A1A2E",marginBottom:8,display:"block"},
  sub:{fontSize:13,color:"#999",lineHeight:1.6},
  input:{width:"100%",padding:14,border:"2px solid #ddd",borderRadius:10,fontSize:16},
  textarea:{width:"100%",minHeight:160,border:"2px solid #ddd",borderRadius:10,padding:14,fontSize:15,resize:"vertical",lineHeight:1.8,marginTop:12},
  answerBox:{background:"#F9F7F4",borderRadius:8,padding:12,fontSize:13,lineHeight:1.8,color:"#333",whiteSpace:"pre-wrap",wordBreak:"break-word"},
  btnOrange:{display:"block",width:"100%",padding:14,background:"#E8590C",color:"#fff",border:"none",borderRadius:10,fontSize:16,fontWeight:700,cursor:"pointer",marginTop:12},
  btnDark:{display:"block",width:"100%",padding:14,background:"#1A1A2E",color:"#fff",border:"none",borderRadius:10,fontSize:16,fontWeight:700,cursor:"pointer",marginTop:12},
  btnGray:{display:"block",width:"100%",padding:14,background:"#E8E8E8",color:"#333",border:"none",borderRadius:10,fontSize:16,fontWeight:700,cursor:"pointer",marginTop:12},
  btnSmOrange:{padding:"8px 16px",background:"#E8590C",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer"},
  btnSmGray:{padding:"8px 16px",background:"#E8E8E8",color:"#333",border:"none",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer"},
  tagOrange:{display:"inline-block",background:"#E8590C",color:"#fff",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:4},
  tagGreen:{display:"inline-block",background:"#2E7D32",color:"#fff",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:4},
  sessionCard:{background:"#fff",borderRadius:12,padding:16,marginBottom:10,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",cursor:"pointer",border:"1px solid #eee"},
  qTag:{display:"inline-block",background:"#E8590C",color:"#fff",fontSize:12,fontWeight:700,padding:"2px 10px",borderRadius:4},
  qText:{fontSize:16,fontWeight:700,color:"#1A1A2E",lineHeight:1.7,whiteSpace:"pre-wrap",marginTop:8},
  hintToggle:{background:"none",border:"none",color:"#E8590C",fontSize:13,fontWeight:700,cursor:"pointer",padding:0},
  hintBox:{background:"#FEF3EC",borderRadius:8,padding:12,marginTop:8},
  hintItem:{fontSize:12,color:"#666",lineHeight:1.7,marginBottom:4},
};
