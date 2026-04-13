'use client'
import { useState, useEffect } from "react";

const GAS_URL = "https://script.google.com/macros/s/AKfycbxOOhjOqe9GfdX9DfUdcLpBW6apPM7eyrP8_bWXGWUmwkQ6G1fzPWzHmnR6BDwHBNGFSQ/exec";
const SKEY = "vt_v6";
const SKEY_C = "vc_v1";
const ADMIN_PASSWORD = "9999";
const DEFAULT_MEMBERS = ["中嶋寛彩","大野裕貴","佐藤北斗","小川泰佑","望月梨花","相澤","小金澤葵","廣瀬紫音","菊川太翼","鈴木翔"];

const SEED_0409 = {
  answers: {
    "中嶋寛彩":{q1_mission:"100年経営とワクワクする会社づくりをサポートする",q2_vision:"21世紀の日本経済を元気にします",q3_value:"お客様第一主義の実現を通して、全社員が幸せになり、社会に貢献する",q4_shisei:"能力に関係せずに誰であろうと実践できるもの。やるかやらないかの違いのみ。主に以下の6つに分けられる：かかとを床につける、深く腰かける、膝は閉じて前にだす、腹筋に力を入れる、両手は桃の上におく、背もたれによりかからない",q5_shuhari:"師の教えをまずはそのまま実践すること。自己流やオリジナルなものを出さずにアドバイスされたことを言われた通り実践すること",q6_kikikata:"相手の立場になって聞く、自分の価値観で聞かない、うなずきながら聞く、メモを取りながら聞く、笑顔で聞く、話の内容を聞く",q7_shakaijin:"お金を出す側から、サービスを提供してお金をもらう側になること。それに伴い様々な責任が発生する"},
    "大野裕貴":{q1_mission:"100年経営とワクワクする良い会社創りを応援します",q2_vision:"21世紀の日本経済を元気にします。",q3_value:"お客様第一主義の実現を通じて全社員が幸せになり社会に貢献する。",q4_shisei:"完全結果であり、「できる・できない」が存在しないルールで、途中経過や言い訳は存在せず、社会や上司に対しての「姿勢」を表すもの",q5_shuhari:"師の教えを一切疑わず、教えられたことをそのまま忠実に守り、確実に成長をする段階のこと。",q6_kikikata:"うなずきながら聞く。笑顔で聞く。メモをしながら聞く。相手の立場で聞く。自分の価値観で聞かない。話の内容を聞く。",q7_shakaijin:"社会人は学生と違って、お客様という存在がいて、社会人としての責任が大きくなるところ。"},
    "佐藤北斗":{q1_mission:"100年経営とワクワクする良い会社創りを応援します",q2_vision:"21世紀の日本経済を元気にします",q3_value:"お客様第一主義の実現を通じて全社員が幸せになり社会に貢献する",q4_shisei:"できる・できないが存在しないルール。やるかやらないかの意思の問題で、上司・組織に対する姿勢を表す。",q5_shuhari:"師の教えを忠実に守ること。",q6_kikikata:"頷きながら聞く、笑顔で聞く、内容を聞く、メモをとりながら聞く、体全体で聞く、相手の目を見て聞く",q7_shakaijin:"お金を払って学ぶ側からお金を貰ってプロとして働く側でことなる。社会人は限られた時間で優先順位をつけて取り組む必要があり、会社の看板を背負っているという自覚をもつようになる。"},
    "小川泰佑":{q1_mission:"100年経営とワクワクする良い会社創りを応援しま",q2_vision:"21世紀の日本経済を元気にします。",q3_value:"お客様第一主義の実現を通じて全社員が幸せになり社会に貢献する",q4_shisei:"挨拶、時間を守ることや報連相など、出来る出来ないが存在しない全員が守るべきルール",q5_shuhari:"まずは、師である先輩のやり方をそのまま真似して行うこと",q6_kikikata:"自分の価値観で聞かない、うなずきながら聞く、相手の立場で聞く、笑顔で聞く、話の内容を聞く、メモをしながら聞く",q7_shakaijin:"主に責任の重さと業務の幅、それを自ら管理する必要がある。学生では与えられた課題や時間割に従い行動することが中心となることに対して、社会人は自身の業務に対して責任を負いその進捗や優先順位等の判断、管理することが求められる。"},
    "望月梨花":{q1_mission:"100年経営とワクワクする良い会社作りを応援します。",q2_vision:"21世紀の日本経済を元気にします。",q3_value:"お客様第一主義の実現を通じて全社員が幸せになり、社会に貢献する。",q4_shisei:"姿勢のルールとは、上司や社員に対して姿勢を見せるということ。できる、できないが存在しないものであり、能力に関係なくやるか、やらないかだけである。姿勢のルールを守らないということは、自分の意思でルールを破るということになる。",q5_shuhari:"守とは、まず師からの教えをそっくりそのままやってみるということ。それが、成長への1番の早道になる。",q6_kikikata:"①笑顔で聞く②頷きながら聞く③メモをとりながら聞く④相手の立場で聞く⑤自分の価値観で聞かない⑥話の内容を聞く",q7_shakaijin:"社会人と学生の違いは責任の重さと行動の意識の違いだと思う。学生はお金を払って学ぶ立場で、多少の失敗も自分の経験として許されることが多い。しかし、社会人は会社の一員として働くため、自分の行動や仕事の結果に責任を持たなければならない。また、学生は比較的自由に時間が使えるが、社会人になると勤務時間や期限を守ることが当たり前な生活になる。"},
    "相澤":{q1_mission:"100年経営とワクワクする良い会社作りを応援します",q2_vision:"21世紀の日本経済を元気にします",q3_value:"お客様の第一主義の実現を通じて全社員が幸せになひ社会に貢献する",q4_shisei:"でかるかできないかではなく、やるかやらないか。",q5_shuhari:"成長するためにまずは1番大事な基礎を体得すること",q6_kikikata:"自分の価値観で聞かない、うなずきながらきく、相手の立場できく、笑顔できく、話の内容をきく、メモを取りながらきく",q7_shakaijin:"自分の提供したバリューに対し対価をもらうこと"},
    "小金澤葵":{q1_mission:"100年経営とわくわくする良い会社創りを応援します",q2_vision:"21世紀の日本経済を元気にします",q3_value:"お客様第一主義の実現を通じて全社員が幸せになり社会に貢献する",q4_shisei:"できる、できないが存在しないルールです。自身の能力の有無には関係なく、その姿勢のルールをやるかやらないかだけの問題です。自分の軽率な行動が会社に大きく影響してしまうということ。報連相を必ず守ること。働かせていただけることを当たり前だと思わないこと。",q5_shuhari:"師の教えの意味をすぐには理解できなくても、まずは疑わずにやって見る、型から入るということ。",q6_kikikata:"自分の価値観で聞かない、笑顔で聞く、相手の立場で聞く、メモをとりながら聞く、うなずきながら聞く、話の内容をちゃんと聞く",q7_shakaijin:"自分の軽率な行動が会社に大きく影響してしまうということ。お客様がいるのが当たり前ではないということ。会社全体チームであるから、報連相を必ず守ること。働かせていただけることを当たり前だと思わないこと。自分の言葉や行動が相手にどう捉えられるかよく考える必要があること。"},
    "廣瀬紫音":{q1_mission:"100年経営とワクワクする会社創りを応援します",q2_vision:"21世紀の日本経済を元気にします",q3_value:"お客様第一主義の実現を通じて全社員が幸せになり、社会に貢献する",q4_shisei:"できるできないが存在しないルールであり、守らないということは自分の意思でルールを破っているということになる。つまり、会社や上司への姿勢を表すものである。会社の仕組みは姿勢のルールの上に成り立っており、ルールが守られないと仕組みが破綻することになる。",q5_shuhari:"教えられたことを忠実に守り、身につけること",q6_kikikata:"話の内容を聴く、笑顔で聴く、頷きながら聴く、メモを取りながら聴く、自分の価値観で聴かない、相手の立場になって聴く",q7_shakaijin:"学生時代はお金を払って勉強していたが、社会人はお金を貰う側になるため、その分責任や求められる成果が上がる。アルバイトとは異なり、業務の幅が広がり、タスクも増えていく。そのため更に勉強を続けながら時間を管理する能力も求められる。"},
    "菊川太翼":{q1_mission:"100年経営とワクワクする良い会社創りを応援します。",q2_vision:"21世紀の日本経済を元気にします",q3_value:"お客様第一主義の実現を通じて全従業員の物心の両面を幸せにする社会に貢献する",q4_shisei:"できるできないが存在しないルールであり、能力の有無は関係なく、やるかやらないかである。よって守らない人は意図的に守っていないということになる。会社、上司に対する姿勢。姿勢のルールは完全結果であり、途中経過などは存在しない。",q5_shuhari:"師の教えを忠実に守ること。良いところも、悪いところもそのまま真似をする。修行の最初の段階。会社で言えば、先輩に教えてもらった入力のやり方をそのまま同じようにやること。",q6_kikikata:"体、顔、耳を向けて聞く、自分の価値観で聞かない、相手の立場で聞く、うなずきながら聞く、笑顔で聞く、メモをとりながら聞く",q7_shakaijin:"学生はお金を払い教育を受けるお客様だが、社会になると、お客様からお金をいただき提供する立場になる。時間は限られており、コストという考え方になるため、その時間をどれだけ利益に変えられるか、自分の成長に使えるか、考えながら過ごしていかなければならない。"},
    "鈴木翔":{q1_mission:"100年経営とわくわくする会社作りを応援します",q2_vision:"日本の経済を元気にします",q3_value:"お客様第一主義の実現を通じ全従業員が幸福になり、社会に貢献します",q4_shisei:"会社での行動の基本的なルール",q5_shuhari:"教えられたことを教えられた通りに行動すること。教えを守ること。",q6_kikikata:"目を見て話を聞く、うなづきながら聞く、メモをとりながら聞く、姿勢を良くして聞く、体を向ける",q7_shakaijin:"私が思う社会人と学生の違いは責任の所在だと思います。学生の頃は何をしても自分だけの責任になると思います。一方、社会人は何か行動をするときは会社の代表として動かなければならない。お客様に納期を守らないなどの問題行動をすれば会社全体のイメージの低下につながる。このように責任が個人なのか周りを巻き込むかが異なると思います。"}
  },
  scoring: {
    "中嶋寛彩":{q1_mission:{score:6,comment:"応援→サポートに変更あり"},q2_vision:{score:10,comment:"完璧"},q3_value:{score:8,comment:"全社員→従業員の差あり"},q4_shisei:{score:8,comment:"内容正確・文字量も十分"},q5_shuhari:{score:9,comment:"ほぼ完璧"},q6_kikikata:{score:9,comment:"6個揃っている"},q7_shakaijin:{score:8,comment:"お金の流れを理解"}},
    "大野裕貴":{q1_mission:{score:10,comment:"完璧"},q2_vision:{score:10,comment:"完璧"},q3_value:{score:9,comment:"ほぼ正確"},q4_shisei:{score:9,comment:"完全結果の概念も含む"},q5_shuhari:{score:9,comment:"疑わずという表現が良い"},q6_kikikata:{score:10,comment:"6個完璧"},q7_shakaijin:{score:7,comment:"責任の観点は良いが文字量少"}},
    "佐藤北斗":{q1_mission:{score:10,comment:"完璧"},q2_vision:{score:10,comment:"完璧"},q3_value:{score:9,comment:"ほぼ正確"},q4_shisei:{score:8,comment:"要点OK・文字量やや少"},q5_shuhari:{score:6,comment:"内容が薄い・文字量不足"},q6_kikikata:{score:8,comment:"目を見てが模範外だが良い"},q7_shakaijin:{score:9,comment:"プロ意識・文字量も十分"}},
    "小川泰佑":{q1_mission:{score:9,comment:"語尾が切れているが内容OK"},q2_vision:{score:10,comment:"完璧"},q3_value:{score:9,comment:"ほぼ正確"},q4_shisei:{score:7,comment:"例示はあるが定義が薄い"},q5_shuhari:{score:8,comment:"真似するという表現が良い"},q6_kikikata:{score:9,comment:"6個揃っている"},q7_shakaijin:{score:8,comment:"責任の管理・文字量十分"}},
    "望月梨花":{q1_mission:{score:9,comment:"作り→創りだが内容OK"},q2_vision:{score:10,comment:"完璧"},q3_value:{score:9,comment:"ほぼ正確"},q4_shisei:{score:10,comment:"内容正確・文字量も十分"},q5_shuhari:{score:9,comment:"そっくりそのままが正確"},q6_kikikata:{score:9,comment:"6個揃っている"},q7_shakaijin:{score:10,comment:"内容豊富・文字量優秀"}},
    "相澤":{q1_mission:{score:8,comment:"内容OK"},q2_vision:{score:10,comment:"完璧"},q3_value:{score:5,comment:"誤字あり・全社員表記"},q4_shisei:{score:4,comment:"短すぎて説明不足"},q5_shuhari:{score:4,comment:"基礎体得は方向性が違う"},q6_kikikata:{score:9,comment:"6個揃っている"},q7_shakaijin:{score:1,comment:"バリュー提供の説明は違う"}},
    "小金澤葵":{q1_mission:{score:9,comment:"ひらがな表記だが内容OK"},q2_vision:{score:10,comment:"完璧"},q3_value:{score:9,comment:"ほぼ正確"},q4_shisei:{score:10,comment:"内容正確・文字量も十分"},q5_shuhari:{score:8,comment:"型から入るが良い"},q6_kikikata:{score:9,comment:"6個揃っている"},q7_shakaijin:{score:10,comment:"内容豊富・文字量優秀"}},
    "廣瀬紫音":{q1_mission:{score:8,comment:"法人名が省略"},q2_vision:{score:10,comment:"完璧"},q3_value:{score:9,comment:"ほぼ正確"},q4_shisei:{score:10,comment:"仕組み崩壊まで言及・優秀"},q5_shuhari:{score:7,comment:"忠実に守るはOKだが薄い"},q6_kikikata:{score:9,comment:"6個揃っている"},q7_shakaijin:{score:9,comment:"お金と成長・文字量十分"}},
    "菊川太翼":{q1_mission:{score:10,comment:"完璧"},q2_vision:{score:10,comment:"完璧"},q3_value:{score:7,comment:"物心両面は違う表現"},q4_shisei:{score:10,comment:"完全結果まで言及・文字量優秀"},q5_shuhari:{score:9,comment:"具体例まで記述・優秀"},q6_kikikata:{score:9,comment:"体・顔・耳は独自だが良い"},q7_shakaijin:{score:10,comment:"コスト意識・文字量優秀"}},
    "鈴木翔":{q1_mission:{score:7,comment:"ひらがな・語尾が違う"},q2_vision:{score:5,comment:"21世紀が抜けている"},q3_value:{score:7,comment:"幸福→幸せの違いあり"},q4_shisei:{score:2,comment:"内容が的外れ・文字量不足"},q5_shuhari:{score:6,comment:"教えを守るは正しいが薄い"},q6_kikikata:{score:7,comment:"5個のみ・姿勢は模範外"},q7_shakaijin:{score:8,comment:"責任の所在・文字量十分"}}
  }
};

const DEFAULT_SESSIONS = [{
  id:"test_0409",title:"テスト① MVV・姿勢・守破離",date:"2026/4/9",totalScore:70,
  modelAnswers:{q1_mission:"100年経営とワクワクする良い会社創りを応援します",q2_vision:"21世紀の日本経済を元気にします",q3_value:"お客様第一主義の実現を通じて全従業員が幸せになり、社会に貢献する",q4_shisei:"「できる・できない」が存在しないルール。やるかやらないかの意思の問題。会社・上司への姿勢を表すもの。",q5_shuhari:"師の教えをそっくりそのまま忠実に守ること。自己流を出さず、言われた通りに実践すること。",q6_kikikata:"①うなずきながら聞く ②笑顔で聞く ③メモをしながら聞く ④相手の立場で聞く ⑤自分の価値観で聞かない ⑥話の内容を聞く",q7_shakaijin:"学生はお金を「受け取る側・消費する側」だが、社会人はお金を「生み出す側」になる。責任の主体が自分と会社に広がる。"},
  questions:[
    {id:"q1_mission",title:"問1：ミッション",question:"ビジョン税理士法人のミッションを答えてください。",maxScore:10,scoringMode:"暗記型"},
    {id:"q2_vision",title:"問2：ビジョン",question:"ビジョン税理士法人のビジョンを答えてください。",maxScore:10,scoringMode:"暗記型"},
    {id:"q3_value",title:"問3：バリュー",question:"ビジョン税理士法人のバリューを答えてください。",maxScore:10,scoringMode:"暗記型"},
    {id:"q4_shisei",title:"問4：姿勢のルール",question:"姿勢のルールとは何ですか？\n自分の言葉で説明してください。",maxScore:10,scoringMode:"理解型（文字量なし）"},
    {id:"q5_shuhari",title:"問5：守破離の「守」",question:"守破離の「守」とは何ですか？\n具体的に説明してください。",maxScore:10,scoringMode:"理解型（文字量なし）"},
    {id:"q6_kikikata",title:"問6：人の話の聴き方",question:"人の話の聴き方を6個書いてください。",maxScore:10,scoringMode:"暗記型"},
    {id:"q7_shakaijin",title:"問7：社会人と学生の違い",question:"社会人と学生の違いを自分の言葉で説明してください。",maxScore:10,scoringMode:"理解型（文字量あり）"},
  ]
},{
  id:"test_0413",title:"テスト② 行動指針・良樹細根・成果の三原則",date:"2026/4/13",totalScore:50,
  modelAnswers:{
    q1_kodo:"お客様第一主義、素直と謙虚さ、良樹細根、熱意、人間として何が正しいか、原理・原則を守る、正直な仕事をする、時間を大切にする、成長、プラス発想、毎日0.1％成長する、一人の100歩より百人の1歩",
    q2_ryoju:"「良樹細根（りょうじゅさいこん）」とは、良い果実（成果）を得るには、見えない根（人間性や基礎）を育てる必要があるという教え。細かく根が張っている木は枝葉もよく茂り立派な木になる。良い成果は日頃の行い・心・基礎など見えない部分から生まれる。",
    q3_ne:"感謝・挨拶・清掃・環境整備・素直・人格・人間力・誠実・誠意・熱意・笑顔・規律・勤勉・親孝行・礼儀・謙虚・報連相・約束を守る・読書・仲間（20個中10個）",
    q4_stage1:"インプット中心・仕事がわかる喜び。勉強の習慣を身につける。会計・税務・労務の知識習得。掃除・挨拶を実践する。",
    q5_seika:"①スピード（即応性）②文字量（熱量と論理）③愚直に実践（試行回数と量）"
  },
  questions:[
    {id:"q1_kodo",title:"問1：行動指針12個",question:"行動指針を全て（12個）答えてください。",maxScore:10,scoringMode:"暗記型"},
    {id:"q2_ryoju",title:"問2：良樹細根とは",question:"「良樹細根」とは何ですか？\n自分の言葉で説明してください。",maxScore:10,scoringMode:"理解型（文字量なし）"},
    {id:"q3_ne",title:"問3：根の部分10個",question:"「良樹細根」図内の「根（環境整備）」の部分を10個答えてください。",maxScore:10,scoringMode:"暗記型"},
    {id:"q4_stage1",title:"問4：第1ステージ",question:"従業員の未来像の第1ステージで意識するべきことは何ですか？",maxScore:10,scoringMode:"理解型（文字量なし）"},
    {id:"q5_seika",title:"問5：成果が出る人の三原則",question:"「成果が出る人の三原則」は何ですか？\n3つ答えてください。",maxScore:10,scoringMode:"暗記型"},
  ]
}];

const COLLEGE_SESSIONS = [{
  id:"college_0413",title:"基礎テスト① 月次決算書の基本",date:"2026/4/13",totalScore:70,
  modelAnswers:{
    c1_color:"青→当月黒字・累計黒字。黄→当月黒字だが累計赤字、または当月赤字だが累計黒字。ピンク→当月赤字・累計赤字。",
    c2_pqmqfg:"PQ→売上高（単価×数量）。MQ→粗利益額（売上高－変動費）。F→固定費。G→経常利益（MQ－F）。",
    c3_soneki:"固定費÷粗利益額",
    c4_anzen:"G÷MQ。販売数量の減少にどれだけ耐えられるかを示す指標。理想10%・目標5%。",
    c5_explain:"P（単価）・Q（数量）・V（変動費）・F（固定費）の4つの視点で説明する。感度分析を使い、どの要素が一番利益に影響するかを数字で示しながら、どこに手を打てば利益が出るかをお客様と一緒に考える。",
    c6_salesdown:"売上三期比較グラフで傾向を確認する。粗利益率・固定費生産性・損益分岐点比率を見て、P（単価）を上げるかQ（数量）を増やすかF（固定費）を下げるかを提案する。",
    c7_cashflow:"利益は損益計算書上の数字だが、売掛金の増加・借入返済・設備投資などでお金は出ていく。キャッシュフロー計算書で実際のお金の動きを確認し、勘定合って銭足らずの状態を説明する。"
  },
  questions:[
    {id:"c1_color",title:"問1：表紙の色の意味",question:"月次決算書の表紙の色（青・黄・ピンク）それぞれの意味を答えてください。",maxScore:15,scoringMode:"暗記型"},
    {id:"c2_pqmqfg",title:"問2：PQ・MQ・F・Gの意味",question:"PQ・MQ・F・Gそれぞれの意味を答えてください。",maxScore:20,scoringMode:"暗記型"},
    {id:"c3_soneki",title:"問3：損益分岐点比率の計算式",question:"損益分岐点比率の計算式を答えてください。",maxScore:10,scoringMode:"暗記型"},
    {id:"c4_anzen",title:"問4：経営安全率とは",question:"経営安全率とは何ですか？計算式と意味を説明してください。",maxScore:10,scoringMode:"理解型（文字量なし）"},
    {id:"c5_explain",title:"問5：お客様への説明",question:"月次決算書を使って「どこに手を打てば利益が出るか」をお客様に説明する場合、どのように説明しますか？",maxScore:15,scoringMode:"理解型（文字量あり）"},
    {id:"c6_salesdown",title:"問6：売上が下がった時",question:"お客様の売上が前年比で下がっていた場合、何を見てどう対応を提案しますか？",maxScore:10,scoringMode:"理解型（文字量あり）"},
    {id:"c7_cashflow",title:"問7：利益とお金の違い",question:"「利益が出ているのにお金が残らない」という状況をどう説明しますか？",maxScore:10,scoringMode:"理解型（文字量あり）"},
  ]
}];

function calcHensa(scores) {
  const vals = Object.values(scores).filter(v => v !== null);
  if (vals.length < 2) return null;
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const std = Math.sqrt(vals.reduce((a, v) => a + (v - avg) ** 2, 0) / vals.length);
  const map = {};
  Object.entries(scores).forEach(([n, v]) => { map[n] = std > 0 ? Math.round(50 + 10 * (v - avg) / std) : 50; });
  return map;
}

async function scoreWithAI(session, answers) {
  try {
    const res = await fetch("/api/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session, answers }) });
    const data = await res.json();
    if (!data.success) throw new Error(data.error);
    return data.scoring;
  } catch(e) {
    console.error("採点エラー:", e);
    const r = {};
    session.questions.forEach(q => { r[q.id] = { score: 0, comment: "採点失敗・再提出を", is_off_topic: false }; });
    return r;
  }
}

async function saveGAS(u, sid, ans, sc, ts) { try { await fetch(GAS_URL, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify({ userName: u, sessionId: sid, answers: ans, scoring: sc, submittedAt: ts }) }); } catch {} }

async function loadFromGAS() {
  try {
    const res = await fetch(GAS_URL + "?action=getAllData");
    const data = await res.json();
    if (data.status === "ok" && data.data) return data.data;
  } catch(e) { console.error("GAS読み込みエラー:", e); }
  return null;
}

function dbLoad(key) { try { return JSON.parse(localStorage.getItem(key || SKEY) || "{}"); } catch { return {}; } }
function dbSave(d, key) { try { localStorage.setItem(key || SKEY, JSON.stringify(d)); } catch {} }
function cfgLoad(key) { try { return JSON.parse(localStorage.getItem((key || SKEY) + "_cfg") || "{}"); } catch { return {}; } }
function cfgSave(c, key) { try { localStorage.setItem((key || SKEY) + "_cfg", JSON.stringify(c)); } catch {} }

function initAll() {
  const d = dbLoad(SKEY);
  const savedCfg = cfgLoad(SKEY);
  const cfg = {};
  cfg.members = savedCfg.members || [...DEFAULT_MEMBERS];
  cfg.sessions = DEFAULT_SESSIONS.map(ds => {
    const existing = (savedCfg.sessions || []).find(s => s.id === ds.id);
    if (!existing) return { ...ds };
    return { ...existing, modelAnswers: ds.modelAnswers, questions: ds.questions.map(dq => ({ ...dq, scoringMode: dq.scoringMode })) };
  });
  const defaultIds = DEFAULT_SESSIONS.map(s => s.id);
  const customSessions = (savedCfg.sessions || []).filter(s => !defaultIds.includes(s.id));
  cfg.sessions = [...cfg.sessions, ...customSessions];
  let changed = false;
  DEFAULT_MEMBERS.forEach(name => {
    if (!d[name]) d[name] = {};
    if (!d[name]["test_0409"] && SEED_0409.scoring[name]) {
      d[name]["test_0409"] = { answers: SEED_0409.answers[name], scoring: SEED_0409.scoring[name], submittedAt: "2026-04-09T01:10:00Z" };
      changed = true;
    }
  });
  if (changed) dbSave(d, SKEY);
  cfgSave(cfg, SKEY);
  return { data: d, cfg };
}

function initCollege() {
  const d = dbLoad(SKEY_C);
  const savedCfg = cfgLoad(SKEY_C);
  const cfg = {};
  cfg.members = savedCfg.members || [];
  cfg.sessions = COLLEGE_SESSIONS.map(ds => {
    const existing = (savedCfg.sessions || []).find(s => s.id === ds.id);
    if (!existing) return { ...ds };
    return { ...existing, modelAnswers: ds.modelAnswers, questions: ds.questions.map(dq => ({ ...dq, scoringMode: dq.scoringMode })) };
  });
  const defaultIds = COLLEGE_SESSIONS.map(s => s.id);
  const customSessions = (savedCfg.sessions || []).filter(s => !defaultIds.includes(s.id));
  cfg.sessions = [...cfg.sessions, ...customSessions];
  cfgSave(cfg, SKEY_C);
  return { data: d, cfg };
}

export default function App() {
  const [mode, setMode] = useState("top"); // "top" | "shinjin" | "college"
  return (
    <div style={{ background: "#F5F3EF", minHeight: "100vh" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}} .fade{animation:fadeIn .2s ease} *{box-sizing:border-box}`}</style>
      {mode === "top" && <TopPage onSelect={setMode} />}
      {mode === "shinyin" && <ShinjiApp onBack={() => setMode("top")} />}
      {mode === "college" && <CollegeApp onBack={() => setMode("top")} />}
    </div>
  );
}

// ===== トップページ =====
function TopPage({ onSelect }) {
  return (
    <div style={S.cw}>
      <div style={{ width: "100%", maxWidth: 400 }} className="fade">
        <div style={S.lb}>
          <div style={S.ls}>ビジョン税理士法人</div>
          <div style={S.lm}>学習・テストシステム</div>
          <div style={S.ld}>学びを深め、お客様に価値を届ける</div>
        </div>
        <div style={{ ...S.card, cursor: "pointer", borderLeft: "4px solid #E8590C" }} onClick={() => onSelect("shinyin")}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 36 }}>🎓</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#1A1A2E" }}>新人研修テスト</div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>MVV・姿勢・行動指針・守破離</div>
            </div>
          </div>
          <button style={{ ...S.btnO, marginTop: 12 }}>入る →</button>
        </div>
        <div style={{ ...S.card, cursor: "pointer", borderLeft: "4px solid #1A1A2E" }} onClick={() => onSelect("college")}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontSize: 36 }}>📊</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "#1A1A2E" }}>ビジョンカレッジ</div>
              <div style={{ fontSize: 12, color: "#999", marginTop: 2 }}>月次決算書・実践研修テスト</div>
            </div>
          </div>
          <button style={{ ...S.btnD, marginTop: 12 }}>入る →</button>
        </div>
      </div>
    </div>
  );
}

// ===== 新人研修テスト アプリ =====
function ShinjiApp({ onBack }) {
  const [page, setPage] = useState("login");
  const [prevPage, setPrevPage] = useState("sessions");
  const [user, setUser] = useState("");
  const [data, setData] = useState({});
  const [cfg, setCfg] = useState({ members: [], sessions: [] });
  const [selSession, setSelSession] = useState(null);
  const [doneRec, setDoneRec] = useState(null);
  useEffect(() => { const { data: d, cfg: c } = initAll(); setData(d); setCfg(c); }, []);
  const updateCfg = c => { cfgSave(c, SKEY); setCfg({ ...c }); };
  const updateData = d => { dbSave(d, SKEY); setData({ ...d }); };
  const goRanking = (from) => { setPrevPage(from); setPage("ranking"); };

  return <>
    {page === "login" && <LoginPage cfg={cfg} onStart={n => { setUser(n); setPage("sessions"); }} onAdmin={(pw) => { if(pw === ADMIN_PASSWORD) setPage("admin"); }} updateCfg={updateCfg} onBack={onBack} appName="新人研修テスト" appSub="MVV・姿勢・行動指針" />}
    {page === "sessions" && <SessionList user={user} data={data} cfg={cfg} onSelect={s => { setSelSession(s); setPage("quiz"); }} onBack={() => setPage("login")} onShowRanking={() => goRanking("sessions")} />}
    {page === "quiz" && selSession && <QuizPage user={user} session={selSession} data={data} onDone={async rec => {
      const d = dbLoad(SKEY); if (!d[user]) d[user] = {}; d[user][selSession.id] = rec;
      dbSave(d, SKEY); setData({ ...d }); setDoneRec(rec);
      await saveGAS(user, selSession.id, rec.answers, rec.scoring, rec.submittedAt); setPage("done");
    }} />}
    {page === "done" && selSession && doneRec && <DonePage user={user} session={selSession} rec={doneRec} onBack={() => { setDoneRec(null); setPage("sessions"); }} />}
    {page === "admin" && <AdminPage data={data} cfg={cfg} onBack={() => setPage("login")} updateData={updateData} updateCfg={updateCfg} onShowRanking={() => goRanking("admin")} skey={SKEY} />}
    {page === "ranking" && <RankingPage data={data} cfg={cfg} onBack={() => setPage(prevPage || "sessions")} />}
  </>;
}

// ===== ビジョンカレッジ アプリ =====
function CollegeApp({ onBack }) {
  const [page, setPage] = useState("login");
  const [prevPage, setPrevPage] = useState("sessions");
  const [user, setUser] = useState("");
  const [data, setData] = useState({});
  const [cfg, setCfg] = useState({ members: [], sessions: [] });
  const [selSession, setSelSession] = useState(null);
  const [doneRec, setDoneRec] = useState(null);
  useEffect(() => { const { data: d, cfg: c } = initCollege(); setData(d); setCfg(c); }, []);
  const updateCfg = c => { cfgSave(c, SKEY_C); setCfg({ ...c }); };
  const updateData = d => { dbSave(d, SKEY_C); setData({ ...d }); };
  const goRanking = (from) => { setPrevPage(from); setPage("ranking"); };

  return <>
    {page === "login" && <LoginPage cfg={cfg} onStart={n => { setUser(n); setPage("sessions"); }} onAdmin={(pw) => { if(pw === ADMIN_PASSWORD) setPage("admin"); }} updateCfg={updateCfg} onBack={onBack} appName="ビジョンカレッジ" appSub="月次決算書・実践研修" allowNewName={true} />}
    {page === "sessions" && <SessionList user={user} data={data} cfg={cfg} onSelect={s => { setSelSession(s); setPage("quiz"); }} onBack={() => setPage("login")} onShowRanking={() => goRanking("sessions")} />}
    {page === "quiz" && selSession && <QuizPage user={user} session={selSession} data={data} onDone={async rec => {
      const d = dbLoad(SKEY_C); if (!d[user]) d[user] = {}; d[user][selSession.id] = rec;
      dbSave(d, SKEY_C); setData({ ...d }); setDoneRec(rec);
      await saveGAS(user, selSession.id, rec.answers, rec.scoring, rec.submittedAt); setPage("done");
    }} />}
    {page === "done" && selSession && doneRec && <DonePage user={user} session={selSession} rec={doneRec} onBack={() => { setDoneRec(null); setPage("sessions"); }} />}
    {page === "admin" && <AdminPage data={data} cfg={cfg} onBack={() => setPage("login")} updateData={updateData} updateCfg={updateCfg} onShowRanking={() => goRanking("admin")} skey={SKEY_C} isCollege={true} />}
    {page === "ranking" && <RankingPage data={data} cfg={cfg} onBack={() => setPage(prevPage || "sessions")} />}
  </>;
}

function LoginPage({ cfg, onStart, onAdmin, updateCfg, onBack, appName, appSub, allowNewName }) {
  const [sel, setSel] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState("");
  const [pwErr, setPwErr] = useState(false);
  const addAndStart = () => {
    if (!newName.trim()) return;
    const updated = [...(cfg.members || []), newName.trim()];
    updateCfg({ ...cfg, members: updated });
    onStart(newName.trim());
  };
  const handleAdmin = () => {
    if (pw === ADMIN_PASSWORD) { onAdmin(pw); }
    else { setPwErr(true); setTimeout(() => setPwErr(false), 2000); }
  };
  return (
    <div style={S.cw}>
      <div style={{ width: "100%", maxWidth: 400 }} className="fade">
        <div style={S.lb}>
          <div style={S.ls}>ビジョン税理士法人</div>
          <div style={S.lm}>{appName || "研修テスト"}</div>
          <div style={S.ld}>{appSub || ""}</div>
        </div>
        {!showInput ? (
          <div style={S.card}>
            <label style={S.label}>名前を選んでください</label>
            <select value={sel} onChange={e => setSel(e.target.value)} style={{ ...S.input, cursor: "pointer" }}>
              <option value="">― 選択してください ―</option>
              {(cfg.members || []).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <button style={{ ...S.btnO, opacity: sel ? 1 : 0.5, marginTop: 12 }} onClick={() => sel && onStart(sel)}>始める</button>
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <button onClick={() => { setShowInput(true); setSel(""); }} style={{ background: "none", border: "none", color: "#E8590C", fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>
                名前がない場合はこちら →
              </button>
            </div>
          </div>
        ) : (
          <div style={S.card}>
            <label style={S.label}>名前を入力してください</label>
            <p style={{ fontSize: 12, color: "#999", marginBottom: 10 }}>入力した名前はリストに追加されます</p>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="例：山田太郎" style={S.input} onKeyDown={e => e.key === "Enter" && newName.trim() && addAndStart()} />
            <button style={{ ...S.btnO, opacity: newName.trim() ? 1 : 0.5, marginTop: 12 }} onClick={addAndStart}>追加して始める</button>
            <button style={{ ...S.btnG, marginTop: 8 }} onClick={() => { setShowInput(false); setNewName(""); }}>← 選択に戻る</button>
          </div>
        )}
        {!showPw ? (
          <button onClick={() => setShowPw(true)} style={S.al}>管理者画面</button>
        ) : (
          <div style={{ ...S.card, marginTop: 12 }}>
            <label style={S.label}>管理者パスワード</label>
            <input value={pw} onChange={e => setPw(e.target.value)} type="password" placeholder="パスワードを入力" style={{ ...S.input, borderColor: pwErr ? "#c00" : "#ddd" }} onKeyDown={e => e.key === "Enter" && handleAdmin()} />
            {pwErr && <p style={{ color: "#c00", fontSize: 12, marginTop: 4 }}>パスワードが違います</p>}
            <button style={{ ...S.btnD, marginTop: 8 }} onClick={handleAdmin}>入る</button>
            <button style={{ ...S.btnG, marginTop: 8 }} onClick={() => { setShowPw(false); setPw(""); }}>キャンセル</button>
          </div>
        )}
        {onBack && <button onClick={onBack} style={{ ...S.al, color: "#E8590C" }}>← トップに戻る</button>}
      </div>
    </div>
  );
}

function SessionList({ user, data, cfg, onSelect, onBack, onShowRanking }) {
  const ud = data[user] || {};
  return (
    <div style={S.pw} className="fade">
      <div style={S.hdr}>
        <div><div style={S.hs}>テスト一覧</div><div style={{ fontSize: 16, fontWeight: 700 }}>{user} さん</div></div>
        <button style={S.btnSG} onClick={onBack}>ログアウト</button>
      </div>
      <button style={{ ...S.btnO, marginBottom: 16 }} onClick={onShowRanking}>🏆 みんなの順位・点数を見る</button>
      <p style={{ fontSize: 13, color: "#999", marginBottom: 12 }}>受けるテストを選んでください</p>
      {(cfg.sessions || []).map(s => {
        const done = ud[s.id]; const sc = done?.scoring;
        const tot = sc ? Object.values(sc).reduce((a, v) => a + (v?.score || 0), 0) : null;
        const max = s.totalScore || s.questions.length * 10;
        return <div key={s.id} style={S.sc} onClick={() => onSelect(s)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ background: "#E8590C", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>テスト</span>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>{s.title}</div>
              </div>
              <div style={{ fontSize: 12, color: "#999" }}>{s.date}　｜　{s.questions.length}問　満点{max}点</div>
            </div>
            {done ? <span style={{ ...S.tagG, fontSize: 13 }}>{tot !== null ? `${tot}/${max}点` : "提出済"}</span> : <span style={S.tagO}>未回答</span>}
          </div>
        </div>;
      })}
    </div>
  );
}

function QuizPage({ user, session, data, onDone }) {
  const ex = data[user]?.[session.id];
  const [answers, setAnswers] = useState(() => {
    if (ex?.answers) return { ...ex.answers };
    const i = {}; session.questions.forEach(q => { i[q.id] = ""; }); return i;
  });
  const [cur, setCur] = useState(0);
  const [sub, setSub] = useState(false);
  const [msg, setMsg] = useState("");
  const q = session.questions[cur];
  const total = session.questions.length;
  const filled = Object.values(answers).filter(v => v?.trim()).length;
  const cc = (answers[q.id] || "").length;
  const submit = async () => {
    setSub(true);
    let sc = null;
    if (session.modelAnswers) {
      setMsg("AIが採点中... しばらくお待ちください");
      sc = await scoreWithAI(session, answers);
    } else { setMsg("提出中..."); }
    onDone({ answers: { ...answers }, submittedAt: new Date().toISOString(), scoring: sc });
  };
  if (sub) return <div style={{ ...S.cw, flexDirection: "column" }}><div style={S.spin} /><p style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E", marginTop: 16 }}>{msg}</p><p style={{ fontSize: 12, color: "#999", marginTop: 8 }}>10〜20秒かかります</p></div>;
  return <div style={S.pw} className="fade">
    <div style={{ ...S.hdr, marginBottom: 8 }}><div><div style={S.hs}>{session.title}</div><div style={{ fontSize: 12, color: "#aaa" }}>{user} さん</div></div><div style={{ fontSize: 13, color: "#E8590C", fontWeight: 700 }}>{filled}/{total} 記入</div></div>
    <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>{session.questions.map((_, i) => <div key={i} onClick={() => setCur(i)} style={{ flex: 1, height: 4, borderRadius: 2, cursor: "pointer", background: i === cur ? "#E8590C" : answers[session.questions[i].id]?.trim() ? "#2E7D32" : "#ddd" }} />)}</div>
    <div style={S.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={S.qt}>問{cur + 1}/{total}</span>
        <span style={{ fontSize: 12, color: "#999" }}>{q.title}</span>
      </div>
      <p style={S.qtext}>{q.question}</p>
      <textarea value={answers[q.id] || ""} onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))} placeholder="" style={S.ta} />
      <div style={{ textAlign: "right", fontSize: 11, color: "#999", marginTop: 4 }}>{cc}文字</div>
    </div>
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>{cur > 0 && <button style={{ ...S.btnG, flex: 1 }} onClick={() => setCur(cur - 1)}>← 前</button>}{cur < total - 1 ? <button style={{ ...S.btnD, flex: 1 }} onClick={() => setCur(cur + 1)}>次 →</button> : <button style={{ ...S.btnO, flex: 1 }} onClick={submit}>提出して採点 ✓</button>}</div>
  </div>;
}

function DonePage({ user, session, rec, onBack }) {
  if (!rec) return null;
  const scoring = rec.scoring || {};
  const hasScoring = Object.keys(scoring).length > 0;
  const total = hasScoring ? Object.values(scoring).reduce((a, v) => a + (v?.score || 0), 0) : null;
  const max = session.totalScore || session.questions.length * 10;
  return <div style={S.pw} className="fade">
    <div style={{ textAlign: "center", marginBottom: 20 }}>
      {total !== null ? <>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{total >= max * 0.8 ? "🏆" : total >= max * 0.6 ? "✅" : "📝"}</div>
        <h2 style={{ fontSize: 22, color: "#1A1A2E", marginBottom: 4 }}>{user} さんの得点</h2>
        <div style={{ fontSize: 48, fontWeight: 700, color: "#E8590C", margin: "8px 0" }}>{total}</div>
        <div style={{ fontSize: 16, color: "#999" }}>/ {max} 点</div>
      </> : <>
        <div style={{ fontSize: 56, marginBottom: 8 }}>✅</div>
        <h2 style={{ fontSize: 20, color: "#1A1A2E" }}>{user} さん、提出完了！</h2>
      </>}
    </div>
    {session.questions.map(q => {
      const val = rec.answers?.[q.id];
      const model = session.modelAnswers?.[q.id];
      const sc = scoring[q.id];
      const cl = (val || "").length;
      const bp = sc && !sc.is_off_topic && q.scoringMode === "理解型（文字量あり）" ? (cl >= 150 ? 3 : cl >= 100 ? 2 : cl >= 50 ? 1 : 0) : 0;
      return <div key={q.id} style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A2E" }}>{q.title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {sc != null ? <span style={{ fontSize: 18, fontWeight: 700, color: sc.score >= 8 ? "#2E7D32" : sc.score >= 5 ? "#E8590C" : "#c00" }}>{sc.score}</span> : <span style={{ fontSize: 14, color: "#ccc" }}>-</span>}
            <span style={{ fontSize: 12, color: "#999" }}>/ {q.maxScore}</span>
          </div>
        </div>
        {sc && <div style={{ display: "flex", gap: 6, marginBottom: 6, fontSize: 11, flexWrap: "wrap" }}>
          {sc.is_off_topic && <span style={{ background: "#c00", color: "#fff", padding: "2px 8px", borderRadius: 4 }}>的外れ</span>}
          {!sc.is_off_topic && bp > 0 && <span style={{ background: "#2E7D32", color: "#fff", padding: "2px 8px", borderRadius: 4 }}>文字量ボーナス +{bp}点</span>}
          {sc.comment && <span style={{ color: "#666" }}>💬 {sc.comment}</span>}
        </div>}
        <div style={S.ab}>{val || "(未記入)"}</div>
        {val && <div style={{ textAlign: "right", fontSize: 11, color: "#999", marginTop: 4 }}>{cl}文字</div>}
        {model && <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: "#E8590C", fontWeight: 700, marginBottom: 4 }}>模範解答</div>
          <div style={{ ...S.ab, background: "#FEF3EC", fontSize: 12 }}>{model}</div>
        </div>}
      </div>;
    })}
    <button style={S.btnG} onClick={onBack}>テスト一覧に戻る</button>
  </div>;
}

function RankingPage({ data, cfg, onBack }) {
  const [selSId, setSelSId] = useState((cfg.sessions || [])[0]?.id);
  const session = (cfg.sessions || []).find(s => s.id === selSId);
  const max = session?.totalScore || (session?.questions.length || 0) * 10;
  const ranked = (cfg.members || []).map(name => {
    const rec = data[name]?.[selSId];
    if (!rec) return { name, total: null, submitted: false };
    const sc = rec.scoring;
    const tot = sc ? Object.values(sc).reduce((a, v) => a + (v?.score || 0), 0) : null;
    return { name, total: tot, submitted: !!rec.submittedAt };
  }).filter(r => r.submitted).sort((a, b) => (b.total || 0) - (a.total || 0));
  const sm = {}; ranked.forEach(r => { if (r.total !== null) sm[r.name] = r.total; });
  const hm = calcHensa(sm) || {};
  const avg = ranked.filter(r => r.total !== null).length > 0
    ? Math.round(ranked.filter(r => r.total !== null).reduce((a, r) => a + r.total, 0) / ranked.filter(r => r.total !== null).length)
    : null;
  return <div style={S.pw} className="fade">
    <button style={{ ...S.btnSG, marginBottom: 12 }} onClick={onBack}>← 戻る</button>
    <div style={{ ...S.lb, marginBottom: 12, borderRadius: 12 }}>
      <div style={S.ls}>得点ランキング</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>🏆 {session?.title}</div>
      <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>満点 {max}点</div>
    </div>
    <div style={{ display: "flex", gap: 4, marginBottom: 16, overflowX: "auto" }}>
      {(cfg.sessions || []).map(s => <button key={s.id} onClick={() => setSelSId(s.id)} style={{ ...S.btnSG, whiteSpace: "nowrap", ...(selSId === s.id ? { background: "#E8590C", color: "#fff" } : {}) }}>{s.date}</button>)}
    </div>
    {ranked.length === 0 && <div style={{ ...S.card, textAlign: "center" }}><p style={S.sub}>採点済みデータがありません</p></div>}
    {ranked.map((r, i) => <div key={r.name} style={{ ...S.card, borderLeft: i === 0 ? "4px solid #FFD700" : i === 1 ? "4px solid #C0C0C0" : i === 2 ? "4px solid #CD7F32" : "4px solid #eee" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 24, width: 32, textAlign: "center" }}>{["🥇", "🥈", "🥉"][i] || String(i + 1)}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>{r.name}</div>
          <div style={{ marginTop: 6, background: "#eee", borderRadius: 4, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${r.total !== null ? Math.round(r.total / max * 100) : 0}%`, height: "100%", background: i === 0 ? "#E8590C" : "#1A1A2E", borderRadius: 4 }} />
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          {r.total !== null ? <span style={{ fontSize: 22, fontWeight: 700, color: "#E8590C" }}>{r.total}</span> : <span style={{ fontSize: 14, color: "#ccc" }}>未採点</span>}
          <div style={{ fontSize: 11, color: "#999" }}>/{max}点</div>
          {hm[r.name] != null && <div style={{ fontSize: 12, fontWeight: 700, color: "#666", marginTop: 2 }}>偏差値 {hm[r.name]}</div>}
        </div>
      </div>
    </div>)}
    {avg !== null && <div style={{ ...S.card, textAlign: "center", marginTop: 8 }}>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>クラス平均</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#1A1A2E" }}>{avg}</div>
      <div style={{ fontSize: 12, color: "#999" }}>/ {max} 点</div>
    </div>}
  </div>;
}

function AdminPage({ data, cfg, onBack, updateData, updateCfg, onShowRanking, skey, isCollege }) {
  const [tab, setTab] = useState("results");
  const [selSId, setSelSId] = useState((cfg.sessions || [])[0]?.id);
  const [detail, setDetail] = useState(null);
  const [delConf, setDelConf] = useState(null);
  const [newName, setNewName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [gasLoading, setGasLoading] = useState(false);
  const [gasMsg, setGasMsg] = useState("");
  const [tf, setTf] = useState({ title: "", date: "", questions: [{ title: "", question: "", model: "", maxScore: 10, scoringMode: "理解型（文字量なし）" }] });
  const session = (cfg.sessions || []).find(s => s.id === selSId);
  const entries = Object.entries(data).filter(([_, v]) => v[selSId]?.submittedAt);
  const max = session?.totalScore || (session?.questions.length || 0) * 10;
  const scores = {};
  entries.forEach(([name, v]) => { const sc = v[selSId]?.scoring; if (sc) scores[name] = Object.values(sc).reduce((a, v) => a + (v?.score || 0), 0); });
  const hensa = calcHensa(scores) || {};
  const addMember = () => { if (!newName.trim()) return; updateCfg({ ...cfg, members: [...cfg.members, newName.trim()] }); setNewName(""); };
  const remMember = n => updateCfg({ ...cfg, members: cfg.members.filter(m => m !== n) });
  const delAnswer = (n, sid) => { const d = dbLoad(skey); if (d[n]) { delete d[n][sid]; if (!Object.keys(d[n]).length) delete d[n]; } updateData(d); setDetail(null); setDelConf(null); };
  const addTest = () => {
    if (!tf.title || !tf.date || tf.questions.some(q => !q.title || !q.question)) return;
    const id = "test_" + Date.now(); const ma = {};
    const qs = tf.questions.map((q, i) => { const qid = "q" + i + "_" + id; ma[qid] = q.model; return { id: qid, title: q.title, question: q.question, maxScore: q.maxScore || 10, scoringMode: q.scoringMode || "理解型（文字量なし）" }; });
    const ts = qs.reduce((a, q) => a + (q.maxScore || 10), 0);
    updateCfg({ ...cfg, sessions: [...(cfg.sessions || []), { id, title: tf.title, date: tf.date, totalScore: ts, modelAnswers: ma, questions: qs }] });
    setTf({ title: "", date: "", questions: [{ title: "", question: "", model: "", maxScore: 10, scoringMode: "理解型（文字量なし）" }] });
    setShowAdd(false); setSelSId(id);
  };
  const remTest = sid => { const c = { ...cfg, sessions: (cfg.sessions || []).filter(s => s.id !== sid) }; updateCfg(c); if (selSId === sid && c.sessions.length > 0) setSelSId(c.sessions[0].id); };
  const syncFromGAS = async () => {
    setGasLoading(true); setGasMsg("GASからデータを読み込み中...");
    const gasData = await loadFromGAS();
    if (gasData) {
      const local = dbLoad(skey);
      Object.entries(gasData).forEach(([name, sessions]) => {
        if (!local[name]) local[name] = {};
        Object.entries(sessions).forEach(([sid, rec]) => { if (!local[name][sid] || rec.submittedAt > (local[name][sid].submittedAt || "")) local[name][sid] = rec; });
      });
      dbSave(local, skey); updateData(local); setGasMsg("✅ 読み込み完了！最新データに更新しました");
    } else { setGasMsg("❌ 読み込み失敗。時間をおいて再試行してください"); }
    setGasLoading(false); setTimeout(() => setGasMsg(""), 4000);
  };

  if (delConf) return <div style={S.cw}><div style={{ ...S.card, maxWidth: 340, width: "100%" }}>
    <p style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E", marginBottom: 8 }}>回答を削除しますか？</p>
    <p style={{ ...S.sub, marginBottom: 16 }}>{delConf.name}さんの回答を削除します。</p>
    <button style={{ ...S.btnO, marginBottom: 8 }} onClick={() => delAnswer(delConf.name, selSId)}>削除する</button>
    <button style={S.btnG} onClick={() => setDelConf(null)}>キャンセル</button>
  </div></div>;

  if (detail) {
    const rec = data[detail]?.[selSId];
    if (!rec) { setDetail(null); return null; }
    const scoring = rec.scoring || {};
    const ts = Object.keys(scoring).length > 0 ? Object.values(scoring).reduce((a, v) => a + (v?.score || 0), 0) : null;
    return <div style={S.pw} className="fade">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <button style={S.btnSG} onClick={() => setDetail(null)}>← 戻る</button>
        <button style={{ ...S.btnSG, color: "#c00" }} onClick={() => setDelConf({ name: detail })}>🗑 削除</button>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginBottom: 4 }}>{detail}</h2>
      {ts !== null && <div style={{ ...S.card, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 36, fontWeight: 700, color: "#E8590C" }}>{ts}</span>
        <span style={{ fontSize: 16, color: "#999" }}>/ {max} 点</span>
        {hensa[detail] != null && <span style={{ fontSize: 14, fontWeight: 700, color: "#666", marginLeft: 8 }}>偏差値 {hensa[detail]}</span>}
      </div>}
      {session?.questions.map(q => {
        const sc = scoring[q.id]; const val = rec.answers?.[q.id]; const cl = (val || "").length;
        const bp = sc && !sc.is_off_topic && q.scoringMode === "理解型（文字量あり）" ? (cl >= 150 ? 3 : cl >= 100 ? 2 : cl >= 50 ? 1 : 0) : 0;
        return <div key={q.id} style={S.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#1A1A2E" }}>{q.title}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {sc != null ? <span style={{ fontSize: 18, fontWeight: 700, color: sc.score >= 8 ? "#2E7D32" : sc.score >= 5 ? "#E8590C" : "#c00" }}>{sc.score}</span> : <span style={{ fontSize: 14, color: "#ccc" }}>-</span>}
              <span style={{ fontSize: 11, color: "#999" }}>/{q.maxScore}</span>
            </div>
          </div>
          {sc && <div style={{ display: "flex", gap: 6, marginBottom: 6, fontSize: 11, flexWrap: "wrap" }}>
            {sc.is_off_topic && <span style={{ background: "#c00", color: "#fff", padding: "2px 8px", borderRadius: 4 }}>的外れ</span>}
            {!sc.is_off_topic && bp > 0 && <span style={{ background: "#2E7D32", color: "#fff", padding: "2px 8px", borderRadius: 4 }}>文字量ボーナス +{bp}点</span>}
            {sc.comment && <span style={{ color: "#666" }}>💬 {sc.comment}</span>}
          </div>}
          <div style={S.ab}>{val || "(未記入)"}</div>
          {val && <div style={{ textAlign: "right", fontSize: 11, color: "#999", marginTop: 4 }}>{cl}文字</div>}
          {session.modelAnswers?.[q.id] && <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 11, color: "#E8590C", fontWeight: 700, marginBottom: 4 }}>模範解答</div>
            <div style={{ ...S.ab, background: "#FEF3EC", fontSize: 12 }}>{session.modelAnswers[q.id]}</div>
          </div>}
        </div>;
      })}
    </div>;
  }

  return <div style={S.pw} className="fade">
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E" }}>管理者画面</h2>
      <div style={{ display: "flex", gap: 6 }}>
        <button style={S.btnSO} onClick={onShowRanking}>🏆 順位</button>
        <button style={S.btnSG} onClick={onBack}>戻る</button>
      </div>
    </div>
    <div style={{ display: "flex", borderBottom: "2px solid #eee", marginBottom: 16 }}>
      {[["results", "回答確認"], ["members", "メンバー管理"], ["tests", "テスト管理"]].map(([k, v]) => <div key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "10px 0", textAlign: "center", fontSize: 13, fontWeight: 700, cursor: "pointer", color: tab === k ? "#E8590C" : "#999", borderBottom: tab === k ? "3px solid #E8590C" : "3px solid transparent" }}>{v}</div>)}
    </div>
    {tab === "results" && <>
      <button style={{ ...S.btnO, marginBottom: 12 }} onClick={syncFromGAS} disabled={gasLoading}>{gasLoading ? "読み込み中..." : "☁️ GASから最新データを読み込む"}</button>
      {gasMsg && <div style={{ ...S.card, background: gasMsg.startsWith("✅") ? "#E8F5E9" : "#FFEBEE", marginBottom: 8, fontSize: 13, fontWeight: 700, color: gasMsg.startsWith("✅") ? "#2E7D32" : "#c00" }}>{gasMsg}</div>}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, overflowX: "auto" }}>
        {(cfg.sessions || []).map(s => <button key={s.id} onClick={() => setSelSId(s.id)} style={{ ...S.btnSG, whiteSpace: "nowrap", ...(selSId === s.id ? { background: "#E8590C", color: "#fff" } : {}) }}>{s.date}</button>)}
      </div>
      <div style={{ ...S.card, display: "flex", justifyContent: "space-around", textAlign: "center", marginBottom: 8 }}>
        <div><div style={{ fontSize: 28, fontWeight: 700, color: "#1A1A2E" }}>{entries.length}</div><div style={S.sub}>提出数</div></div>
        <div><div style={{ fontSize: 28, fontWeight: 700, color: "#E8590C" }}>{(cfg.members || []).length}</div><div style={S.sub}>受験者数</div></div>
        <div><div style={{ fontSize: 28, fontWeight: 700, color: "#2E7D32" }}>{entries.filter(([_, v]) => v[selSId]?.scoring).length}</div><div style={S.sub}>採点済</div></div>
      </div>
      {entries.length === 0 && <div style={{ ...S.card, textAlign: "center" }}><p style={S.sub}>まだ回答がありません</p></div>}
      {entries.map(([name, v]) => {
        const rec = v[selSId]; const sc = rec?.scoring;
        const tot = sc ? Object.values(sc).reduce((a, v) => a + (v?.score || 0), 0) : null;
        return { name, rec, tot };
      }).sort((a, b) => (b.tot || 0) - (a.tot || 0)).map(({ name, rec, tot }, i) => <div key={name} style={{ ...S.card, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} onClick={() => setDetail(name)}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, width: 28 }}>{["🥇", "🥈", "🥉"][i] || ""}</span>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>{name}</div>
          </div>
          <div style={{ fontSize: 11, color: "#999" }}>{new Date(rec.submittedAt).toLocaleString("ja-JP")}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ textAlign: "right" }}>
            {tot !== null ? <span style={{ fontSize: 18, fontWeight: 700, color: "#E8590C" }}>{tot}/{max}</span> : <span style={{ ...S.tagO, fontSize: 11 }}>未採点</span>}
            {hensa[name] != null && <div style={{ fontSize: 11, fontWeight: 700, color: "#666" }}>偏差値 {hensa[name]}</div>}
          </div>
          <span style={{ fontSize: 18, color: "#ccc" }}>›</span>
        </div>
      </div>)}
    </>}
    {tab === "members" && <>
      <div style={S.card}>
        <label style={S.label}>新しい名前を追加</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="例：山田太郎" style={{ ...S.input, flex: 1 }} onKeyDown={e => e.key === "Enter" && addMember()} />
          <button style={S.btnSO} onClick={addMember}>追加</button>
        </div>
      </div>
      <div style={{ fontSize: 13, color: "#999", marginBottom: 8 }}>{(cfg.members || []).length}名登録中</div>
      {(cfg.members || []).map(name => <div key={name} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>{name}</span>
        <button onClick={() => remMember(name)} style={{ background: "none", border: "1px solid #ddd", borderRadius: 6, padding: "4px 12px", fontSize: 12, color: "#c00", cursor: "pointer" }}>削除</button>
      </div>)}
    </>}
    {tab === "tests" && <>
      <button style={{ ...S.btnO, marginBottom: 16 }} onClick={() => setShowAdd(!showAdd)}>{showAdd ? "▾ 入力フォームを閉じる" : "＋ 新しいテストを作成"}</button>
      {showAdd && <div style={{ ...S.card, borderLeft: "4px solid #E8590C" }}>
        <label style={S.label}>テストタイトル</label>
        <input value={tf.title} onChange={e => setTf(f => ({ ...f, title: e.target.value }))} placeholder="例：復習テスト① 月次決算書" style={{ ...S.input, marginBottom: 12 }} />
        <label style={S.label}>実施日</label>
        <input value={tf.date} onChange={e => setTf(f => ({ ...f, date: e.target.value }))} placeholder="例：2026/5/10" style={{ ...S.input, marginBottom: 12 }} />
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E", margin: "8px 0" }}>問題（{tf.questions.length}問）</div>
        {tf.questions.map((q, i) => <div key={i} style={{ ...S.card, background: "#F9F7F4", marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: "#E8590C", fontWeight: 700, marginBottom: 8 }}>問{i + 1}</div>
          <input value={q.title} onChange={e => setTf(f => ({ ...f, questions: f.questions.map((qq, j) => j === i ? { ...qq, title: e.target.value } : qq) }))} placeholder="問いのタイトル" style={{ ...S.input, marginBottom: 8, fontSize: 14 }} />
          <textarea value={q.question} onChange={e => setTf(f => ({ ...f, questions: f.questions.map((qq, j) => j === i ? { ...qq, question: e.target.value } : qq) }))} placeholder="問題文" style={{ ...S.ta, minHeight: 60, marginBottom: 8 }} />
          <textarea value={q.model} onChange={e => setTf(f => ({ ...f, questions: f.questions.map((qq, j) => j === i ? { ...qq, model: e.target.value } : qq) }))} placeholder="模範解答（採点の基準になります）" style={{ ...S.ta, minHeight: 60, background: "#FEF3EC", marginBottom: 8 }} />
          <label style={{ fontSize: 12, fontWeight: 700, color: "#1A1A2E", marginBottom: 4, display: "block" }}>採点モード</label>
          <select value={q.scoringMode || "理解型（文字量なし）"} onChange={e => setTf(f => ({ ...f, questions: f.questions.map((qq, j) => j === i ? { ...qq, scoringMode: e.target.value } : qq) }))} style={{ ...S.input, fontSize: 13, marginBottom: 8 }}>
            <option value="暗記型">暗記型（キーワードが合っていれば高得点）</option>
            <option value="理解型（文字量あり）">理解型・文字量あり（趣旨＋文字量で高得点）</option>
            <option value="理解型（文字量なし）">理解型・文字量なし（趣旨が合えば短くてもOK）</option>
          </select>
          {i > 0 && <button onClick={() => setTf(f => ({ ...f, questions: f.questions.filter((_, j) => j !== i) }))} style={{ background: "none", border: "none", color: "#c00", fontSize: 12, cursor: "pointer", marginTop: 4 }}>この問いを削除</button>}
        </div>)}
        <button onClick={() => setTf(f => ({ ...f, questions: [...f.questions, { title: "", question: "", model: "", maxScore: 10, scoringMode: "理解型（文字量なし）" }] }))} style={{ ...S.btnG, marginBottom: 12 }}>＋ 問いを追加</button>
        <button onClick={addTest} style={S.btnO}>テストを作成して保存</button>
      </div>}
      <div style={{ fontSize: 13, color: "#999", marginBottom: 8, marginTop: 8 }}>登録済みテスト {(cfg.sessions || []).length}件</div>
      {(cfg.sessions || []).map(s => <div key={s.id} style={{ ...S.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E" }}>{s.title}</div>
          <div style={{ fontSize: 12, color: "#999" }}>{s.date} ｜ {s.questions.length}問 ｜ 満点{s.totalScore}点</div>
        </div>
        {s.id !== "test_0409" && s.id !== "test_0413" && s.id !== "college_0413" && <button onClick={() => remTest(s.id)} style={{ background: "none", border: "1px solid #ddd", borderRadius: 6, padding: "4px 12px", fontSize: 12, color: "#c00", cursor: "pointer" }}>削除</button>}
      </div>)}
    </>}
  </div>;
}

const S = {
  cw: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", padding: 20, background: "#F5F3EF", flexDirection: "column" },
  spin: { width: 32, height: 32, borderRadius: "50%", border: "3px solid #E8590C", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" },
  pw: { maxWidth: 560, margin: "0 auto", padding: "16px 16px 60px" },
  lb: { background: "#1A1A2E", color: "#fff", borderRadius: 16, padding: "28px 20px", marginBottom: 20, textAlign: "center" },
  ls: { fontSize: 11, color: "#E8590C", fontWeight: 700, letterSpacing: 2, marginBottom: 4 },
  lm: { fontSize: 22, fontWeight: 700 },
  ld: { fontSize: 12, color: "#999", marginTop: 8 },
  al: { display: "block", margin: "12px auto 0", background: "none", border: "none", color: "#999", fontSize: 12, cursor: "pointer", textDecoration: "underline" },
  hdr: { background: "#1A1A2E", color: "#fff", borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" },
  hs: { fontSize: 11, color: "#E8590C", fontWeight: 700, marginBottom: 2 },
  card: { background: "#fff", borderRadius: 12, padding: 16, marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  label: { fontSize: 14, fontWeight: 700, color: "#1A1A2E", marginBottom: 8, display: "block" },
  sub: { fontSize: 13, color: "#999", lineHeight: 1.6 },
  input: { width: "100%", padding: 14, border: "2px solid #ddd", borderRadius: 10, fontSize: 15, fontFamily: "inherit" },
  ta: { width: "100%", minHeight: 160, border: "2px solid #ddd", borderRadius: 10, padding: 12, fontSize: 14, resize: "vertical", lineHeight: 1.8, marginTop: 4, fontFamily: "inherit" },
  ab: { background: "#F9F7F4", borderRadius: 8, padding: 12, fontSize: 13, lineHeight: 1.8, color: "#333", whiteSpace: "pre-wrap", wordBreak: "break-word" },
  btnO: { display: "block", width: "100%", padding: 14, background: "#E8590C", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  btnD: { display: "block", width: "100%", padding: 14, background: "#1A1A2E", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  btnG: { display: "block", width: "100%", padding: 14, background: "#E8E8E8", color: "#333", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" },
  btnSO: { padding: "8px 16px", background: "#E8590C", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" },
  btnSG: { padding: "8px 16px", background: "#E8E8E8", color: "#333", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" },
  tagO: { display: "inline-block", background: "#E8590C", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4 },
  tagG: { display: "inline-block", background: "#2E7D32", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 4 },
  sc: { background: "#fff", borderRadius: 12, padding: 16, marginBottom: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", cursor: "pointer", border: "1px solid #eee" },
  qt: { display: "inline-block", background: "#E8590C", color: "#fff", fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 4 },
  qtext: { fontSize: 16, fontWeight: 700, color: "#1A1A2E", lineHeight: 1.7, whiteSpace: "pre-wrap", marginTop: 8 },
};
