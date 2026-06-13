import type { GraphVariant } from "@/components/GraphCanvas";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Bullet  { icon: string; text: string; }
export interface Step    { label: string; body: string; formula?: string; }
export interface LessonQuizQ {
  text: string; options: [string,string,string,string]; correct: 0|1|2|3;
  explanation: string; xp: number;
}
export interface HintContent { title: string; body: string; formula: string; }
export interface HoverHintToken { match: string; hint: HintContent; }
export type SliderKey = "a" | "b" | "h" | "k" | "angle" | "n";

export interface BuildPiece { id: string; label: string; desc?: string; color?: string; }
export interface ScaffoldStep { question: string; options: [string,string,string]; correct: 0|1|2; hint: string; }

export type Slide =
  | { type:"intro";       emoji:string; title:string; subtitle:string; body:string; xp:number; duration:string; questions:number; whyMatters?:string; willLearn?:string[]; tip?:string }
  | { type:"concept";     title:string; body:string; formula?:string; bullets:Bullet[] }
  | { type:"interactive"; title:string; body:string; graphType?:GraphVariant; sliders:SliderKey[]; initA?:number; initB?:number; initH?:number; initK?:number; initAngle?:number; initN?:number }
  | { type:"predict";     question:string; base?:string; answer?:string; options:[string,string,string,string]; correct:0|1|2|3; explanation:string; tokens?:HoverHintToken[] }
  | { type:"build";       target:string; pieces:BuildPiece[]; correctOrder:string[] }
  | { type:"scaffold";    problem:string; steps:ScaffoldStep[]; tokens?:HoverHintToken[] }
  | { type:"quiz";        q:LessonQuizQ; tokens?:HoverHintToken[] }
  | { type:"worked";          problem:string; steps:Step[] }
  | { type:"complete";        xp:number; nextId?:string; nextTitle?:string }
  | { type:"story_animation"; badge:string; title:string; body:string; tip:string }
  | { type:"slope_explorer";  badge:string; title:string; body:string }
  | { type:"playground";      badge:string; title:string; body:string };

export interface Lesson {
  id:string; title:string; desc:string; levelColor:string; levelName:string;
  totalXp:number; duration:string; slides:Slide[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const bullet = (icon:string, text:string): Bullet => ({ icon, text });
const step   = (label:string, body:string, formula?:string): Step => ({ label, body, formula });
const q = (text:string, options:[string,string,string,string], correct:0|1|2|3, explanation:string, xp=20): Slide =>
  ({ type:"quiz", q:{ text, options, correct, explanation, xp } });
const pred = (question:string, options:[string,string,string,string], correct:0|1|2|3, explanation:string, base?:string, answer?:string): Slide =>
  ({ type:"predict", question, options, correct, explanation, base, answer });
const build = (target:string, pieces:BuildPiece[], correctOrder:string[]): Slide =>
  ({ type:"build", target, pieces, correctOrder });
const scaff = (problem:string, steps:ScaffoldStep[]): Slide =>
  ({ type:"scaffold", problem, steps });

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE 11 — MODULE 1: ФУНКЦ БА ГРАФИК (#7F77DD)
// ═══════════════════════════════════════════════════════════════════════════════

const fn1: Lesson = {
  id:"fn-1", title:"Квадрат функц", desc:"Параболын стандарт хэлбэр, оройн цэг, нарийсалт",
  levelColor:"#7F77DD", levelName:"11-р анги · Функц", totalXp:100, duration:"10 мин",
  slides:[
    { type:"intro", emoji:"📐", title:"Квадрат функц", subtitle:"11-р анги · Функц",
      body:"y = a(x−h)² + k томьёо нь параболын байршил ба хэлбэрийг бүрэн тодорхойлдог.", xp:100, duration:"10 мин", questions:4,
      whyMatters:"Квадрат функц нь физикийн хөдөлгөөн, эдийн засгийн оновчлол, инженерчлэлийн тооцоонд өргөн хэрэглэгддэг. ЭЕШ-ийн математикийн шалгалтад заавал орох сэдэв.",
      willLearn:["a, h, k параметрүүд графикт хэрхэн нөлөөлдгийг ойлгох","Параболын оройн цэг болон тэгхэн тэнхлэгийг олох","Квадрат функцийг стандарт хэлбэрт шилжүүлэх"],
      tip:"💡 Зөвлөгөө: Слайдерийг аль болох их хөдөлгөж туршаарай — тоогоор цээжлэхгүйгээр дүрслэлээр ойлгох нь хамаагүй хурдан." },
    { type:"concept", title:"Стандарт хэлбэр", body:"Гурван коэффициент параболын бүх шинжийг тодорхойлно.", formula:"y = a(x − h)² + k",
      bullets:[ bullet("📐","a — нарийсалт, чиглэл"), bullet("📍","h — хэвтээ шилжилт (орой x)"), bullet("📊","k — босоо шилжилт (орой y)"), bullet("⭕","Орой: (h, k)") ] },
    pred("y=x² дээд +2 нэмэхэд юу болох вэ?",
      ["дээш шилжинэ","доош шилжинэ","өргөн болно","нарийн болно"], 0,
      "k нэмэх нь параболыг босоо чиглэлд шилжүүлнэ", "x^2", "x^2+2"),
    { type:"interactive", title:"a, h, k утгуудыг турших", body:"Гулгуурыг ашиглан параболын хэлбэр, байршлыг өөрчилцгөөе.",
      graphType:"quadratic", sliders:["a","h","k"], initA:1, initH:0, initK:0 },
    pred("a=−1 болгох үед юу болох вэ?",
      ["доош эргэнэ","дээш үлдэнэ","хажуу тийш шилжинэ","тэлэгдэнэ"], 0,
      "a<0 үед парабол доош эргэж ∩ хэлбэртэй болно", "x^2", "-x^2"),
    build("y = a(x−h)² + k",
      [{id:"a",label:"a",desc:"тэлэлт",color:"#7F77DD"},{id:"xh",label:"(x−h)²",desc:"хэлбэр",color:"#1D9E75"},{id:"k",label:"+ k",desc:"босоо",color:"#D85A30"}],
      ["a","xh","k"]),
    { type:"scaffold", problem:"y = 2(x−3)² + 1",
      steps:[
       {question:"a юу вэ?",options:["1","2","3"],correct:1,hint:"коэффициент a=2"},
       {question:"h юу вэ?",options:["1","2","3"],correct:2,hint:"(x−h) дахь h=3"},
       {question:"Оройн цэг?",options:["(2,1)","(3,1)","(1,3)"],correct:1,hint:"орой=(h,k)=(3,1)"}],
      tokens:[
       { match:"2", hint:{ title:"a коэффициент", body:"a=2 нь параболыг 2 дахин нарийсгана. a>0 тул дээш нээгдэнэ, |a|>1 тул нарийн.", formula:"a=2 → дээш ∪, нарийн" } },
       { match:"(x−3)²", hint:{ title:"h — хэвтээ шилжилт", body:"(x−h)² дахь h=3. Параболын оройн x-координат нь h=3.", formula:"h=3 → орой x=3" } },
       { match:"+ 1", hint:{ title:"k — босоо шилжилт", body:"k=1 нь параболыг 1 нэгж дээш шилжүүлнэ. Оройн y-координат нь k=1.", formula:"k=1 → орой y=1" } },
      ] },
    { type:"quiz", q:{ text:"a=−2 үед парабол ямар харагдах вэ?", options:["доош нарийн","дээш өргөн","доош өргөн","дээш нарийн"], correct:0, explanation:"a=−2: сөрөг тул доош, |a|=2>1 тул нарийн", xp:20 },
      tokens:[
       { match:"a=−2", hint:{ title:"a=−2: хоёр дүрэм давхцаж байна", body:"a<0 тул парабол доош ∩ хэлбэр; |a|=2>1 тул нарийн. Нэгэн зэрэг хоёр шинж хэрэглэгдэнэ.", formula:"a=−2 → ∩ хэлбэр + нарийн" } },
      ] },
    { type:"complete", xp:100, nextId:"fn-2", nextTitle:"Шугаман функц" },
  ],
};

const fn2: Lesson = {
  id:"fn-2", title:"Шугаман функц", desc:"Налуу ба y-тэнхлэгтэй огтлолцол",
  levelColor:"#7F77DD", levelName:"11-р анги · Функц", totalXp:80, duration:"8 мин",
  slides:[
    { type:"story_animation",
      badge:"🚕 БОДИТ АМЬДРАЛ ДЭЭР",
      title:"Такси хөлслөх бүрд чи шугаман функц 'уншдаг'",
      body:"УБ-ын такси: суухад 1000₮, км тутамд 1500₮ нэмэгдэнэ. Энэ бол яг шугаман функц:",
      tip:"💡 Цалин, утасны төлбөр, гэрэл цахилгааны тариф — амьдралын ихэнх тооцоо шугаман функц байдаг." },
    { type:"slope_explorer",
      badge:"⛰️ НАЛУУГ МЭДЭР",
      title:"Налуу (m) гэж юу вэ?",
      body:"Уулын зам шиг — зарим нь эгц, зарим нь налуу, зарим нь уруудна. Шугам бүр дээр дарж хараарай:" },
    { type:"playground",
      badge:"🎮 ӨӨРӨӨ ТУРШИЖ ҮЗ",
      title:"Өөрийн шулуунаа бүтээ",
      body:"m ба b-г өөрчилж шулуун хэрхэн хувирахыг мэдэр:" },
    { type:"concept", title:"Налуу ба огтлолцол", body:"a ба b хоёр параметр шулуунийг бүрэн тодорхойлно.", formula:"y = ax + b",
      bullets:[ bullet("📈","a > 0 → өсөх"), bullet("📉","a < 0 → буурах"), bullet("➡️","a = 0 → тогтмол"), bullet("📍","b: y-тэнхлэгтэй огтлол") ] },
    pred("a=2 болгох үед юу болох вэ?",
      ["налуу эрс болно","налуу хавтгай болно","дээш шилжинэ","доош шилжинэ"], 0,
      "|a| ихсэх тусам шулуун босоо руу ойртоно", "x", "2*x"),
    { type:"interactive", title:"a ба b утгуудыг турших", body:"a налуу, b y-огтлолыг өөрчилцгөөе.",
      graphType:"linear", sliders:["a","b"], initA:1, initB:0 },
    pred("b=3 болгох үед юу болох вэ?",
      ["дээш шилжинэ","баруун тийш","налуу нэмэгдэнэ","өргөн болно"], 0,
      "b нь y-тэнхлэгтэй огтлолцох цэгийг шилжүүлнэ", "x", "x+3"),
    { type:"scaffold", problem:"y = −2x + 4",
      steps:[
       {question:"Налуу a?",options:["2","−2","4"],correct:1,hint:"a=−2, сөрөг тул буурах"},
       {question:"y-огтлол b?",options:["−2","2","4"],correct:2,hint:"b=4, x=0 үед y=4"},
       {question:"x-огтлол?",options:["2","4","−2"],correct:0,hint:"0=−2x+4 → x=2"}],
      tokens:[
       { match:"−2", hint:{ title:"Налуу a = −2", body:"a=−2: сөрөг тул шулуун баруунаас зүүн тийш буурна. |a|=2>1 тул эрс налуу.", formula:"a<0 → буурах, |a|>1 → эрс" } },
       { match:"+ 4", hint:{ title:"y-огтлол b = 4", body:"b=4: x=0 үед y=4. Шулуун y-тэнхлэгийг (0, 4) цэгт огтолно.", formula:"x=0 → y=b=4" } },
      ] },
    q("a<0 үед шулуун яаж харагдах вэ?",
      ["баруунаас зүүн буурах","зүүнээс баруун өсөх","тогтмол","босоо"], 0,
      "a<0 бол баруунаас зүүн тийш буурна"),
    { type:"complete", xp:80, nextId:"fn-3", nextTitle:"Абсолют утга" },
  ],
};

const fn3: Lesson = {
  id:"fn-3", title:"Абсолют утга", desc:"V хэлбэрийн график, утгын муж",
  levelColor:"#7F77DD", levelName:"11-р анги · Функц", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"🔺", title:"Абсолют утга функц", subtitle:"11-р анги · Функц",
      body:"f(x) = a|x−h|+k нь V хэлбэрийн графиктай. Коэффициентүүд хэлбэр, байршлыг тодорхойлно.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Абсолют утга нь зай, хазайлт, алдааг хэмжихэд хэрэглэгддэг. ЭЕШ-д тогтмол гарах сэдэв бөгөөд бодит амьдралд өргөн хэрэглэгддэг.",
      willLearn:["V хэлбэрийн график яагаад үүсдэгийг ойлгох","Оройн цэг (h,k)-г олох","a параметрийн нөлөөг графикаар харах"],
      tip:"💡 Зөвлөгөө: |x| нь 'x тэгээс хэр зайтай вэ?' гэсэн асуултад хариулдаг — зай үргэлж эерэг байдаг." },
    { type:"concept", title:"V хэлбэр яагаад үүсдэг?", body:"Абсолют утга сөрөг тоог эерэг болгодог тул x-тэнхлэгт тэгш хэмтэй.", formula:"f(x) = a|x − h| + k",
      bullets:[ bullet("📍","(h,k) оройн цэг"), bullet("🔄","a<0 → ∧ хэлбэр"), bullet("📐","|a|>1 нарийсна"), bullet("📊","Утгын муж: a>0 → y≥k") ] },
    { type:"predict", question:"|x| дээд +2 нэмэхэд юу болох вэ?",
      options:["дээш шилжинэ","баруун тийш","өргөн болно","нарийн болно"], correct:0,
      explanation:"k нэмэх нь V-ийг босоо чиглэлд шилжүүлнэ",
      base:"Math.abs(x)", answer:"Math.abs(x)+2",
      tokens:[
       { match:"|x|", hint:{ title:"Абсолют утга |x|", body:"x сөрөг байсан ч |x| үргэлж эерэг. '|x| нь x тэгээс хэр зайтай вэ?' гэсэн асуулт.", formula:"|x|=x(x≥0), |x|=−x(x<0)" } },
      ] },
    { type:"interactive", title:"a, h, k утгуудыг турших", body:"V-ийн хэлбэр, байршлыг гулгуураар тохируулцгаая.",
      graphType:"absolute", sliders:["a","h","k"], initA:1, initH:0, initK:0 },
    pred("a=−1 болгох үед юу болох вэ?",
      ["доош ∧ болно","дээш үлдэнэ","тэлэгдэнэ","шилжинэ"], 0,
      "a<0 үед V доош эргэж ∧ хэлбэртэй болно", "Math.abs(x)", "-Math.abs(x)"),
    { type:"scaffold", problem:"f(x) = 2|x + 1| − 3",
      steps:[
       {question:"h юу вэ?",options:["1","−1","3"],correct:1,hint:"(x+1)=(x−(−1)), h=−1"},
       {question:"k юу вэ?",options:["2","−3","1"],correct:1,hint:"k=−3, хамгийн бага утга"},
       {question:"Оройн цэг?",options:["(1,−3)","(−1,−3)","(−1,3)"],correct:1,hint:"орой=(h,k)=(−1,−3)"}],
      tokens:[
       { match:"2", hint:{ title:"a = 2 коэффициент", body:"a=2>0 тул V дээш нээгдэнэ. |a|=2>1 тул налуу нарийн.", formula:"a=2 → дээш ∨, нарийн" } },
       { match:"|x + 1|", hint:{ title:"h = −1 шилжилт", body:"|x+1|=|x−(−1)| тул h=−1. Оройн x-координат нь −1.", formula:"|x+1| → h=−1, орой x=−1" } },
       { match:"− 3", hint:{ title:"k = −3 хамгийн бага", body:"k=−3 тул оройн y-координат −3. a>0 тул энэ нь хамгийн бага утга.", formula:"k=−3 → орой y=−3" } },
      ] },
    q("f(x)=|x−4|+2 оройн цэг?",
      ["(4,2)","(−4,2)","(4,−2)","(2,4)"], 0,
      "h=4, k=2 тул орой (4,2)"),
    { type:"complete", xp:80, nextId:"g11-1-4", nextTitle:"Давхар функц" },
  ],
};

const g11_1_4: Lesson = {
  id:"g11-1-4", title:"Давхар функц", desc:"f(g(x)) нийлмэл функц, тэмдэглэл ба тооцоолол",
  levelColor:"#7F77DD", levelName:"11-р анги · Функц", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"🔗", title:"Давхар функц", subtitle:"11-р анги · Функц",
      body:"(f∘g)(x)=f(g(x)) — нэг функцийн үр дүнг нөгөөдөө оруулах үйлдэл.", xp:80, duration:"8 мин", questions:3,
      whyMatters:"Нийлмэл функц нь програм хангамж, шинжлэх ухааны нарийн хамаарлыг загварчлахад хэрэглэгддэг. Гинжин тооцооны суурь.",
      willLearn:["f∘g нотациыг унших, бичих","Нийлмэл функцийн утгыг алхам алхмаар тооцоолох","f∘g ба g∘f өөр байдгийг ойлгох"],
      tip:"💡 Зөвлөгөө: f(g(x)) бодохдоо 'дотроос гадагш' — эхлээд g(x), дараа f-д оруул." },
    { type:"concept", title:"Нийлмэл функц", body:"g(x) эхлээд тооцоологдоно, дараа f-д орно.", formula:"(f∘g)(x) = f(g(x))",
      bullets:[ bullet("1️⃣","Дотоод функц g(x) эхлээд"), bullet("2️⃣","Дараа f хэрэглэнэ"), bullet("📝","f∘g ≠ g∘f ерөнхийдөө"), bullet("🔗","тэмдэглэл: f∘g") ] },
    { type:"predict", question:"f(x)=x+1, g(x)=x². f(g(x)) юу вэ?",
      options:["x²+1","x+1²","x²·(x+1)","2x+1"], correct:0,
      explanation:"g(x)=x² эхлээд, дараа f(x²)=x²+1",
      tokens:[
       { match:"f(g(x))", hint:{ title:"Давхар функц f(g(x))", body:"Эхлээд g(x)=x² бод, дараа тэр дүнг f-д орлуул. Дотроос гадагш.", formula:"f(g(x))=f(x²)=x²+1" } },
      ] },
    { type:"interactive", title:"Нийлмэл функцийг харах", body:"g(x)=x²+1, f(x)=2x−1, f(g(x))=2x²+1 гурвыг харцгаая.",
      graphType:"composite", sliders:[], initA:1 },
    build("(f∘g)(x) = f(g(x))",
      [{id:"fog",label:"(f∘g)(x)",desc:"нийлмэл"},{id:"eq",label:"="},{id:"f",label:"f(",desc:"гадаад"},{id:"g",label:"g(x)",desc:"дотоод"},{id:"cp",label:")"}],
      ["fog","eq","f","g","cp"]),
    { type:"scaffold", problem:"f(x)=x²−1, g(x)=3x+2, (f∘g)(1)=?",
      steps:[
       {question:"g(1)=?",options:["3","5","7"],correct:1,hint:"g(1)=3(1)+2=5"},
       {question:"f(5)=?",options:["24","26","4"],correct:0,hint:"f(5)=5²−1=24"},
       {question:"(f∘g)(1)=?",options:["24","5","26"],correct:0,hint:"f(g(1))=f(5)=24"}],
      tokens:[
       { match:"(f∘g)(1)", hint:{ title:"(f∘g)(1) — нийлмэл утга", body:"Дотроос гадагш: g(1)=5 эхлээд, дараа f(5)=24. f∘g нь f(g(...)) гэсэн үг.", formula:"(f∘g)(1)=f(g(1))=f(5)=24" } },
      ] },
    { type:"quiz", q:{ text:"g(x)=2x, f(x)=x+3. (f∘g)(x)=?", options:["2x+3","2x","x+6","x+3"], correct:0, explanation:"f(g(x))=f(2x)=2x+3", xp:20 },
      tokens:[
       { match:"(f∘g)(x)", hint:{ title:"(f∘g)(x) — ерөнхий томьёо", body:"g(x)=2x дотоод функц. f(g(x))=f(2x)=2x+3. Дотроос гадагш тооцоолно.", formula:"f(g(x))=f(2x)=2x+3" } },
      ] },
    { type:"complete", xp:80, nextId:"g11-1-5", nextTitle:"Урвуу функц" },
  ],
};

const g11_1_5: Lesson = {
  id:"g11-1-5", title:"Урвуу функц", desc:"f⁻¹(x) тодорхойлолт, y=x тэгш хэм",
  levelColor:"#7F77DD", levelName:"11-р анги · Функц", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"🔄", title:"Урвуу функц", subtitle:"11-р анги · Функц",
      body:"f(f⁻¹(x))=x — урвуу функц нь оролт/гаралтыг сольдог.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Урвуу функц нь кодлох/тайлах, нэгжийн хөрвүүлэлт, логарифм тооцоонд гарч ирдэг. Нийлмэл математикийн чухал ойлголт.",
      willLearn:["Урвуу функцийн тодорхойлолтыг ойлгох","y=x шулуунтай тэгш хэмийн утгыг харах","f⁻¹(x) тооцоолох алхмуудыг дагах"],
      tip:"💡 Зөвлөгөө: x, y-г солих нь 'асуулт, хариултыг эргүүлэх' гэсэн утгатай — оролт гаралт болж, гаралт оролт болно." },
    { type:"concept", title:"Урвуу функц", body:"x ба y-г сольж, y-р шийдвэл урвуу функц гарна.", formula:"f(f⁻¹(x)) = x",
      bullets:[ bullet("🔁","x, y-г сольно"), bullet("📐","График нь y=x-тай тэгш хэмтэй"), bullet("✅","Зөвхөн нэг-нэгтийн функц"), bullet("📝","тэмдэглэл: f⁻¹") ] },
    pred("y=2x+1 ба f⁻¹(x) хаана огтлолцох вэ?",
      ["y=x шулуун дээр","x-тэнхлэг дээр","y-тэнхлэг дээр","огтлолцохгүй"], 0,
      "Функц ба урвуу нь y=x шулуунтай тэгш хэмтэй"),
    { type:"interactive", title:"f ба f⁻¹ харицуулах", body:"y=2x+1 ба урвуу нь, y=x тэгш хэмийн шулуун.",
      graphType:"inverse", sliders:["a"], initA:2 },
    scaff("f(x) = 3x − 6",
      [{question:"x,y солих?",options:["x=3y−6","y=3x+6","x=3y+6"],correct:0,hint:"x,y байрлалыг солино: x=3y−6"},
       {question:"y-г ил гарга",options:["y=(x+6)/3","y=(x−6)/3","y=3(x+6)"],correct:0,hint:"3y=x+6 → y=(x+6)/3"},
       {question:"f⁻¹(0)=?",options:["6","2","−2"],correct:1,hint:"f⁻¹(0)=(0+6)/3=2"}]),
    pred("f(x)=x², урвуу f⁻¹(x) байх уу?",
      ["Тийм, √x","Байхгүй","−x²","1/x²"], 0,
      "x≥0 тохиолдолд f⁻¹(x)=√x, зөвхөн x≥0 мужид"),
    q("f(x)=2x+4 урвуу?",
      ["f⁻¹(x)=(x−4)/2","f⁻¹(x)=(x+4)/2","f⁻¹(x)=2x−4","f⁻¹(x)=x/2"], 0,
      "y=2x+4 → x=(y−4)/2, тиймэс f⁻¹(x)=(x−4)/2"),
    { type:"complete", xp:80, nextId:"g11-1-6", nextTitle:"Өсөх ба буурах функц" },
  ],
};

const g11_1_6: Lesson = {
  id:"g11-1-6", title:"Өсөх ба буурах функц", desc:"Өсөх/буурах интервал, тодорхойлолт",
  levelColor:"#7F77DD", levelName:"11-р анги · Функц", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"📉", title:"Өсөх ба буурах функц", subtitle:"11-р анги · Функц",
      body:"Функцийн графикт зүүнээс баруун тийш өсөх ба буурах интервалыг тодорхойлно.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Функцийн өсөх/буурах шинжийг мэдэх нь максимум/минимум олох, эдийн засгийн шинжилгээний суурь ойлголт.",
      willLearn:["Өсөх/буурах тодорхойлолтыг уламжлалаар холбох","График дээр интервалуудыг тодорхойлох","f'(x)-ийн тэмдгийг ашиглах"],
      tip:"💡 Зөвлөгөө: f'(x)>0 бол 'функц дагжаа байна' — зүүнээс баруун тийш нэмэгдэж байна." },
    { type:"concept", title:"Тодорхойлолт", body:"x₁<x₂ үед утгуудын харьцаагаар өсөх/буурахыг тодорхойлно.", formula:"x₁ < x₂  ⟹  f(x₁) < f(x₂)  (өсөх)",
      bullets:[ bullet("🟢","f(x₁)<f(x₂) → өсөх"), bullet("🔴","f(x₁)>f(x₂) → буурах"), bullet("📐","f'(x)>0 → өсөх интервал"), bullet("📉","f'(x)<0 → буурах интервал") ] },
    pred("f(x)=x² хаана буурдаг вэ?",
      ["x<0 дээр","x>0 дээр","хаана ч буурахгүй","x=0 дээр"], 0,
      "Парабол x=0-с зүүн талд буурна", "x^2", "x^2"),
    { type:"interactive", title:"Өсөх/буурах интервал", body:"f(x)=x³−3x функцийн ногоон (өсөх) ба улаан (буурах) интервалуудыг харцгаая.",
      graphType:"growth", sliders:[] },
    pred("f(x)=−x² өсөх интервал?",
      ["x<0","x>0","хаана ч өсөхгүй","x=0"], 0,
      "a<0 тул эсрэгээр: x<0 өснө, x>0 буурна", "-x^2", "-x^2"),
    scaff("f(x) = x² − 4x + 3",
      [{question:"f'(x) ол",options:["2x−4","2x+4","x−4"],correct:0,hint:"уламжлал: f'(x)=2x−4"},
       {question:"f'(x)=0 үед x=?",options:["x=2","x=4","x=−2"],correct:0,hint:"2x−4=0 → x=2"},
       {question:"Буурах интервал?",options:["x<2","x>2","x<0"],correct:0,hint:"x<2 дээр f'<0, буурах"}]),
    q("f(x)=x³ өсөх уу буурах уу x>0 дээр?",
      ["өсөх","буурах","тогтмол","тодорхойгүй"], 0,
      "f'(x)=3x²>0 (x≠0) тул өсөх"),
    { type:"complete", xp:80, nextId:"g11-2-1", nextTitle:"Нэгж тойрог" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE 11 — MODULE 2: ТРИГОНОМЕТР (#D85A30)
// ═══════════════════════════════════════════════════════════════════════════════

const g11_2_1: Lesson = {
  id:"g11-2-1", title:"Нэгж тойрог", desc:"Радиан хэмжээ, нэгж тойрог дээрх цэг",
  levelColor:"#D85A30", levelName:"11-р анги · Тригонометр", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"⭕", title:"Нэгж тойрог ба радиан", subtitle:"11-р анги · Тригонометр",
      body:"Нэгж тойрог дээрх цэгийн координат нь (cosθ, sinθ) байдаг.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Нэгж тойрог нь тригонометрийн бүх ойлголтын суурь. Физикийн долгион, инженерийн дохио боловсруулалтад нэн чухал.",
      willLearn:["Радиан ба градусын хооронд хөрвүүлэх","Нэгж тойрог дээрх цэгийн координатыг тооцоолох","cosθ ба sinθ-г геометрийн утгаар ойлгох"],
      tip:"💡 Зөвлөгөө: Нэгж тойрог бол 'unit circle' — радиус нь яг 1. Тэр учраас цэгийн координат нь (cosθ, sinθ) болдог." },
    { type:"concept", title:"Радиан ба градус", body:"Өнцгийг радианаар хэмжинэ. Нэгж тойргийн радиус r=1.", formula:"π радиан = 180°",
      bullets:[ bullet("⭕","Нэгж тойргийн r=1"), bullet("📐","Цэгийн координат: (cosθ, sinθ)"), bullet("🔢","90°=π/2, 180°=π, 270°=3π/2"), bullet("📍","360°=2π бүтэн тойрог") ] },
    pred("90°-д sin(90°) хэд вэ?",
      ["1","0","−1","0.5"], 0,
      "90°-д цэг (0,1) байна. sin = y = 1"),
    { type:"interactive", title:"Өнцгийг тойрог дээр харах", body:"θ өнцгийг өөрчлөн sin, cos утгыг бодит цагт харцгаая.",
      graphType:"unitCircle", sliders:["angle"], initAngle:45 },
    pred("180°-д cos(180°) хэд вэ?",
      ["−1","1","0","−0.5"], 0,
      "180°-д цэг (−1,0). cos = x = −1"),
    scaff("270° радиан болгож sin, cos ол",
      [{question:"270°→радиан?",options:["3π/2","π/2","2π"],correct:0,hint:"270×π/180=3π/2"},
       {question:"Цэгийн байрлал?",options:["(0,−1)","(−1,0)","(0,1)"],correct:0,hint:"3π/2 үед цэг (0,−1)"},
       {question:"sin(270°)=?",options:["−1","0","1"],correct:0,hint:"sin=y координат=−1"}]),
    q("sin²θ + cos²θ = ?",
      ["1","0","2","sin(2θ)"], 0,
      "Нэгж тойргийн Пифагорын теорем"),
    { type:"complete", xp:80, nextId:"g11-2-2", nextTitle:"Тригонометрийн утгууд" },
  ],
};

const g11_2_2: Lesson = {
  id:"g11-2-2", title:"Тригонометрийн утгууд", desc:"Гол өнцгүүдийн sin, cos, tan утга",
  levelColor:"#D85A30", levelName:"11-р анги · Тригонометр", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"📐", title:"Гол өнцгүүдийн утга", subtitle:"11-р анги · Тригонометр",
      body:"Гол өнцгүүдийн sin, cos, tan утгыг цээжилж, хэрэглэж сурцгаая.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Гол өнцгүүдийн утгыг мэдэх нь шалгалтад хурдан бодох боломж олгодог. Практикт хамгийн их хэрэглэгддэг утгууд.",
      willLearn:["0°, 30°, 45°, 60°, 90° өнцгийн sin, cos, tan утгыг цээжлэх","Нэгж тойргоос утгыг уншиж авах","Тэгш хэмийг ашиглан 120°, 150° гэх мэт утгыг олох"],
      tip:"💡 Зөвлөгөө: sin утгуудыг 0, 1/2, √2/2, √3/2, 1 — 0°-с 90° хүртэл эрэмбээр нь санаарай." },
    { type:"concept", title:"Үндсэн утгуудын хүснэгт", body:"sin, cos, tan утгыг нэгж тойргоор тодорхойлно.", formula:"tan x = sin x / cos x",
      bullets:[ bullet("0°","sin=0, cos=1, tan=0"), bullet("30°","sin=½, cos=√3/2, tan=1/√3"), bullet("45°","sin=cos=√2/2, tan=1"), bullet("90°","sin=1, cos=0, tan тодорхойгүй") ] },
    pred("cos(60°) = ?",
      ["1/2","√3/2","1","0"], 0,
      "cos(60°)=1/2 стандарт утга"),
    { type:"interactive", title:"sin, cos графикууд", body:"θ-г өөрчлөн sin ба cos утгыг харцгаая.",
      graphType:"trigValues", sliders:["angle"], initAngle:45 },
    pred("sin(150°) = ?",
      ["1/2","−1/2","√3/2","−√3/2"], 0,
      "150°=180°−30°, sin(180°−x)=sin(x), sin(30°)=1/2"),
    scaff("tan(45°) олох",
      [{question:"sin(45°)=?",options:["√2/2","1/2","1"],correct:0,hint:"sin(45°)=√2/2"},
       {question:"cos(45°)=?",options:["√2/2","1/2","0"],correct:0,hint:"cos(45°)=√2/2"},
       {question:"tan(45°)=sin/cos=?",options:["1","√2","1/2"],correct:0,hint:"(√2/2)/(√2/2)=1"}]),
    q("tan(90°) = ?",
      ["тодорхойгүй (cos=0)","1","0","∞"], 0,
      "cos(90°)=0 тул tan(90°)=sin/cos тодорхойгүй"),
    { type:"complete", xp:80, nextId:"g11-2-3", nextTitle:"Тригонометрийн адилтгал" },
  ],
};

const g11_2_3: Lesson = {
  id:"g11-2-3", title:"Тригонометрийн адилтгал", desc:"Үндсэн адилтгал sin²+cos²=1",
  levelColor:"#D85A30", levelName:"11-р анги · Тригонометр", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"🔁", title:"Тригонометрийн адилтгалууд", subtitle:"11-р анги · Тригонометр",
      body:"sin²x+cos²x=1 нь хамгийн чухал тригонометрийн адилтгал.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Адилтгалууд нь тригонометрийн нийлмэл илэрхийллийг хялбарчилж, тэгшитгэл шийдэхэд хэрэглэгддэг.",
      willLearn:["sin²x + cos²x = 1 адилтгалыг ашиглах","Давхаргын томьёог хэрэглэх","Нэг тригонометрийн утгаас нөгөөг гаргаж авах"],
      tip:"💡 Зөвлөгөө: sin²+cos²=1 нь нэгж тойргийн Пифагорын теорем — дурдаад санацгаая, хаанаас ч гарч болно." },
    { type:"concept", title:"Үндсэн адилтгалууд", body:"Нэгж тойргийн Пифагорын теорем.", formula:"sin²x + cos²x = 1",
      bullets:[ bullet("🔑","sin²x+cos²x=1 үндсэн"), bullet("🔗","tan x = sin x / cos x"), bullet("✨","sin(2x) = 2sinx·cosx"), bullet("📐","cos(2x) = cos²x−sin²x") ] },
    pred("sin(x)=3/5 бол cos²(x)=?",
      ["16/25","9/25","1/25","7/25"], 0,
      "sin²+cos²=1 → cos²=1−9/25=16/25"),
    { type:"interactive", title:"sin²x + cos²x = 1", body:"Хоёр функцийн квадратын нийлбэр үргэлж 1 байгааг харцгаая.",
      graphType:"identity", sliders:[] },
    pred("sin(2×30°) = ?",
      ["√3/2","sin60°+sin60°","2sin30°","sin30°×2"], 0,
      "sin(2x)=2sinxcosx=2×(1/2)×(√3/2)=√3/2"),
    scaff("sin(x)=4/5, x нь 1-р улиралд. cos(x), tan(x) ол",
      [{question:"cos²(x)=?",options:["9/25","16/25","7/25"],correct:0,hint:"1−(4/5)²=1−16/25=9/25"},
       {question:"cos(x)=?",options:["3/5","4/5","−3/5"],correct:0,hint:"1-р улиралд cos>0, cos=3/5"},
       {question:"tan(x)=?",options:["4/3","3/4","5/4"],correct:0,hint:"tan=sin/cos=(4/5)/(3/5)=4/3"}]),
    q("sin(2x) = 2sin(x)cos(x) адилтгал нэр?",
      ["давхаргын томьёо","Пифагорын адилтгал","нэгдлийн томьёо","зөрүүний томьёо"], 0,
      "sin(2x)=2sinxcosx нь давхаргын томьёо"),
    { type:"complete", xp:80, nextId:"g11-3-1", nextTitle:"Шүргэгч шугам" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE 11 — MODULE 3: УЛАМЖЛАЛ (#1D9E75)
// ═══════════════════════════════════════════════════════════════════════════════

const g11_3_1: Lesson = {
  id:"g11-3-1", title:"Шүргэгч шугам", desc:"Уламжлалын ойлголт, шүргэгч шугамын налуу",
  levelColor:"#1D9E75", levelName:"11-р анги · Уламжлал", totalXp:100, duration:"10 мин",
  slides:[
    { type:"intro", emoji:"📈", title:"Уламжлалын тухай ойлголт", subtitle:"11-р анги · Уламжлал",
      body:"Уламжлал нь функцийн тухайн цэгийн өөрчлөлтийн хурдыг илэрхийлдэг.", xp:100, duration:"10 мин", questions:5,
      whyMatters:"Уламжлал нь математикийн хамгийн чухал ойлголтуудын нэг. Физикийн хурд, эдийн засгийн ахиц, технологийн алгоритм бүгд уламжлалд суурилдаг.",
      willLearn:["Уламжлалын геометр утга — шүргэгч шугамын налуу","Хүчний дүрэм ашиглан уламжлал бодох","Тухайн цэгт функцийн өсөлтийн хурдыг тооцоолох"],
      tip:"💡 Зөвлөгөө: Шүргэгч шугамыг харахдаа 'энэ цэгт функц хэр хурдан өсч байна вэ?' гэж бодоорой." },
    { type:"concept", title:"Уламжлалын тодорхойлолт", body:"Хязгаараар тодорхойлогдоно. Геометр утга: шүргэгч налуу.", formula:"f'(x) = lim[h→0] (f(x+h)−f(x))/h",
      bullets:[ bullet("📐","Шүргэгч шугамын налуу"), bullet("⚡","Тухайн цэгийн өөрчлөлтийн хурд"), bullet("🔬","тэмдэглэл: f'(x) ба dy/dx") ] },
    pred("x=2 дэх f(x)=x² шүргэгч налуу?",
      ["4","2","8","1"], 0,
      "f'(x)=2x, f'(2)=4", "x^2", "x^2"),
    { type:"interactive", title:"Шүргэгч шугам харах", body:"h-г өөрчлөн f(x)=x² функцийн шүргэгч шугамыг харцгаая.",
      graphType:"tangentLine", sliders:["h"], initH:1 },
    pred("x=0 дэх f(x)=x² шүргэгч налуу?",
      ["0","1","2","−1"], 0,
      "f'(0)=2×0=0, тэнхлэгтэй параллель", "x^2", "x^2"),
    build("f'(xⁿ) = n · xⁿ⁻¹",
      [{id:"n",label:"n",color:"#7F77DD"},{id:"dot",label:"·"},{id:"xn",label:"xⁿ⁻¹",color:"#1D9E75"}],
      ["n","dot","xn"]),
    scaff("f(x)=x²+2x дээр x=1 шүргэгч тэгшитгэл",
      [{question:"f'(x)=?",options:["2x+2","2x","x+2"],correct:0,hint:"(x²)'=2x, (2x)'=2"},
       {question:"f'(1)=?",options:["4","2","3"],correct:0,hint:"2(1)+2=4"},
       {question:"f(1)=?",options:["3","2","4"],correct:0,hint:"1²+2(1)=3"}]),
    q("Шүргэгч шугам юуг илэрхийлдэг?",
      ["тухайн цэгийн налуу","функцийн утга","дундаж өөрчлөлт","талбай"], 0,
      "Шүргэгч налуу = уламжлалын утга тухайн цэгт"),
    { type:"complete", xp:100, nextId:"g11-3-2", nextTitle:"Уламжлалын дүрмүүд" },
  ],
};

const g11_3_2: Lesson = {
  id:"g11-3-2", title:"Уламжлалын дүрмүүд", desc:"Хүчний, нийлбэр, үржвэр, гинжин дүрэм",
  levelColor:"#1D9E75", levelName:"11-р анги · Уламжлал", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"📋", title:"Уламжлалын үндсэн дүрмүүд", subtitle:"11-р анги · Уламжлал",
      body:"Үндсэн 4 дүрэм мэдэхэд дурын функцийн уламжлалыг бодож чадна.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Уламжлалын дүрмүүдийг мэдэхэд дурын функцийн уламжлалыг механикаар бодож чаддаг болно. ЭЕШ-д тогтмол гарах сэдэв.",
      willLearn:["Хүчний дүрэм (xⁿ)'=nxⁿ⁻¹ хэрэглэх","Нийлбэр ба үржвэрийн дүрмийг хэрэглэх","Гинжин дүрмийг нийлмэл функцэд ашиглах"],
      tip:"💡 Зөвлөгөө: Эхлээд хүчний дүрмийг нэмэгдэл бүрт тус тусад нь хэрэглэж сур, дараа нэгтгэ." },
    { type:"concept", title:"Үндсэн дүрмүүд", body:"Нийлмэл, үржвэр, хуваарийн дүрмүүдийг хэрэглэнэ.", formula:"(xⁿ)' = nxⁿ⁻¹",
      bullets:[ bullet("1️⃣","(c)'=0 тогтмол"), bullet("2️⃣","(xⁿ)'=nxⁿ⁻¹ хүч"), bullet("3️⃣","(f+g)'=f'+g' нийлбэр"), bullet("4️⃣","(fg)'=f'g+fg' үржвэр") ] },
    pred("(x³)' = ?",
      ["3x²","3x","x²","3"], 0,
      "хүчний дүрмээр n=3: 3x³⁻¹=3x²"),
    { type:"interactive", title:"f(x)=axⁿ ба f'(x)", body:"a-г өөрчлөн f(x) ба f'(x) хоёуланг харцгаая.",
      graphType:"derivRules", sliders:["a"], initA:1 },
    pred("(5x²+3x)' = ?",
      ["10x+3","5x+3","10x","5x²+3"], 0,
      "(5x²)'=10x, (3x)'=3, нийлбэр: 10x+3"),
    scaff("f(x)=(2x+1)(x²−3)",
      [{question:"f'=g'h+gh' — g'=?",options:["2","2x+1","1"],correct:0,hint:"g=2x+1, g'=2"},
       {question:"h'=?",options:["2x","x²","3"],correct:0,hint:"h=x²−3, h'=2x"},
       {question:"f'=?",options:["2(x²−3)+(2x+1)(2x)","2x+2","4x²−6"],correct:0,hint:"f'=g'h+gh'=6x²+2x−6"}]),
    q("(x⁴−x²)' = ?",
      ["4x³−2x","4x²−2x","x³−x","4x³"], 0,
      "Хүчний дүрмийг гишүүн бүрт хэрэглэнэ"),
    { type:"complete", xp:80, nextId:"g11-3-3", nextTitle:"Нийлбэрийн уламжлал" },
  ],
};

const g11_3_3: Lesson = {
  id:"g11-3-3", title:"Нийлбэрийн уламжлал", desc:"Олон гишүүнт функцийн уламжлал",
  levelColor:"#1D9E75", levelName:"11-р анги · Уламжлал", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"➕", title:"Олон гишүүнт функцийн уламжлал", subtitle:"11-р анги · Уламжлал",
      body:"Полиномын уламжлал авахдаа гишүүн бүрт тусад нь хэрэглэнэ.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Полином функцийн уламжлал нь хамгийн хурдан эзэмших боломжтой. Их хэмжээний тооцоог хялбарчилдаг суурь арга.",
      willLearn:["Гишүүн бүрт тус тусад нь уламжлал авах","Хурдан уламжлал авах техник дадлага хийх","f'(x)-ийн утгаар өсөх/буурахыг тодорхойлох"],
      tip:"💡 Зөвлөгөө: Нийлбэрийн уламжлал авахдаа 'гишүүн бүрийг тусад нь ав, нэм' гэсэн дүрмийг дага." },
    { type:"concept", title:"Нийлбэрийн дүрэм", body:"Тус тусад нь уламжлал авч нэмнэ.", formula:"(f + g)' = f' + g'",
      bullets:[ bullet("✅","Гишүүн бүрт тусад нь"), bullet("📝","(3x²+2x−1)'=6x+2"), bullet("🔑","(cf)'=cf'"), bullet("📐","жишээ: (x⁴)'=4x³") ] },
    pred("(3x²+2x+1)' = ?",
      ["6x+2","3x+2","6x²+2","6x"], 0,
      "(3x²)'=6x, (2x)'=2, (1)'=0"),
    { type:"interactive", title:"Полином ба уламжлал", body:"a-г өөрчлөн f(x)=ax³−3x ба f'(x) харцгаая.",
      graphType:"polyDeriv", sliders:["a"], initA:1 },
    pred("(x⁴−x²)' = ?",
      ["4x³−2x","4x²−2x","x³−x","4x³"], 0,
      "(x⁴)'=4x³, (x²)'=2x"),
    scaff("f(x)=2x³−3x²+x−5, f'(2)=?",
      [{question:"f'(x)=?",options:["6x²−6x+1","6x²−3x","2x²−6x+1"],correct:0,hint:"(2x³)'=6x², (3x²)'=6x, (x)'=1"},
       {question:"f'(2)=6(4)−6(2)+1=?",options:["13","12","11"],correct:0,hint:"24−12+1=13"},
       {question:"x=2 дэх функц өсөх үү?",options:["өсөх","буурах","тогтмол"],correct:0,hint:"f'(2)=13>0 тул өсөх"}]),
    q("(x³+2x)' дэд x=1 — утга?",
      ["5","3","7","2"], 0,
      "f'(x)=3x²+2, f'(1)=3+2=5"),
    { type:"complete", xp:80, nextId:"g11-3-4", nextTitle:"Функцийн экстремум" },
  ],
};

const g11_3_4: Lesson = {
  id:"g11-3-4", title:"Функцийн экстремум", desc:"Максимум, минимум цэг олох",
  levelColor:"#1D9E75", levelName:"11-р анги · Уламжлал", totalXp:100, duration:"10 мин",
  slides:[
    { type:"intro", emoji:"🏔️", title:"Хамгийн их, бага утга", subtitle:"11-р анги · Уламжлал",
      body:"f'(x)=0 болох цэгт максимум эсвэл минимум байж болно.", xp:100, duration:"10 мин", questions:5,
      whyMatters:"Максимум, минимум олох нь оновчлолын суурь. Инженерчлэл, эдийн засаг, машин сургалтад өргөн хэрэглэгддэг.",
      willLearn:["f'(x)=0 тавьж шүүмжлэлт цэг олох","f''(x)-ийн тэмдгээр максимум/минимум ялгах","Графикаар экстремумыг харах, тайлбарлах"],
      tip:"💡 Зөвлөгөө: f'(x)=0 бол 'зогссон цэг' — өсөх/буурах солигдох тул экстремум байж болно." },
    { type:"concept", title:"Шүүмжлэлт цэг ба экстремум", body:"Уламжлалыг ашиглан экстремумыг тодорхойлно.", formula:"f'(x) = 0  →  шүүмжлэлт цэг",
      bullets:[ bullet("📍","f'(x)=0 шүүмжлэлт цэг"), bullet("🏔️","f'(+→−) максимум"), bullet("🏞️","f'(−→+) минимум"), bullet("📐","f''<0 максимум, f''>0 минимум") ] },
    pred("f'(x)=0 байх үед юу болох вэ?",
      ["Боломжит экстремум","Заавал максимум","Заавал минимум","Юу ч биш"], 0,
      "f'(x)=0 нь шүүмжлэлт цэг — максимум эсвэл минимум байж болно"),
    { type:"interactive", title:"Максимум ба минимум", body:"f(x)=x³−3x функцийн экстремум цэгүүдийг харцгаая.",
      graphType:"extremum", sliders:[] },
    pred("f(x)=x² хамгийн бага утга хаана?",
      ["x=0","x=1","x=−1","байхгүй"], 0,
      "f'(x)=2x=0 → x=0, f''(0)=2>0 тул минимум"),
    build("f''(x) < 0 → максимум",
      [{id:"fd",label:"f''(x)",color:"#7F77DD"},{id:"lt",label:"< 0",color:"#D85A30"},{id:"arr",label:"→"},{id:"max",label:"максимум",color:"#1D9E75"}],
      ["fd","lt","arr","max"]),
    scaff("f(x)=x³−3x²−9x+5",
      [{question:"f'(x)=?",options:["3x²−6x−9","3x²−6x","x²−6x−9"],correct:0,hint:"(x³)'=3x², (3x²)'=6x, (9x)'=9"},
       {question:"f'(x)=0 шийд?",options:["x=3, x=−1","x=3, x=1","x=−3, x=1"],correct:0,hint:"3x²−6x−9=0→(x−3)(x+1)=0"},
       {question:"x=−1 дэх f''<0 тул?",options:["максимум","минимум","огтлол"],correct:0,hint:"f''(x)=6x−6, f''(−1)=−12<0→максимум"}]),
    q("f(x)=−x²+4x максимум?",
      ["x=2 дээр","x=4 дээр","x=0 дээр","x=−2 дээр"], 0,
      "f'(x)=−2x+4=0 → x=2"),
    { type:"complete", xp:100, nextId:"g11-4-1", nextTitle:"Антиуламжлал" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE 11 — MODULE 4: ИНТЕГРАЛ (#BA7517)
// ═══════════════════════════════════════════════════════════════════════════════

const g11_4_1: Lesson = {
  id:"g11-4-1", title:"Антиуламжлал", desc:"Уламжлалын урвуу үйлдэл",
  levelColor:"#BA7517", levelName:"11-р анги · Интеграл", totalXp:100, duration:"10 мин",
  slides:[
    { type:"intro", emoji:"∫", title:"Интеграл — уламжлалын урвуу", subtitle:"11-р анги · Интеграл",
      body:"∫f(x)dx = F(x) + C — F'(x)=f(x) болох F(x)-ийг олох.", xp:100, duration:"10 мин", questions:5,
      whyMatters:"Интеграл нь уламжлалын урвуу үйлдэл. Талбай, эзэлхүүн, нийт хөдөлгөөн тооцоолоход хэрэглэгддэг гол хэрэгсэл.",
      willLearn:["∫xⁿdx = xⁿ⁺¹/(n+1)+C томьёог хэрэглэх","Интегралчлалын тогтмол C-г ойлгох","Уламжлал ба интегралын харилцааг ойлгох"],
      tip:"💡 Зөвлөгөө: Интеграл бол уламжлалын 'эсрэг' үйлдэл. Бодсоноо шалгахын тулд уламжлал ав — анхных нь гарах ёстой." },
    { type:"concept", title:"Тодорхойгүй интеграл", body:"F'(x)=f(x) болох F(x)-ийг олох.", formula:"∫f(x)dx = F(x) + C",
      bullets:[ bullet("🔑","F'(x)=f(x) → F антиуламжлал"), bullet("C","C интегралчлалын тогтмол"), bullet("📐","∫xⁿdx = xⁿ⁺¹/(n+1)+C"), bullet("📊","∫cdx = cx+C") ] },
    pred("∫2x dx = ?",
      ["x²+C","2x²+C","x+C","2+C"], 0,
      "∫2x dx = 2·x²/2 + C = x² + C"),
    { type:"interactive", title:"f(x) ба F(x) харах", body:"f(x)=2x (ногоон) ба F(x)=x² (ягаан) хоёуланг харцгаая.",
      graphType:"antideriv", sliders:[] },
    pred("∫5 dx = ?",
      ["5x+C","5+C","x+C","5x"], 0,
      "тогтмолын интеграл: ∫c dx = cx + C"),
    build("∫xⁿdx = xⁿ⁺¹/(n+1) + C",
      [{id:"xn1",label:"xⁿ⁺¹",color:"#7F77DD"},{id:"div",label:"/(n+1)",color:"#1D9E75"},{id:"c",label:"+ C",color:"#BA7517"}],
      ["xn1","div","c"]),
    scaff("∫(3x²+2x−1)dx",
      [{question:"∫3x²dx=?",options:["x³+C","3x³+C","x²+C"],correct:0,hint:"3·x³/3=x³"},
       {question:"∫2x dx=?",options:["x²+C","2x²+C","x+C"],correct:0,hint:"2·x²/2=x²"},
       {question:"∫(3x²+2x−1)dx=?",options:["x³+x²−x+C","x³+x²+C","x³−x+C"],correct:0,hint:"x³+x²−x+C"}]),
    q("∫x³ dx = ?",
      ["x⁴/4 + C","x³/3 + C","4x⁴ + C","x⁴ + C"], 0,
      "∫xⁿdx=xⁿ⁺¹/(n+1)+C, n=3 → x⁴/4+C"),
    { type:"complete", xp:100, nextId:"g11-4-2", nextTitle:"Тодорхой интеграл" },
  ],
};

const g11_4_2: Lesson = {
  id:"g11-4-2", title:"Тодорхой интеграл", desc:"Талбайг интегралаар тооцоолох",
  levelColor:"#BA7517", levelName:"11-р анги · Интеграл", totalXp:100, duration:"10 мин",
  slides:[
    { type:"intro", emoji:"📊", title:"Тодорхой интеграл ба талбай", subtitle:"11-р анги · Интеграл",
      body:"∫ₐᵇf(x)dx = F(b) − F(a) — Ньютон–Лейбниц томьёо.", xp:100, duration:"10 мин", questions:5,
      whyMatters:"Тодорхой интеграл нь физикийн ажил, газрын зураг, магадлалын тооцоонд өргөн хэрэглэгддэг.",
      willLearn:["Ньютон–Лейбниц томьёог хэрэглэх","Риманы нийлбэрийн утгыг ойлгох","Тодорхой интегралын хариуг тооцоолох"],
      tip:"💡 Зөвлөгөө: ∫ₐᵇ гэдэг нь 'a-с b хүртэлх хэсгийн нийт хуримтлал' гэсэн утгатай." },
    { type:"concept", title:"Тодорхой интеграл", body:"n тэгш өнцөгт нэмэгдэх тусам нарийвчлал сайжирна.", formula:"∫ₐᵇf(x)dx = F(b) − F(a)",
      bullets:[ bullet("📊","Талбай ≈ тэгш өнцөгтүүдийн нийлбэр"), bullet("↗️","n→∞ үед нарийвчлал нэмэгдэнэ"), bullet("📐","Ньютон–Лейбниц: F(b)−F(a)"), bullet("🔑","Риманы нийлбэр") ] },
    pred("n (тэгш өнцөгт) нэмэгдэхэд юу болох вэ?",
      ["нарийвчлал нэмэгдэнэ","өөрчлөгдөхгүй","талбай нэмэгдэнэ","тэгш өнцөгт томрно"], 0,
      "n→∞ үед Риманы нийлбэр жинхэнэ талбайд ойртоно"),
    { type:"interactive", title:"Риманы нийлбэр", body:"n-г нэмэгдүүлэн нарийвчлал сайжрахыг харцгаая.",
      graphType:"riemann", sliders:["n"], initN:4 },
    pred("∫₀² x dx = ?",
      ["2","4","1","3"], 0,
      "[x²/2]₀² = 4/2 − 0 = 2"),
    scaff("∫₁³ (x²+1) dx",
      [{question:"Антиуламжлал?",options:["x³/3+x","x³/3","x²+x"],correct:0,hint:"∫x²dx=x³/3, ∫1dx=x"},
       {question:"[x³/3+x]₁³ дээд хил?",options:["9+3=12","9","3+1=4"],correct:0,hint:"3³/3+3=9+3=12"},
       {question:"Доод хил ба хариу?",options:["12−4/3=32/3","12−1=11","12−4=8"],correct:0,hint:"1/3+1=4/3, 12−4/3=32/3"}]),
    pred("x-тэнхлэгийн доорх талбай яаж бодох вэ?",
      ["абсолют утга авна","хасна","нэмнэ","тэгтэй тэнцүүлнэ"], 0,
      "f(x)<0 үед талбай сөрөг гарна — абсолют утга авна"),
    q("∫₀¹ x² dx = ?",
      ["1/3","1/2","1","2/3"], 0,
      "[x³/3]₀¹=1/3"),
    { type:"complete", xp:100, nextId:"g11-4-3", nextTitle:"Талбайн тооцоо" },
  ],
};

const g11_4_3: Lesson = {
  id:"g11-4-3", title:"Тодорхой интеграл ба талбай", desc:"Хоёр муруйн хооронд талбай",
  levelColor:"#BA7517", levelName:"11-р анги · Интеграл", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"🎨", title:"Муруйн хооронд талбай", subtitle:"11-р анги · Интеграл",
      body:"Хоёр функцийн хооронд орших талбайг тодорхой интегралаар тооцоолно.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Хоёр муруйн хооронд талбай тооцоолох нь инженерчлэл, физик, статистикт өргөн хэрэглэгддэг.",
      willLearn:["Огтлолцох цэгийг олж интегралын хязгаар тогтоох","f(x)−g(x) илэрхийллийг интегралдах","Нарийн нийлмэл талбайг хэсэгт хуваах"],
      tip:"💡 Зөвлөгөө: Эхлээд огтлолцох цэгийг ол, дараа 'дээрх минус доорх' гэж бод." },
    { type:"concept", title:"Хоёр муруйн хооронд", body:"Дээрх функцийг доорх функцээс хасна.", formula:"S = ∫ₐᵇ[f(x)−g(x)]dx",
      bullets:[ bullet("📐","f(x)≥g(x) → f−g хасна"), bullet("🔍","Огтлолцох цэг = хилийн цэг"), bullet("🎨","Абсолют утга хэрэглэнэ"), bullet("📊","x-тэнхлэгийн доор: |∫f dx|") ] },
    pred("y=x ба y=x² хаана огтлолцох вэ?",
      ["x=0 ба x=1","x=0 ба x=2","x=1 ба x=2","зөвхөн x=0"], 0,
      "x=x² → x(x−1)=0 → x=0,1"),
    { type:"interactive", title:"y=x ба y=x² хооронд талбай", body:"Ягаан (x²) ба ногоон (x) хооронд ягаанаар өнгөлсөн талбайг харцгаая.",
      graphType:"areaBetween", sliders:[] },
    scaff("y=x ба y=x² хоорондын талбай",
      [{question:"Огтлолцох цэг?",options:["x=0,1","x=0,2","x=1,2"],correct:0,hint:"x=x²→x=0,1"},
       {question:"∫₀¹(x−x²)dx антиуламжлал?",options:["x²/2−x³/3","x²−x³","x/2−x²/3"],correct:0,hint:"∫x dx=x²/2, ∫x²dx=x³/3"},
       {question:"Талбай?",options:["1/6","1/3","1/2"],correct:0,hint:"[x²/2−x³/3]₀¹=1/2−1/3=1/6"}]),
    pred("y=x² ба y=4 хоорондын талбай?",
      ["∫₋₂²(4−x²)dx","∫₀⁴(x²−4)dx","∫₀²(4−x²)dx","∫₋₂²x²dx"], 0,
      "y=4 дээр, y=x² доор. Огтлолцох цэг: x²=4→x=±2"),
    q("S = ∫ₐᵇ[f(x)−g(x)]dx томьёонд f(x) юу вэ?",
      ["дээрх функц","доорх функц","хуваарь","үржвэр"], 0,
      "f(x) нь дээрх (их) функц, g(x) нь доорх функц"),
    { type:"complete", xp:80 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE 12 — MODULE 1: ФУНКЦ II (#7F77DD)
// ═══════════════════════════════════════════════════════════════════════════════

const g12_1_1: Lesson = {
  id:"g12-1-1", title:"Логарифм", desc:"Логарифмын тодорхойлолт ба үндсэн чанар",
  levelColor:"#7F77DD", levelName:"12-р анги · Функц II", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"🔢", title:"Логарифм", subtitle:"12-р анги · Функц II",
      body:"logₐb = c ↔ aᶜ = b. Зэрэглэлийн урвуу үйлдэл.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Логарифм нь цахим холбооны дохионы хүч, хүчилтөрөгчийн индекс, газар хөдлөлтийн хэмжилтэд хэрэглэгддэг. ЭЕШ-д чухал сэдэв.",
      willLearn:["logₐb = c ↔ aᶜ = b холбоог ашиглах","Нийтлэг log₁₀ ба байгалийн ln логарифмыг ялгах","Логарифмын үндсэн утгыг тооцоолох"],
      tip:"💡 Зөвлөгөө: logₐb гэдэг нь 'a-г хэдэн зэрэгт өргөхөд b болох вэ?' гэсэн асуулт." },
    { type:"concept", title:"Логарифмын тодорхойлолт", body:"aᶜ=b ↔ logₐb=c гэсэн холбоо.", formula:"logₐb = c  ↔  aᶜ = b",
      bullets:[ bullet("📖","logₐb: a суурьтай b-ийн логарифм"), bullet("📝","log₁₀x = log x, ln x = logₑx"), bullet("🔑","logₐ1=0, logₐa=1"), bullet("📊","a>0, a≠1, b>0") ] },
    pred("log₂8 = ?",
      ["3","8","2","4"], 0,
      "2³=8 тул log₂8=3"),
    { type:"interactive", title:"y=log₂x ба y=2ˣ", body:"Логарифм ба экспоненциал нь урвуу функцүүд.",
      graphType:"log", sliders:[] },
    pred("log₁₀1000 = ?",
      ["3","4","2","1000"], 0,
      "10³=1000 тул log₁₀1000=3"),
    scaff("log₂32 + log₂4",
      [{question:"log₂32=?",options:["5","4","6"],correct:0,hint:"2⁵=32"},
       {question:"log₂4=?",options:["2","3","4"],correct:0,hint:"2²=4"},
       {question:"Нийлбэрийн томьёо?",options:["log₂128=7","9","log₂36"],correct:0,hint:"log₂(32×4)=log₂128=7"}]),
    q("log₁₀100 = ?",
      ["2","10","1","100"], 0,
      "10²=100 тул log₁₀100=2"),
    { type:"complete", xp:80, nextId:"g12-1-2", nextTitle:"Логарифмын чанар" },
  ],
};

const g12_1_2: Lesson = {
  id:"g12-1-2", title:"Логарифмын чанар", desc:"Нийлбэр, ялгавар, зэрэгт дүрмүүд",
  levelColor:"#7F77DD", levelName:"12-р анги · Функц II", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"📐", title:"Логарифмын дүрмүүд", subtitle:"12-р анги · Функц II",
      body:"Логарифмын дүрмүүд нь нийлмэл илэрхийллийг хялбарчилна.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Логарифмын дүрмүүд нь нийлмэл илэрхийллийг ихэд хялбарчилдаг. Компьютерийн алгоритмын нарийвчлалд хэрэглэгддэг.",
      willLearn:["Нийлбэр ба ялгаварын дүрмийг хэрэглэх","Зэрэгт дүрмийн тусламжтай логарифм хялбарчлах","Суурь өөрчлөх томьёог ашиглах"],
      tip:"💡 Зөвлөгөө: log(xy)=logx+logy — 'үржвэр нь нийлбэр болдог' энэ шидийг санаарай." },
    { type:"concept", title:"Үйлдлийн дүрмүүд", body:"Зэрэглэлийн үйлдэлтэй тохирдог.", formula:"logₐ(xy) = logₐx + logₐy",
      bullets:[ bullet("✖️","logₐ(xy)=logₐx+logₐy"), bullet("➗","logₐ(x/y)=logₐx−logₐy"), bullet("⬆️","logₐ(xⁿ)=n·logₐx"), bullet("🔄","суурь өөрчлөлт: logₐb=logb/loga") ] },
    pred("log₂(16×4) = ?",
      ["6","64","8","log₂20"], 0,
      "log₂16+log₂4=4+2=6 нийлбэрийн дүрэм"),
    { type:"interactive", title:"log(xy) = log(x) + log(y)", body:"log₂(x) ба log₂(2x)=log₂(x)+1 харцгаая.",
      graphType:"logProperty", sliders:[] },
    pred("log₂(32/4) = ?",
      ["3","128","8","5"], 0,
      "log₂32−log₂4=5−2=3 ялгаварын дүрэм"),
    scaff("log₂48 хялбарчил",
      [{question:"48=16×3 тул log₂48=?",options:["log₂16+log₂3","log₂16×log₂3","log₂51"],correct:0,hint:"нийлбэрийн дүрэм: log₂(16×3)"},
       {question:"log₂16=?",options:["4","3","5"],correct:0,hint:"2⁴=16"},
       {question:"log₂48≈?",options:["5.585","5","6"],correct:0,hint:"4+log₂3≈4+1.585=5.585"}]),
    q("log(a/b) = ?",
      ["log a − log b","log a + log b","log a × log b","log a / log b"], 0,
      "Хуваарийн дүрэм: log(a/b)=loga−logb"),
    { type:"complete", xp:80, nextId:"g12-1-3", nextTitle:"y=eˣ ба y=lnx" },
  ],
};

const g12_1_3: Lesson = {
  id:"g12-1-3", title:"y=eˣ ба y=lnx", desc:"Байгалийн логарифм, e тоо",
  levelColor:"#7F77DD", levelName:"12-р анги · Функц II", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"🌿", title:"Байгалийн логарифм", subtitle:"12-р анги · Функц II",
      body:"e ≈ 2.718 Эйлерийн тоо. y=eˣ ба y=lnx нь урвуу функцүүд.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Байгалийн логарифм ln нь хамгийн их хэрэглэгддэг логарифм. Банкны хүүгийн тооцоо, биологийн өсөлт, физикт хэрэглэгддэг.",
      willLearn:["e ≈ 2.718 Эйлерийн тооны ач холбогдлыг ойлгох","eˣ ба lnx урвуу функц болохыг харах","(eˣ)'=eˣ гэсэн өвөрмөц шинжийг ашиглах"],
      tip:"💡 Зөвлөгөө: eˣ-ийн уламжлал өөрөө — энэ хамгийн 'тайван' функц, уламжлал авахад өөрчлөгдөхгүй." },
    { type:"concept", title:"Байгалийн логарифм", body:"e нь байгалийн өсөлтийн тогтмол.", formula:"ln(eˣ) = x  ба  e^(lnx) = x",
      bullets:[ bullet("🌱","e≈2.718 Эйлерийн тоо"), bullet("🔄","y=eˣ ба y=lnx урвуу"), bullet("⚡","(eˣ)'=eˣ өөрөө"), bullet("📐","(lnx)'=1/x") ] },
    pred("y=eˣ ба y=lnx хаана огтлолцох вэ?",
      ["y=x шулуун дээр","x-тэнхлэг дээр","огтлолцохгүй","x=1 дээр"], 0,
      "Урвуу функцүүд тул y=x шулуунтай тэгш хэмтэй"),
    { type:"interactive", title:"y=eˣ ба y=lnx харах", body:"Хоёр функц y=x шулуунтай тэгш хэмтэй.",
      graphType:"naturalLog", sliders:[] },
    pred("ln(e⁵) = ?",
      ["5","e⁵","1","0"], 0,
      "ln(eˣ)=x тул ln(e⁵)=5"),
    scaff("f(x)=e²ˣ уламжлал",
      [{question:"Нийлмэл: u=?",options:["2x","eˣ","x²"],correct:0,hint:"e^(2x), u=2x"},
       {question:"u'=?",options:["2","2x","1"],correct:0,hint:"(2x)'=2"},
       {question:"f'(x)=eᵘ·u'=?",options:["2e²ˣ","e²ˣ","2xe²ˣ"],correct:0,hint:"eᵘ·u'=e²ˣ·2=2e²ˣ"}]),
    q("(lnx)' = ?",
      ["1/x","x","lnx","eˣ"], 0,
      "Байгалийн логарифмийн уламжлал"),
    { type:"complete", xp:80, nextId:"g12-1-4", nextTitle:"Рациональ функц" },
  ],
};

const g12_1_4: Lesson = {
  id:"g12-1-4", title:"Рациональ функц", desc:"y=k/x гиперболын хэлбэр, асимптот",
  levelColor:"#7F77DD", levelName:"12-р анги · Функц II", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"➗", title:"Гиперболын функц", subtitle:"12-р анги · Функц II",
      body:"y=k/x нь гиперболын хэлбэртэй. x=0 ба y=0 нь асимптотууд.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Гиперболын функц нь физикийн даралт/эзэлхүүн хамаарал, эдийн засгийн хязгаарлагдмал нөөцийн загварт хэрэглэгддэг.",
      willLearn:["Асимптот гэж юу болохыг ойлгох","Гиперболын хэлбэр, улирлуудыг тодорхойлох","k>0 ба k<0 тохиолдолд ялгааг харах"],
      tip:"💡 Зөвлөгөө: Асимптот бол 'хэзээ ч хүрч чадахгүй шугам' — функц ойртоно, гэхдээ хүрдэггүй." },
    { type:"concept", title:"Гипербол ба асимптот", body:"Q(x)=0 цэгт функц тодорхойгүй → босоо асимптот.", formula:"y = k/x  (k ≠ 0)",
      bullets:[ bullet("🚫","x=0 үед тодорхойгүй"), bullet("📐","x=0: босоо, y=0: хэвтээ асимптот"), bullet("📊","k>0: 1,3-р улирал; k<0: 2,4-р улирал"), bullet("🔍","y=k/(x−a)+b хэлбэр") ] },
    pred("y=1/x дээр x→0 үед юу болох вэ?",
      ["y→∞ буюу тодорхойгүй","y→0","y=1","y→−∞ зөвхөн"], 0,
      "0-д хувааж болохгүй тул функц тодорхойгүй болно"),
    { type:"interactive", title:"k өөрчлөх", body:"k-г өөрчлөн гиперболын хэлбэр хэрхэн өөрчлөгдөхийг харцгаая.",
      graphType:"hyperbola", sliders:["k"], initK:2 },
    pred("y=2/(x−3)+1 босоо асимптот?",
      ["x=3","x=1","x=0","x=2"], 0,
      "хуваагч x−3=0 → x=3 тодорхойгүй → босоо асимптот"),
    scaff("y=3/(x−2)+1 асимптотууд ол",
      [{question:"Босоо асимптот?",options:["x=2","x=3","x=1"],correct:0,hint:"x−2=0→x=2"},
       {question:"Хэвтээ асимптот?",options:["y=1","y=3","y=0"],correct:0,hint:"x→∞ үед 3/(x−2)→0, y→1"},
       {question:"Тодорхойлох муж?",options:["x≠2","x≠0","x>0"],correct:0,hint:"x=2-д тодорхойгүй"}]),
    q("y=1/x функцийн асимптотууд?",
      ["x=0 ба y=0","x=1 ба y=1","x=0 зөвхөн","y=0 зөвхөн"], 0,
      "Хуваагч=0 → x=0, y→0 → y=0"),
    { type:"complete", xp:80 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE 12 — MODULE 2: УЛАМЖЛАЛ II (#1D9E75)
// ═══════════════════════════════════════════════════════════════════════════════

const g12_2_1: Lesson = {
  id:"g12-2-1", title:"y=eˣ функцийн уламжлал", desc:"Экспоненциал функцийн уламжлал, нийлмэл",
  levelColor:"#1D9E75", levelName:"12-р анги · Уламжлал II", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"🔬", title:"Экспоненциал уламжлал", subtitle:"12-р анги · Уламжлал II",
      body:"(eˣ)'=eˣ — экспоненциал функцийн өвөрмөц чанар.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Экспоненциал функцийн уламжлал нь цахим дохио, биологийн ургалт, термодинамикийн уравшуулалтын суурь.",
      willLearn:["(eˣ)'=eˣ гэсэн өвөрмөц шинжийг ашиглах","Нийлмэл функцийн гинжин дүрмийг e^u хэлбэрт хэрэглэх","(2ˣ)' ба бусад суурьтай илтгэгчийн уламжлал"],
      tip:"💡 Зөвлөгөө: e^(f(x)) уламжлал авахдаа 'f(x)-ийн уламжлалаар үрж' гэж санаарай." },
    { type:"concept", title:"Томьёо ба нийлмэл", body:"(eᵘ)'=eᵘ·u' нийлмэл функцийн уламжлал.", formula:"(eˣ)' = eˣ",
      bullets:[ bullet("⚡","(eˣ)'=eˣ өөрөө"), bullet("🔗","(eᵘ)'=eᵘ·u' нийлмэл"), bullet("📐","(2ˣ)'=2ˣ·ln2"), bullet("🔑","u нийлмэл дотоод функц") ] },
    pred("(e³ˣ)' = ?",
      ["3e³ˣ","e³ˣ","3xe³ˣ","3"], 0,
      "u=3x, u'=3, (eᵘ)'=eᵘ·u'=3e³ˣ"),
    { type:"interactive", title:"y=e^(ax) ба уламжлал", body:"a-г өөрчлөн f(x)=e^(ax) ба f'(x)=ae^(ax) харцгаая.",
      graphType:"expDeriv", sliders:[] },
    pred("(2ˣ)' = ?",
      ["2ˣ·ln2","2ˣ","x·2ˣ⁻¹","ln2"], 0,
      "(aˣ)'=aˣ·lna томьёогоор"),
    scaff("f(x) = e^(x²+1)",
      [{question:"u=?",options:["x²+1","eˣ","x+1"],correct:0,hint:"нийлмэл: u=x²+1"},
       {question:"u'=?",options:["2x","2x+1","1"],correct:0,hint:"(x²+1)'=2x"},
       {question:"f'=eᵘ·u'=?",options:["2xe^(x²+1)","e^(x²+1)","2e^(x²+1)"],correct:0,hint:"eᵘ·2x=2xe^(x²+1)"}]),
    q("(e⁵ˣ)' = ?",
      ["5e⁵ˣ","e⁵ˣ","5e⁵","e^5x·5x"], 0,
      "u=5x, u'=5, (eᵘ)'=5e⁵ˣ"),
    { type:"complete", xp:80, nextId:"g12-2-2", nextTitle:"lnx уламжлал" },
  ],
};

const g12_2_2: Lesson = {
  id:"g12-2-2", title:"y=lnx функцийн уламжлал", desc:"Логарифм функцийн уламжлал",
  levelColor:"#1D9E75", levelName:"12-р анги · Уламжлал II", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"🌱", title:"Логарифм функцийн уламжлал", subtitle:"12-р анги · Уламжлал II",
      body:"(lnx)'=1/x. Байгалийн логарифмийн уламжлал.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Логарифм функцийн уламжлал нь дифференциал тэгшитгэл, оновчлолын задлагад байнга хэрэглэгддэг.",
      willLearn:["(lnx)'=1/x томьёог хэрэглэх","Нийлмэл хувилбар (lnu)'=u'/u хэрэглэх","f'/f хэлбэрийн интегралтай холбох"],
      tip:"💡 Зөвлөгөө: (ln u)' авахдаа 'доторхийн уламжлалыг дорхноо хувааж тав' гэж бодоорой." },
    { type:"concept", title:"Томьёо ба нийлмэл", body:"Нийлмэл хувилбар: (lnu)'=u'/u.", formula:"(ln x)' = 1/x",
      bullets:[ bullet("🔑","(lnx)'=1/x"), bullet("🔗","(lnu)'=u'/u нийлмэл"), bullet("📐","(ln(x²))'=2x/x²=2/x"), bullet("📊","x>0 мужид тодорхой") ] },
    pred("(ln(3x))' = ?",
      ["1/x","3/x","1/(3x)","3lnx"], 0,
      "u=3x, u'=3, (lnu)'=u'/u=3/3x=1/x"),
    { type:"interactive", title:"y=lnx ба y=1/x", body:"Логарифм функц (ягаан) ба түүний уламжлал 1/x (ногоон).",
      graphType:"lnDeriv", sliders:[] },
    pred("(ln(x²+1))' = ?",
      ["2x/(x²+1)","1/(x²+1)","2x","ln(2x)"], 0,
      "u=x²+1, u'=2x, (lnu)'=2x/(x²+1)"),
    scaff("f(x)=ln(x²−3x+2)",
      [{question:"u=?",options:["x²−3x+2","x²−3","2x−3"],correct:0,hint:"нийлмэл дотоод функц"},
       {question:"u'=?",options:["2x−3","2x","x−3"],correct:0,hint:"(x²−3x+2)'=2x−3"},
       {question:"f'=u'/u=?",options:["(2x−3)/(x²−3x+2)","2x/(x²−3x+2)","1/u"],correct:0,hint:"f'=(2x−3)/(x²−3x+2)"}]),
    q("(ln(x³))' = ?",
      ["3/x","1/(3x)","3x²/x³","x³"], 0,
      "u=x³, u'=3x², (lnu)'=3x²/x³=3/x"),
    { type:"complete", xp:80, nextId:"g12-2-3", nextTitle:"sinx ба cosx уламжлал" },
  ],
};

const g12_2_3: Lesson = {
  id:"g12-2-3", title:"y=sinx ба y=cosx уламжлал", desc:"Тригонометрийн уламжлал",
  levelColor:"#1D9E75", levelName:"12-р анги · Уламжлал II", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"〜", title:"Тригонометрийн уламжлал", subtitle:"12-р анги · Уламжлал II",
      body:"(sinx)'=cosx, (cosx)'=−sinx. Тригонометрийн нийлмэл уламжлал.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Тригонометрийн уламжлал нь физикийн долгион, инженерийн дохио боловсруулалт, хөдөлгөөний тэгшитгэлд хэрэглэгддэг.",
      willLearn:["(sinx)'=cosx, (cosx)'=-sinx томьёог цээжлэх","Нийлмэл тригонометрийн уламжлал авах","Зураг дээрх шүргэгч шугамыг харж ойлгох"],
      tip:"💡 Зөвлөгөө: Синус ба косинус 'тойрч' уламжлагдана: sin→cos→-sin→-cos→sin..." },
    { type:"concept", title:"Томьёо ба нийлмэл", body:"(sinu)'=cosu·u' нийлмэл хувилбар.", formula:"(sin x)' = cos x,  (cos x)' = −sin x",
      bullets:[ bullet("📐","(sinx)'=cosx"), bullet("🔄","(cosx)'=−sinx"), bullet("🔗","(sinu)'=cosu·u'"), bullet("🔗","(cosu)'=−sinu·u'") ] },
    pred("(sin2x)' = ?",
      ["2cos2x","cos2x","−2sin2x","2sinx·cosx"], 0,
      "u=2x, u'=2, (sinu)'=cosu·u'=2cos2x"),
    { type:"interactive", title:"y=sinx ба y=cosx", body:"sinx (ягаан) функц ба түүний уламжлал cosx (ногоон).",
      graphType:"trigDeriv", sliders:[] },
    pred("(cos(x²))' = ?",
      ["−2x·sin(x²)","sin(x²)","−sin(x²)","2x·cos(x²)"], 0,
      "u=x², u'=2x, (cosu)'=−sinu·u'=−2x·sin(x²)"),
    scaff("f(x)=sin(x²+π)",
      [{question:"u=?",options:["x²+π","sinx","x²"],correct:0,hint:"нийлмэл: u=x²+π"},
       {question:"u'=?",options:["2x","2x+π","1"],correct:0,hint:"(x²+π)'=2x"},
       {question:"f'=?",options:["2x·cos(x²+π)","cos(x²+π)","−2x·sin(x²+π)"],correct:0,hint:"(sinu)'=cosu·u'=cos(x²+π)·2x"}]),
    q("(cos(3x))' = ?",
      ["−3sin(3x)","3cos(3x)","−sin(3x)","3sin(3x)"], 0,
      "u=3x, u'=3, (cosu)'=−sinu·u'=−3sin(3x)"),
    { type:"complete", xp:80, nextId:"g12-2-4", nextTitle:"tanx уламжлал" },
  ],
};

const g12_2_4: Lesson = {
  id:"g12-2-4", title:"y=tanx функцийн уламжлал", desc:"Tangent уламжлал, тодорхойлох муж",
  levelColor:"#1D9E75", levelName:"12-р анги · Уламжлал II", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"📐", title:"Tangent уламжлал", subtitle:"12-р анги · Уламжлал II",
      body:"(tanx)'=1/cos²x. tanx=sinx/cosx-ийн уламжлалаас гарна.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Tangent функцийн уламжлал нь физикийн налуу, оптикийн шинжилгээнд хэрэглэгддэг.",
      willLearn:["(tanx)'=1/cos²x томьёог гаргаж авах","Тодорхойлох мужийн хязгаарлалтыг ойлгох","Нийлмэл хувилбар (tanu)'=u'/cos²u хэрэглэх"],
      tip:"💡 Зөвлөгөө: tan нь sin/cos тул уламжлал авахдаа хуваарийн дүрмийг ашигладаг — тиймэс cos² гарч ирнэ." },
    { type:"concept", title:"Tangent уламжлал", body:"(tanu)'=u'/cos²u нийлмэл хувилбар.", formula:"(tan x)' = 1/cos²x = sec²x",
      bullets:[ bullet("🔑","(tanx)'=1/cos²x"), bullet("🔗","(tanu)'=u'/cos²u"), bullet("🚫","x=π/2+πn-д тодорхойгүй"), bullet("📐","cos²x+sin²x=1 холбоо") ] },
    pred("(tan5x)' = ?",
      ["5/cos²(5x)","1/cos²(5x)","5tanx","5"], 0,
      "u=5x, u'=5, (tanu)'=u'/cos²u=5/cos²(5x)"),
    { type:"interactive", title:"y=tanx ба y=1/cos²x", body:"Tangent функц (ягаан) ба түүний уламжлал (ногоон).",
      graphType:"tanDeriv", sliders:[] },
    pred("tanx хэзээ тодорхойгүй?",
      ["x=π/2+πn","x=0","x=π","x=πn"], 0,
      "cosx=0 үед tanx=sinx/cosx тодорхойгүй"),
    scaff("f(x) = tan(x²)",
      [{question:"u=?",options:["x²","tanx","2x"],correct:0,hint:"нийлмэл: u=x²"},
       {question:"u'=?",options:["2x","2","x"],correct:0,hint:"(x²)'=2x"},
       {question:"f'=?",options:["2x/cos²(x²)","1/cos²(x²)","2x·tan(x²)"],correct:0,hint:"f'=u'/cos²u=2x/cos²(x²)"}]),
    q("(tan(2x))' = ?",
      ["2/cos²(2x)","1/cos²(2x)","2tan(2x)","2/cos(2x)"], 0,
      "u=2x, u'=2, (tanu)'=2/cos²(2x)"),
    { type:"complete", xp:80 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE 12 — MODULE 3: ИНТЕГРАЛ II (#BA7517)
// ═══════════════════════════════════════════════════════════════════════════════

const g12_3_1: Lesson = {
  id:"g12-3-1", title:"Илтгэгч функцийн интеграл", desc:"∫eˣdx ба ∫aˣdx томьёо",
  levelColor:"#BA7517", levelName:"12-р анги · Интеграл II", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"🔋", title:"∫eˣ dx интеграл", subtitle:"12-р анги · Интеграл II",
      body:"∫eˣdx=eˣ+C. Экспоненциалийн интеграл нь өөрөө байдаг.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Экспоненциал интеграл нь цацраг задрал, дулаан дамжуулалт, хүүгийн тооцоонд хэрэглэгддэг.",
      willLearn:["∫eˣdx=eˣ+C томьёог ашиглах","Нийлмэл хэлбэр ∫e^(ax)dx=e^(ax)/a+C хэрэглэх","Тодорхой интегралыг e^x хэлбэрт тооцоолох"],
      tip:"💡 Зөвлөгөө: ∫e^(ax)dx авахдаа 'a-д хувааж тав' — 'a-аар үрж авсныг буцаана' гэж бодоорой." },
    { type:"concept", title:"Томьёонууд", body:"Экспоненциал болон зэрэглэлт функцийн интеграл.", formula:"∫eˣdx = eˣ + C",
      bullets:[ bullet("🔑","∫eˣdx=eˣ+C"), bullet("📐","∫eᵃˣdx=eᵃˣ/a+C"), bullet("📊","∫aˣdx=aˣ/lna+C"), bullet("🔗","нийлмэл u-орлуулга") ] },
    pred("∫e²ˣdx = ?",
      ["e²ˣ/2+C","e²ˣ+C","2e²ˣ+C","eˣ/2+C"], 0,
      "∫eᵃˣdx=eᵃˣ/a+C, a=2 → e²ˣ/2+C"),
    { type:"interactive", title:"y=eˣ антиуламжлал", body:"f(x)=eˣ (ногоон) ба F(x)=eˣ (ягаан) нь ижил.",
      graphType:"expIntegral", sliders:[] },
    pred("∫3ˣdx = ?",
      ["3ˣ/ln3+C","3ˣ+C","x·3ˣ+C","3ˣ·ln3+C"], 0,
      "∫aˣdx=aˣ/lna+C"),
    scaff("∫₀¹ e²ˣ dx",
      [{question:"Антиуламжлал?",options:["e²ˣ/2","e²ˣ","2e²ˣ"],correct:0,hint:"a=2, eᵃˣ/a=e²ˣ/2"},
       {question:"Дээд хил x=1?",options:["e²/2","e²","2e²"],correct:0,hint:"e^(2·1)/2=e²/2"},
       {question:"Хариу?",options:["(e²−1)/2","e²/2","e²−1"],correct:0,hint:"e²/2−e⁰/2=e²/2−1/2=(e²−1)/2"}]),
    q("∫e³ˣdx = ?",
      ["e³ˣ/3 + C","e³ˣ + C","3e³ˣ + C","e³ˣ/3"], 0,
      "∫eᵃˣdx=eᵃˣ/a+C, a=3 → e³ˣ/3+C"),
    { type:"complete", xp:80, nextId:"g12-3-2", nextTitle:"Тригонометрийн интеграл" },
  ],
};

const g12_3_2: Lesson = {
  id:"g12-3-2", title:"Тригонометрийн интеграл", desc:"∫sinx ба ∫cosx томьёо",
  levelColor:"#BA7517", levelName:"12-р анги · Интеграл II", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"〜", title:"∫sinx ба ∫cosx", subtitle:"12-р анги · Интеграл II",
      body:"∫sinxdx=−cosx+C, ∫cosxdx=sinx+C.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"Тригонометрийн интеграл нь долгионы энерги, Фурье задлагын суурь бөгөөд физикт маш чухал.",
      willLearn:["∫sinxdx=−cosx+C, ∫cosxdx=sinx+C цээжлэх","ax хэлбэрийн тригонометрийн интеграл бодох","Тодорхой интегралыг тригонометрт хэрэглэх"],
      tip:"💡 Зөвлөгөө: sin интеграл авахдаа '-cos' гарна — '-' тэмдгийг мартахгүй байгаарай." },
    { type:"concept", title:"Томьёонууд", body:"Синус ба косинусын интегралууд.", formula:"∫sin x dx = −cos x + C",
      bullets:[ bullet("🔑","∫sinxdx=−cosx+C"), bullet("📐","∫cosxdx=sinx+C"), bullet("📊","∫sin(ax)dx=−cos(ax)/a+C"), bullet("📊","∫cos(ax)dx=sin(ax)/a+C") ] },
    pred("∫cos3xdx = ?",
      ["sin3x/3+C","−sin3x/3+C","cos3x+C","3sin3x+C"], 0,
      "∫cos(ax)dx=sin(ax)/a+C, a=3"),
    { type:"interactive", title:"y=sinx ба −cosx", body:"sin (ногоон) функц ба антиуламжлал −cosx (ягаан).",
      graphType:"trigIntegral", sliders:[] },
    pred("∫₀^(π/2) sinx dx = ?",
      ["1","0","2","π/2"], 0,
      "[−cosx]₀^(π/2) = −cos(π/2)+cos(0) = 0+1 = 1"),
    scaff("∫₀^(π/2) cosx dx",
      [{question:"Антиуламжлал?",options:["sinx","−sinx","cosx"],correct:0,hint:"∫cosxdx=sinx+C"},
       {question:"Дээд хил sin(π/2)=?",options:["1","0","−1"],correct:0,hint:"sin(90°)=1"},
       {question:"Хариу?",options:["1","0","2"],correct:0,hint:"sin(π/2)−sin(0)=1−0=1"}]),
    q("∫sin2xdx = ?",
      ["−cos2x/2 + C","cos2x/2 + C","−sin2x + C","cos2x + C"], 0,
      "∫sin(ax)dx=−cos(ax)/a+C, a=2"),
    { type:"complete", xp:80, nextId:"g12-3-3", nextTitle:"Рациональ интеграл" },
  ],
};

const g12_3_3: Lesson = {
  id:"g12-3-3", title:"Рациональ функцийн интеграл", desc:"∫1/x = ln|x|+C томьёо",
  levelColor:"#BA7517", levelName:"12-р анги · Интеграл II", totalXp:80, duration:"8 мин",
  slides:[
    { type:"intro", emoji:"➗", title:"∫1/x интеграл", subtitle:"12-р анги · Интеграл II",
      body:"∫(1/x)dx=ln|x|+C — логарифм интегралын үндсэн томьёо.", xp:80, duration:"8 мин", questions:4,
      whyMatters:"∫1/x = ln|x|+C томьёо нь термодинамик, информатикийн алгоритм шинжилгээнд байнга гарч ирдэг.",
      willLearn:["∫1/x dx=ln|x|+C томьёог хэрэглэх","f'/f хэлбэрийн интегралыг ln болгох","u-орлуулгын аргыг практикт хэрэглэх"],
      tip:"💡 Зөвлөгөө: Хуваагдагч нь хуваагчийн уламжлал бол ln гарна — f'/f хэлбэрийг мэдрэж сур." },
    { type:"concept", title:"Томьёонууд", body:"f'(x)/f(x) хэлбэрийн интеграл логарифм гарна.", formula:"∫(1/x) dx = ln|x| + C",
      bullets:[ bullet("🔑","∫1/x dx=ln|x|+C"), bullet("🔗","∫f'/f dx=ln|f|+C"), bullet("📐","∫1/(ax+b)dx=ln|ax+b|/a+C"), bullet("📊","x≠0 мужид тодорхой") ] },
    pred("∫1/(x+3)dx = ?",
      ["ln|x+3|+C","1/(x+3)²+C","ln|x|+C","(x+3)²/2+C"], 0,
      "∫1/(ax+b)dx=ln|ax+b|/a+C, a=1"),
    { type:"interactive", title:"y=1/x ба y=ln|x|", body:"1/x функц (ногоон) ба антиуламжлал ln|x| (ягаан).",
      graphType:"rationalIntegral", sliders:[] },
    pred("∫2x/(x²+1)dx = ?",
      ["ln(x²+1)+C","2ln|x|+C","1/(x²+1)+C","arctan(x)+C"], 0,
      "f=x²+1, f'=2x → ∫f'/f dx = ln|f| + C"),
    scaff("∫3x²/(x³+1)dx",
      [{question:"u=?",options:["x³+1","3x²","x³"],correct:0,hint:"хуваагч u=x³+1"},
       {question:"u'=?",options:["3x²","3x","x²"],correct:0,hint:"(x³+1)'=3x²"},
       {question:"∫u'/u dx=?",options:["ln|x³+1|+C","ln|3x²|+C","3ln|x|+C"],correct:0,hint:"∫u'/u=ln|u|+C=ln|x³+1|+C"}]),
    q("∫1/(2x)dx = ?",
      ["ln|x|/2 + C","ln|2x| + C","1/(2x²) + C","2ln|x| + C"], 0,
      "∫1/(ax)dx=ln|x|/a+C, a=2"),
    { type:"complete", xp:80 },
  ],
};

// ─── Export ───────────────────────────────────────────────────────────────────
const ALL_LESSONS: Lesson[] = [
  fn1, fn2, fn3, g11_1_4, g11_1_5, g11_1_6,
  g11_2_1, g11_2_2, g11_2_3,
  g11_3_1, g11_3_2, g11_3_3, g11_3_4,
  g11_4_1, g11_4_2, g11_4_3,
  g12_1_1, g12_1_2, g12_1_3, g12_1_4,
  g12_2_1, g12_2_2, g12_2_3, g12_2_4,
  g12_3_1, g12_3_2, g12_3_3,
];

export const LESSONS: Record<string, Lesson> = Object.fromEntries(ALL_LESSONS.map((l) => [l.id, l]));

// legacy alias
LESSONS["fn-4"] = { ...g11_1_4, id:"fn-4" };

export const GRADE11_MODULES = [
  { id:"g11-m1", color:"#7F77DD", icon:"f(x)", name:"Функц ба График",
    lessons:[fn1,fn2,fn3,g11_1_4,g11_1_5,g11_1_6] },
  { id:"g11-m2", color:"#D85A30", icon:"θ", name:"Тригонометр",
    lessons:[g11_2_1,g11_2_2,g11_2_3] },
  { id:"g11-m3", color:"#1D9E75", icon:"∂", name:"Уламжлал",
    lessons:[g11_3_1,g11_3_2,g11_3_3,g11_3_4] },
  { id:"g11-m4", color:"#BA7517", icon:"∫", name:"Интеграл",
    lessons:[g11_4_1,g11_4_2,g11_4_3] },
];

export const GRADE12_MODULES = [
  { id:"g12-m1", color:"#7F77DD", icon:"ln", name:"Функц II",
    lessons:[g12_1_1,g12_1_2,g12_1_3,g12_1_4] },
  { id:"g12-m2", color:"#1D9E75", icon:"∂²", name:"Уламжлал II",
    lessons:[g12_2_1,g12_2_2,g12_2_3,g12_2_4] },
  { id:"g12-m3", color:"#BA7517", icon:"∫∫", name:"Интеграл II",
    lessons:[g12_3_1,g12_3_2,g12_3_3] },
];

export const LESSON_STATE: Record<string, "completed"|"unlocked"|"locked"> = {
  "fn-1":"completed", "fn-2":"completed", "fn-3":"unlocked",
};

export function getLessonState(id: string): "completed"|"unlocked" {
  return (LESSON_STATE[id] === "completed") ? "completed" : "unlocked";
}

export const LEVEL1_LESSONS = [fn1, fn2, fn3, g11_1_4];

// keep legacy worked/step helpers for any callers
export const workedHelper = (problem:string, steps:Step[]): Slide => ({ type:"worked", problem, steps });
export { step };
