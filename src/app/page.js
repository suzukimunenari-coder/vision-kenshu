'use client'
import { useState, useEffect, useCallback } from "react";

const GAS_URL = "https://script.google.com/macros/s/AKfycbxOOhjOqe9GfdX9DfUdcLpBW6apPM7eyrP8_bWXGWUmwkQ6G1fzPWzHmnR6BDwHBNGFSQ/exec";

const MEMBERS = [
  "中嶋寛彩","大野裕貴","佐藤北斗","小川泰佑","望月梨花",
  "相澤","小金澤葵","廣瀬紫音","菊川太翼","鈴木翔"
];

const SESSIONS = [
  {
    id: "test_0409",
    title: "新人研修テスト｜MVV・姿勢・守破離",
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

const LKEY = "vt_kenshu_v3";
function lsLoad() { try { return JSON.parse(localStorage.getItem(LKEY)||"{}"); } catch { return {}; } }
function lsSave(d) { try { localStorage.setItem(LKEY, JSON.stringify(d)); } catch {} }
export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState("");
  const [data, setData] = useState({});
  const [selSession, setSelSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setData(lsLoad()); setLoading(false); }, []);

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
      {page==="ranking" && <RankingPage data={data} onBack={()=>setPage("admin")} />}
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
              {s.isTest&&<span style={{background:"#E8590C",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4}}>テスト</span>}
              <div style={{fontSize:15,fontWeight:700,color:"#1A1A2E"}}>{s.title}</div>
            </div>
            <div style={{fontSize:12,color:"#999"}}>{s.date}　｜　{s.questions.length}問</div>
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
    if(session.isTest&&session.modelAnswers){setMsg("AIが採点中...");scoring=await scoreWithAI(session,answers);}
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
      {cur<total-1?<button style={{...S.btnDark,flex:1}} onClick={()=>{setCur(cur+1);setShowHints(false)}}>次 →</button>:<button style={{...S.btnOrange,flex:1}} onClick={submit}>{session.isTest?"提出して採点 ✓":"提出する ✓"}</button>}
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
    <button style={S.btnGray} onClick={onBack}>研修一覧に戻る</button>
  </div>);
}

function RankingPage({data,onBack}){
  const session=SESSIONS.find(s=>s.isTest); if(!session)return null;
  const max=session.totalScore||session.questions.length*10;
  const ranked=MEMBERS.map(name=>{const rec=data[name]?.[session.id];if(!rec)return{name,total:null,submitted:false};const sc=rec.scoring;const tot=sc?Object.values(sc).reduce((a,v)=>a+(v.score||0),0):null;return{name,total:tot,submitted:!!rec.submittedAt};}).filter(r=>r.submitted).sort((a,b)=>(b.total||0)-(a.total||0));
  const avg=ranked.filter(r=>r.total!==null).length>0?Math.round(ranked.filter(r=>r.total!==null).reduce((a,r)=>a+r.total,0)/ranked.filter(r=>r.total!==null).length):null;
  return(<div style={S.pageWrap} className="fade">
    <button style={{...S.btnSmGray,marginBottom:16}} onClick={onBack}>← 戻る</button>
    <div style={{...S.logoBg,marginBottom:16,borderRadius:12}}><div style={S.logoSub}>4/9テスト</div><div style={{fontSize:20,fontWeight:700,color:"#fff"}}>🏆 得点ランキング</div><div style={{fontSize:12,color:"#aaa",marginTop:4}}>満点 {max}点</div></div>
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
  if(subPage==="ranking")return<RankingPage data={data} onBack={()=>setSubPage("main")}/>;
  if(delConfirm)return(<div style={S.centerWrap}><div style={{...S.card,maxWidth:340,width:"100%"}}><p style={{fontSize:16,fontWeight:700,color:"#1A1A2E",marginBottom:8}}>回答を削除しますか？</p><p style={{...S.sub,marginBottom:16}}>{delConfirm.name}さんの回答を削除します。</p><button style={{...S.btnOrange,marginBottom:8}} onClick={async()=>{await onDelete(delConfirm.name,selSId);setDelConfirm(null);setDetail(null);}}>削除する</button><button style={S.btnGray} onClick={()=>setDelConfirm(null)}>キャンセル</button></div></div>);
  if(detail){const rec=data[detail]?.[selSId];if(!rec){setDetail(null);return null;}const scoring=rec.scoring;const totalScore=scoring?Object.values(scoring).reduce((a,v)=>a+(v.score||0),0):null;return(<div style={S.pageWrap} className="fade"><div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><button style={S.btnSmGray} onClick={()=>setDetail(null)}>← 戻る</button><button style={{...S.btnSmGray,color:"#c00"}} onClick={()=>setDelConfirm({name:detail})}>🗑 削除</button></div><h2 style={{fontSize:18,fontWeight:700,color:"#1A1A2E",marginBottom:4}}>{detail}</h2>{totalScore!==null&&<div style={{...S.card,display:"flex",justifyContent:"center",alignItems:"baseline",gap:8,marginBottom:4}}><span style={{fontSize:36,fontWeight:700,color:"#E8590C"}}>{totalScore}</span><span style={{fontSize:16,color:"#999"}}>/ {max} 点</span></div>}{session?.questions.map(q=>{const sc=scoring?.[q.id];return(<div key={q.id} style={S.card}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><div style={{fontSize:12,fontWeight:700,color:"#1A1A2E"}}>{q.title}</div>{sc&&<div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:18,fontWeight:700,color:sc.score>=8?"#2E7D32":sc.score>=5?"#E8590C":"#c00"}}>{sc.score}</span><span style={{fontSize:11,color:"#999"}}>/{q.maxScore}</span></div>}</div>{sc?.comment&&<div style={{fontSize:11,color:"#666",marginBottom:6,background:"#f5f5f5",padding:"4px 8px",borderRadius:6}}>💬 {sc.comment}</div>}<div style={S.answerBox}>{rec.answers?.[q.id]||"(未記入)"}</div>{session.modelAnswers?.[q.id]&&<div style={{marginTop:8}}><div style={{fontSize:11,color:"#E8590C",fontWeight:700,marginBottom:4}}>模範解答</div><div style={{...S.answerBox,background:"#FEF3EC",fontSize:12}}>{session.modelAnswers[q.id]}</div></div>}</div>);})}</div>);}
  return(<div style={S.pageWrap} className="fade">
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><h2 style={{fontSize:18,fontWeight:700,color:"#1A1A2E"}}>管理者画面</h2><div style={{display:"flex",gap:6}}><button style={S.btnSmOrange} onClick={()=>setSubPage("ranking")}>🏆 順位</button><button style={S.btnSmGray} onClick={onBack}>戻る</button></div></div>
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
