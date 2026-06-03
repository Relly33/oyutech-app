import type { GraphVariant } from "@/components/GraphCanvas";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Bullet  { icon: string; text: string; }
export interface Step    { label: string; body: string; formula?: string; }
export interface LessonQuizQ {
  text: string; options: [string,string,string,string]; correct: 0|1|2|3;
  explanation: string; xp: number;
}
export type SliderKey = "a" | "b" | "h" | "k" | "angle" | "n";

export type Slide =
  | { type:"intro";       emoji:string; title:string; subtitle:string; body:string; xp:number; duration:string; questions:number }
  | { type:"concept";     title:string; body:string; formula?:string; bullets:Bullet[] }
  | { type:"interactive"; title:string; body:string; graphType?:GraphVariant; sliders:SliderKey[]; initA?:number; initB?:number; initH?:number; initK?:number; initAngle?:number; initN?:number }
  | { type:"quiz";        q:LessonQuizQ }
  | { type:"worked";      problem:string; steps:Step[] }
  | { type:"complete";    xp:number; nextId?:string; nextTitle?:string };

export interface Lesson {
  id:string; title:string; desc:string; levelColor:string; levelName:string;
  totalXp:number; duration:string; slides:Slide[];
}

// ─── Helper shortcuts ─────────────────────────────────────────────────────────
const q = (text:string, options:[string,string,string,string], correct:0|1|2|3, explanation:string, xp=20): Slide =>
  ({ type:"quiz", q:{ text, options, correct, explanation, xp } });

const worked = (problem:string, steps:Step[]): Slide => ({ type:"worked", problem, steps });
const step   = (label:string, body:string, formula?:string): Step => ({ label, body, formula });
const bullet = (icon:string, text:string): Bullet => ({ icon, text });

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE 11 — MODULE 1: ФУНКЦ БА ГРАФИК (#7F77DD)
// ═══════════════════════════════════════════════════════════════════════════════

const fn1: Lesson = {
  id:"fn-1", title:"Квадрат функц", desc:"Параболын стандарт хэлбэр, оройн цэг, нарийсалт",
  levelColor:"#7F77DD", levelName:"11-р анги · Функц", totalXp:100, duration:"12 мин",
  slides:[
    { type:"intro", emoji:"📈", title:"Квадрат функц", subtitle:"11-р анги · Функц",
      body:"f(x) = a(x−h)² + k томъёо нь параболын байршил ба хэлбэрийг бүрэн тодорхойлдог.", xp:100, duration:"12 мин", questions:2 },
    { type:"concept", title:"Стандарт хэлбэр", body:"Гурван коэффициент нь параболын бүх шинж чанарыг тодорхойлно.", formula:"f(x) = a(x − h)² + k",
      bullets:[ bullet("🔴","(h, k): оройн цэг"), bullet("📐","a > 0 → дээш (U), a < 0 → доош (∩)"), bullet("📏","|a| их → парабол нарийсдана") ] },
    { type:"interactive", title:"a коэффициентийг турших", body:"a-г өөрчлөн нарийсалт, чиглэлийг харцгаая.", graphType:"quadratic", sliders:["a"], initA:1,initH:0,initK:0 },
    { type:"interactive", title:"h ба k утгуудыг турших", body:"h → хэвтээ, k → босоо шилжилт.", graphType:"quadratic", sliders:["h","k"], initA:1,initH:0,initK:0 },
    q("f(x) = 2(x−3)²+1 функцийн оройн цэг?",["(3,1)","(−3,1)","(3,−1)","(−3,−1)"],0,"h=3, k=1 тул оройн цэг (3,1)."),
    q("y = −(x+2)²−4 парабол аль тийш нээлттэй?",["Дээш","Доош","Баруун","Зүүн"],1,"a=−1<0 тул доош нээлттэй."),
    worked("f(x) = −3(x+2)²+5 оройн цэг, чиглэл, утгын мужийг ол.",
      [step("1. Коэффициентүүд","x+2=x−(−2) → h=−2","a=−3, h=−2, k=5"),
       step("2. Оройн цэг","Оройн цэг (h,k)","(−2, 5)"),
       step("3. Утгын муж","a=−3<0 → доош → дээд утга","y ≤ 5")]),
    { type:"complete", xp:100, nextId:"fn-2", nextTitle:"Шугаман функц" },
  ],
};

const fn2: Lesson = {
  id:"fn-2", title:"Шугаман функц", desc:"Налуу ба y-тэнхлэгтэй огтлолцол",
  levelColor:"#7F77DD", levelName:"11-р анги · Функц", totalXp:80, duration:"10 мин",
  slides:[
    { type:"intro", emoji:"📏", title:"Шугаман функц", subtitle:"11-р анги · Функц",
      body:"y = ax + b — шулуун шугамын стандарт хэлбэр. a налуу, b y-огтлол.", xp:80, duration:"10 мин", questions:2 },
    { type:"concept", title:"Налуу ба огтлолцол", body:"a ба b хоёр параметр шулуунийг бүрэн тодорхойлно.", formula:"y = ax + b",
      bullets:[ bullet("📈","a > 0 → өсөх"), bullet("📉","a < 0 → буурах"), bullet("➡️","a = 0 → тогтмол"), bullet("📍","b: y-тэнхлэгтэй огтлол") ] },
    { type:"interactive", title:"a (налуу) өөрчлөх", body:"a утгыг гулгуур ашиглан өөрчилцгөөе.", graphType:"linear", sliders:["a"], initA:1,initB:0 },
    { type:"interactive", title:"b (y-огтлол) өөрчлөх", body:"b утга шулуунийг дээш/доош шилжүүлнэ.", graphType:"linear", sliders:["b"], initA:2,initB:0 },
    q("y=2x+3 функцийн налуу?",["2","3","−2","5"],0,"y=ax+b томьёонд a нь налуу, a=2."),
    q("a<0 үед функц ямар байдаг?",["Өсөх","Буурах","Тогтмол","Тодорхойгүй"],1,"a<0 бол баруунаас зүүн тийш буурна."),
    worked("y=−2x+4 налуу, y-огтлол, x-огтлол ол.",
      [step("1. Налуу","a=−2","налуу = −2"),
       step("2. y-огтлол","b=4 → (0,4)","(0, 4)"),
       step("3. x-огтлол","0=−2x+4 → x=2","(2, 0)")]),
    { type:"complete", xp:80, nextId:"fn-3", nextTitle:"Абсолют утга" },
  ],
};

const fn3: Lesson = {
  id:"fn-3", title:"Абсолют утга", desc:"V хэлбэрийн график, утгын муж",
  levelColor:"#7F77DD", levelName:"11-р анги · Функц", totalXp:120, duration:"15 мин",
  slides:[
    { type:"intro", emoji:"🔺", title:"Абсолют утга функц", subtitle:"11-р анги · Функц",
      body:"f(x) = a|x−h|+k нь V хэлбэрийн графиктай. Коэффициентүүд нь хэлбэр, байршлыг тодорхойлно.", xp:120, duration:"15 мин", questions:2 },
    { type:"concept", title:"V хэлбэр яагаад үүсдэг?", body:"Абсолют утга сөрөг тоог эерэг болгодог тул x-тэнхлэгт тэгш хэмтэй.", formula:"f(x) = a|x − h| + k",
      bullets:[ bullet("📍","(h,k) оройн цэг"), bullet("🔄","a<0 → ∧ хэлбэр"), bullet("📐","|a|>1 нарийсна") ] },
    { type:"interactive", title:"a коэффициентийг турших", body:"a-г өөрчлөн V-ийн нарийсалт, чиглэлийг харцгаая.", graphType:"absolute", sliders:["a"], initA:1,initH:0,initK:0 },
    { type:"interactive", title:"h ба k: шилжилт", body:"V-ийн оройн байршлыг тохируулцгаая.", graphType:"absolute", sliders:["h","k"], initA:1,initH:0,initK:0 },
    q("y=|x−5|+2 утгын муж?",["y≥2","y≤2","y≥5","Бүх бодит"],0,"|x−5|≥0 тул y≥2."),
    q("f(x)=−2|x−1|+5 дээд утга?",["5","−1","1","−2"],0,"x=1-д хамгийн их утга 5.",30),
    worked("f(x)=2|x−3|+1 орой, утгын мужийг ол.",
      [step("1. Коэффициентүүд","a=2, h=3, k=1","a=2, h=3, k=1"),
       step("2. Оройн цэг","Орой (h,k)","(3, 1)"),
       step("3. Утгын муж","a=2>0 → дээш → доод утга k","y ≥ 1")]),
    { type:"complete", xp:120, nextId:"g11-1-4", nextTitle:"Давхар функц" },
  ],
};

const g11_1_4: Lesson = {
  id:"g11-1-4", title:"Давхар функц", desc:"f(g(x)) нийлмэл функц, тэмдэглэл ба тооцоолол",
  levelColor:"#7F77DD", levelName:"11-р анги · Функц", totalXp:100, duration:"14 мин",
  slides:[
    { type:"intro", emoji:"🔗", title:"Давхар функц", subtitle:"11-р анги · Функц",
      body:"(f∘g)(x)=f(g(x)) — нэг функцийн үр дүнг нөгөөдөө оруулах үйлдэл.", xp:100, duration:"14 мин", questions:2 },
    { type:"concept", title:"Нийлмэл функц", body:"g(x) эхлээд тооцоологдоно, дараа f-д орно.", formula:"(f∘g)(x) = f(g(x))",
      bullets:[ bullet("1️⃣","Дотоод функц g(x) эхлээд"), bullet("2️⃣","Дараа f хэрэглэнэ"), bullet("📝","f∘g ≠ g∘f (ерөнхийдөө)") ] },
    { type:"interactive", title:"Нийлмэл функцийг харах", body:"g(x)=x²+1, f(x)=2x−1, f(g(x))=2x²+1 гурвыг харцгаая.", graphType:"composite", sliders:[], initA:1 },
    q("f(x)=2x+1, g(x)=x². f(g(2))=?",["9","5","8","3"],0,"g(2)=4, f(4)=9.",20),
    q("f(x)=x+3, g(x)=2x. (f∘g)(x)=?",["2x+3","2x","x+3","3x"],0,"f(g(x))=f(2x)=2x+3.",20),
    worked("f(x)=x²−1, g(x)=3x+2. (f∘g)(1) ол.",
      [step("1. g(1)","g(1)=3·1+2","g(1) = 5"),
       step("2. f(g(1))=f(5)","f(5)=5²−1","f(5) = 24"),
       step("3. Хариу","","(f∘g)(1) = 24")]),
    { type:"complete", xp:100, nextId:"g11-1-5", nextTitle:"Урвуу функц" },
  ],
};

const g11_1_5: Lesson = {
  id:"g11-1-5", title:"Урвуу функц", desc:"f⁻¹(x) тодорхойлолт, y=x тэгш хэм",
  levelColor:"#7F77DD", levelName:"11-р анги · Функц", totalXp:100, duration:"14 мин",
  slides:[
    { type:"intro", emoji:"🔄", title:"Урвуу функц", subtitle:"11-р анги · Функц",
      body:"f(f⁻¹(x))=x — урвуу функц нь оролт/гаралтыг сольдог.", xp:100, duration:"14 мин", questions:2 },
    { type:"concept", title:"Урвуу функц", body:"x ба y-г сольж, y-р шийдвэл урвуу функц гарна.", formula:"f(f⁻¹(x)) = x",
      bullets:[ bullet("🔁","x, y-г сольно"), bullet("📐","График нь y=x-тай тэгш хэмтэй"), bullet("✅","Зөвхөн нэг-нэгтийн функц") ] },
    { type:"interactive", title:"f ба f⁻¹ харицуулах", body:"y=ax+2 ба урвуу нь, y=x тэгш хэмийн шулуун.", graphType:"inverse", sliders:["a"], initA:2 },
    q("f(x)=3x−6 урвуу?",["f⁻¹(x)=(x+6)/3","f⁻¹(x)=3x+6","f⁻¹(x)=x/3","f⁻¹(x)=x−6"],0,"y=3x−6→x=(y+6)/3."),
    q("Урвуу функцийн график ямар шулуунтай тэгш хэмтэй?",["y=x","y=0","x=0","y=x+1"],0,"f ба f⁻¹ нь y=x-тай тэгш хэмтэй."),
    worked("f(x)=2x+4 урвуу ол, f⁻¹(3) тооцоол.",
      [step("1. y=2x+4 → x шийд","x=(y−4)/2","f⁻¹(x)=(x−4)/2"),
       step("2. f⁻¹(3) тооцоол","(3−4)/2=−0.5","f⁻¹(3) = −0.5")]),
    { type:"complete", xp:100, nextId:"g11-1-6", nextTitle:"Өсөх ба буурах" },
  ],
};

const g11_1_6: Lesson = {
  id:"g11-1-6", title:"Өсөх ба буурах функц", desc:"Өсөх/буурах интервал, тодорхойлолт",
  levelColor:"#7F77DD", levelName:"11-р анги · Функц", totalXp:110, duration:"15 мин",
  slides:[
    { type:"intro", emoji:"📉", title:"Өсөх ба буурах функц", subtitle:"11-р анги · Функц",
      body:"Функцийн графикт зүүнээс баруун тийш өсөх ба буурах интервалыг тодорхойлно.", xp:110, duration:"15 мин", questions:2 },
    { type:"concept", title:"Тодорхойлолт", body:"x₁<x₂ үед утгуудын харьцаагаар өсөх/буурахыг тодорхойлно.", formula:"x₁ < x₂  ⟹  f(x₁) < f(x₂)  (өсөх)",
      bullets:[ bullet("🟢","f(x₁)<f(x₂) → өсөх"), bullet("🔴","f(x₁)>f(x₂) → буурах"), bullet("📐","График: зүүн→баруун өсвөл өсөх") ] },
    { type:"interactive", title:"Өсөх/буурах интервал", body:"f(x)=x³−3x функцийн ногоон (өсөх) ба улаан (буурах) интервалуудыг харцгаая.", graphType:"growth", sliders:[] },
    q("f(x)=x² функц хаана буурдаг?",["x<0","x>0","x<1","Буурдаггүй"],0,"Парабол x=0-с зүүн талд буурна."),
    q("Өсөх функцийн тодорхойлолт?",["x₁<x₂ → f(x₁)<f(x₂)","x₁<x₂ → f(x₁)>f(x₂)","f(x)>0","f'(x)=0"],0,"Энэ бол математикийн нарийн тодорхойлолт."),
    worked("f(x)=x²−4x+3 өсөх, буурах интервал ол.",
      [step("1. Уламжлал","f'(x)=2x−4","f'(x) = 2x − 4"),
       step("2. f'(x)=0","2x−4=0 → x=2","шүүмжлэлт цэг x = 2"),
       step("3. Интервал","x<2 буурах, x>2 өсөх","(−∞,2) буурах · (2,+∞) өсөх")]),
    { type:"complete", xp:110, nextId:"g11-2-1", nextTitle:"Нэгж тойрог" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE 11 — MODULE 2: ТРИГОНОМЕТР (#D85A30)
// ═══════════════════════════════════════════════════════════════════════════════

const g11_2_1: Lesson = {
  id:"g11-2-1", title:"Нэгж тойрог", desc:"Радиан хэмжээ, нэгж тойрог дээрх цэг",
  levelColor:"#D85A30", levelName:"11-р анги · Тригонометр", totalXp:120, duration:"15 мин",
  slides:[
    { type:"intro", emoji:"⭕", title:"Нэгж тойрог", subtitle:"11-р анги · Тригонометр",
      body:"Нэгж тойрог дээрх цэгийн координат нь (cos θ, sin θ) байдаг.", xp:120, duration:"15 мин", questions:2 },
    { type:"concept", title:"Радиан ба градус", body:"Өнцгийг радианаар хэмжинэ. 2π радиан = 360°.", formula:"π радиан = 180°",
      bullets:[ bullet("⭕","Нэгж тойргийн радиус = 1"), bullet("📐","360° = 2π радиан"), bullet("📍","Цэгийн координат: (cosθ, sinθ)") ] },
    { type:"interactive", title:"Өнцгийг тойрог дээр харах", body:"θ өнцгийг өөрчлөн sin, cos утгыг бодит цагт харцгаая.", graphType:"unitCircle", sliders:["angle"], initAngle:45 },
    q("180° хэд радиан?",["π","2π","π/2","π/4"],0,"180°=π радиан."),
    q("sin(90°)=?",["1","0","−1","√2/2"],0,"90°-д цэг (0,1), sin=1."),
    worked("270° радианд хөрвүүл, sin, cos ол.",
      [step("1. Хөрвүүлэх","270°×(π/180)","3π/2 радиан"),
       step("2. Цэг","3π/2-д цэг (0,−1)","cos=0, sin=−1")]),
    { type:"complete", xp:120, nextId:"g11-2-2", nextTitle:"Тригонометрийн утгууд" },
  ],
};

const g11_2_2: Lesson = {
  id:"g11-2-2", title:"Тригонометрийн утгууд", desc:"Гол өнцгүүдийн sin, cos, tan утга",
  levelColor:"#D85A30", levelName:"11-р анги · Тригонометр", totalXp:110, duration:"14 мин",
  slides:[
    { type:"intro", emoji:"📐", title:"Тригонометрийн утгууд", subtitle:"11-р анги · Тригонометр",
      body:"Гол өнцгүүдийн sin, cos, tan утгыг цээжилж, хэрэглэж сурцгаая.", xp:110, duration:"14 мин", questions:2 },
    { type:"concept", title:"Үндсэн утгуудын хүснэгт", body:"sin, cos, tan утгыг томьёо ба нэгж тойргоор тодорхойлно.", formula:"tan x = sin x / cos x",
      bullets:[ bullet("0°","sin=0, cos=1, tan=0"), bullet("30°","sin=½, cos=√3/2"), bullet("45°","sin=cos=√2/2, tan=1"), bullet("90°","sin=1, cos=0") ] },
    { type:"interactive", title:"sin, cos графикууд", body:"θ-г өөрчлөн sin (ягаан) ба cos (ногоон) утгыг харцгаая.", graphType:"trigValues", sliders:["angle"], initAngle:45 },
    q("cos(60°)=?",["½","√3/2","1","0"],0,"Стандарт утга: cos(60°)=0.5."),
    q("tan(45°)=?",["1","0","√2","√3"],0,"tan(45°)=sin(45°)/cos(45°)=1."),
    worked("sin(150°) ол.",
      [step("1. Хувирал","150°=180°−30°","sin(180°−x)=sin(x)"),
       step("2. Утга","sin(30°)=½","sin(150°) = ½")]),
    { type:"complete", xp:110, nextId:"g11-2-3", nextTitle:"Тригонометрийн адилтгал" },
  ],
};

const g11_2_3: Lesson = {
  id:"g11-2-3", title:"Тригонометрийн адилтгал", desc:"Үндсэн адилтгал sin²+cos²=1",
  levelColor:"#D85A30", levelName:"11-р анги · Тригонометр", totalXp:120, duration:"15 мин",
  slides:[
    { type:"intro", emoji:"🔁", title:"Тригонометрийн адилтгал", subtitle:"11-р анги · Тригонометр",
      body:"sin²x+cos²x=1 нь хамгийн чухал тригонометрийн адилтгал.", xp:120, duration:"15 мин", questions:2 },
    { type:"concept", title:"Үндсэн адилтгалууд", body:"Нэгж тойргийн Пифагорын теорем.", formula:"sin²x + cos²x = 1",
      bullets:[ bullet("🔑","sin²x+cos²x=1 үндсэн"), bullet("🔗","tan x = sin x / cos x"), bullet("✨","sin(2x) = 2sinx·cosx") ] },
    { type:"interactive", title:"sin²x + cos²x = 1", body:"Хоёр функцийн квадратын нийлбэр үргэлж 1 байгааг харцгаая.", graphType:"identity", sliders:[] },
    q("sin²x + cos²x = ?",["1","0","2","x"],0,"Энэ бол тригонометрийн үндсэн адилтгал."),
    q("sin(2x) = ?",["2sinx·cosx","2sin²x","cos²x","sinx+cosx"],0,"Давхаргын томьёо."),
    worked("sin(x)=3/5 (1-р улирал), cos(x) ол.",
      [step("1. Адилтгал","sin²x+cos²x=1","cos²x=1−9/25=16/25"),
       step("2. cos(x)","x 1-р улиралд → cos>0","cos(x) = 4/5")]),
    { type:"complete", xp:120, nextId:"g11-3-1", nextTitle:"Шүргэгч шугам" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE 11 — MODULE 3: УЛАМЖЛАЛ (#1D9E75)
// ═══════════════════════════════════════════════════════════════════════════════

const g11_3_1: Lesson = {
  id:"g11-3-1", title:"Шүргэгч шугам", desc:"Уламжлалын ойлголт, шүргэгч шугамын налуу",
  levelColor:"#1D9E75", levelName:"11-р анги · Уламжлал", totalXp:110, duration:"14 мин",
  slides:[
    { type:"intro", emoji:"📈", title:"Шүргэгч шугам ба уламжлал", subtitle:"11-р анги · Уламжлал",
      body:"Уламжлал нь функцийн тухайн цэгийн өөрчлөлтийн хурдыг илэрхийлдэг.", xp:110, duration:"14 мин", questions:2 },
    { type:"concept", title:"Уламжлалын тодорхойлолт", body:"Хязгаараар тодорхойлогдоно. Геометр утга: шүргэгч налуу.", formula:"f'(x) = lim[h→0] (f(x+h)−f(x))/h",
      bullets:[ bullet("📐","Шүргэгч шугамын налуу"), bullet("⚡","Тухайн цэгийн өөрчлөлтийн хурд"), bullet("🔬","f'(x) ба dy/dx тэмдэглэл") ] },
    { type:"interactive", title:"Шүргэгч шугам харах", body:"h=x цэгт f(x)=x² функцийн шүргэгч шугамыг харцгаая.", graphType:"tangentLine", sliders:["h"], initH:1 },
    q("f(x)=x² уламжлал?",["2x","x²","2","x"],0,"Хүчний дүрмээр (x²)'=2x."),
    q("Шүргэгч шугам юуг илэрхийлдэг?",["Тухайн цэгийн налуу","Графикийн талбай","Функцийн утга","Тэнхлэг"],0,"Шүргэгч налуу = уламжлалын утга."),
    worked("f(x)=x²+2x, x=1-д шүргэгч тэгшитгэл ол.",
      [step("1. Уламжлал","f'(x)=2x+2","f'(1)=4"),
       step("2. Цэг","f(1)=3","цэг (1,3)"),
       step("3. Тэгшитгэл","y−3=4(x−1)","y = 4x − 1")]),
    { type:"complete", xp:110, nextId:"g11-3-2", nextTitle:"Уламжлалын дүрмүүд" },
  ],
};

const g11_3_2: Lesson = {
  id:"g11-3-2", title:"Уламжлалын дүрмүүд", desc:"Хүчний, нийлбэр, үржвэр, гинжин дүрэм",
  levelColor:"#1D9E75", levelName:"11-р анги · Уламжлал", totalXp:120, duration:"16 мин",
  slides:[
    { type:"intro", emoji:"📋", title:"Уламжлалын дүрмүүд", subtitle:"11-р анги · Уламжлал",
      body:"Үндсэн 5 дүрэм мэдэхэд дурын функцийн уламжлалыг бодож чадна.", xp:120, duration:"16 мин", questions:2 },
    { type:"concept", title:"Үндсэн дүрмүүд", body:"Нийлмэл, үржвэр, хуваарийн дүрмүүдийг хэрэглэнэ.", formula:"(xⁿ)' = nxⁿ⁻¹",
      bullets:[ bullet("1️⃣","(c)'=0 тогтмол"), bullet("2️⃣","(xⁿ)'=nxⁿ⁻¹ хүч"), bullet("3️⃣","(f+g)'=f'+g'"), bullet("4️⃣","(fg)'=f'g+fg'") ] },
    { type:"interactive", title:"f(x)=axⁿ ба f'(x)", body:"a-г өөрчлөн f(x) ба f'(x) хоёуланг харцгаая.", graphType:"derivRules", sliders:["a"], initA:1 },
    q("f(x)=x³ уламжлал?",["3x²","x³","3x","x²"],0,"(xⁿ)'=nxⁿ⁻¹, n=3 → 3x²."),
    q("f(x)=5x²+3x уламжлал?",["10x+3","5x+3","10x","5x²+3"],0,"(5x²)'=10x, (3x)'=3."),
    worked("f(x)=(2x+1)(x²−3) үржвэрийн дүрмээр уламжлал ол.",
      [step("1. Дүрэм","(fg)'=f'g+fg'","f=2x+1, g=x²−3"),
       step("2. Тооцоол","(2)(x²−3)+(2x+1)(2x)","2x²−6+4x²+2x"),
       step("3. Хялбарчил","","6x²+2x−6")]),
    { type:"complete", xp:120, nextId:"g11-3-3", nextTitle:"Нийлбэрийн уламжлал" },
  ],
};

const g11_3_3: Lesson = {
  id:"g11-3-3", title:"Нийлбэр ба полином уламжлал", desc:"Гишүүн бүрт хэрэглэх арга",
  levelColor:"#1D9E75", levelName:"11-р анги · Уламжлал", totalXp:110, duration:"14 мин",
  slides:[
    { type:"intro", emoji:"➕", title:"Нийлбэр ба полином", subtitle:"11-р анги · Уламжлал",
      body:"Полиномын уламжлал авахдаа гишүүн бүрт тусад нь хэрэглэнэ.", xp:110, duration:"14 мин", questions:2 },
    { type:"concept", title:"Нийлбэрийн дүрэм", body:"Тус тусад нь уламжлал авч нэмнэ.", formula:"(f + g)' = f' + g'",
      bullets:[ bullet("✅","Гишүүн бүрт тусад нь"), bullet("📝","(3x²+2x−1)'=6x+2"), bullet("🔑","(cf)'=cf'") ] },
    { type:"interactive", title:"Полином ба уламжлал", body:"a-г өөрчлөн f(x)=ax³−3x ба f'(x)=3ax²−3 харцгаая.", graphType:"polyDeriv", sliders:["a"], initA:1 },
    q("f(x)=3x²+2x+1 уламжлал?",["6x+2","3x+2","6x+1","2x+2"],0,"(3x²)'=6x, (2x)'=2, (1)'=0."),
    q("f(x)=x⁴−x² уламжлал?",["4x³−2x","4x³","2x","x³−x"],0,"Хүчний дүрмийг гишүүн бүрт хэрэглэнэ."),
    worked("f(x)=2x³−3x²+x−5, f'(2) ол.",
      [step("1. Уламжлал","f'(x)=6x²−6x+1","f'(x) = 6x²−6x+1"),
       step("2. x=2","f'(2)=24−12+1","f'(2) = 13")]),
    { type:"complete", xp:110, nextId:"g11-3-4", nextTitle:"Функцийн экстремум" },
  ],
};

const g11_3_4: Lesson = {
  id:"g11-3-4", title:"Функцийн экстремум", desc:"Максимум, минимум цэг олох",
  levelColor:"#1D9E75", levelName:"11-р анги · Уламжлал", totalXp:130, duration:"16 мин",
  slides:[
    { type:"intro", emoji:"🏔️", title:"Функцийн экстремум", subtitle:"11-р анги · Уламжлал",
      body:"f'(x)=0 болох цэгт максимум эсвэл минимум байж болно.", xp:130, duration:"16 мин", questions:2 },
    { type:"concept", title:"Шүүмжлэлт цэг ба экстремум", body:"Уламжлалыг ашиглан экстремумыг тодорхойлно.", formula:"f'(x) = 0  →  шүүмжлэлт цэг",
      bullets:[ bullet("📍","f'(x)=0 шүүмжлэлт цэг"), bullet("🏔️","f'(+→−) максимум"), bullet("🏞️","f'(−→+) минимум"), bullet("📐","f''<0 максимум, f''>0 минимум") ] },
    { type:"interactive", title:"Максимум ба минимум", body:"f(x)=x³−3x функцийн экстремум цэгүүдийг харцгаая.", graphType:"extremum", sliders:[] },
    q("f'(x)=0 гэдэг нь?",["Шүүмжлэлт цэг","Хамгийн их утга","График нэмэгдэх","Нулимс"],0,"Уламжлал тэгтэй тэнцэх цэг."),
    q("f(x)=x²−4x+3 хамгийн бага утга?",["x=2","x=0","x=4","x=1"],0,"f'(x)=2x−4=0 → x=2."),
    worked("f(x)=x³−3x²−9x+5 экстремум ол.",
      [step("1. Уламжлал","f'(x)=3x²−6x−9","f'(x)=3x²−6x−9"),
       step("2. f'(x)=0","3x²−6x−9=0 → x=3, x=−1","x=3 ба x=−1"),
       step("3. Шалгах","f''(3)=12>0 → мин, f''(−1)=−12<0 → макс","x=−1 максимум · x=3 минимум")]),
    { type:"complete", xp:130, nextId:"g11-4-1", nextTitle:"Антиуламжлал" },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE 11 — MODULE 4: ИНТЕГРАЛ (#BA7517)
// ═══════════════════════════════════════════════════════════════════════════════

const g11_4_1: Lesson = {
  id:"g11-4-1", title:"Антиуламжлал ба тодорхойгүй интеграл", desc:"Уламжлалын урвуу үйлдэл",
  levelColor:"#BA7517", levelName:"11-р анги · Интеграл", totalXp:110, duration:"14 мин",
  slides:[
    { type:"intro", emoji:"∫", title:"Антиуламжлал", subtitle:"11-р анги · Интеграл",
      body:"Интеграл нь уламжлалын урвуу үйлдэл — F'(x)=f(x) тул F нь f-ийн антиуламжлал.", xp:110, duration:"14 мин", questions:2 },
    { type:"concept", title:"Тодорхойгүй интеграл", body:"F'(x)=f(x) болох F(x)-ийг олох.", formula:"∫f(x)dx = F(x) + C",
      bullets:[ bullet("🔑","F'(x)=f(x) → F антиуламжлал"), bullet("C","C интегралчлалын тогтмол"), bullet("📐","∫xⁿdx = xⁿ⁺¹/(n+1)+C") ] },
    { type:"interactive", title:"f(x) ба F(x) харах", body:"f(x)=2x (ногоон) ба F(x)=x² (ягаан) хоёуланг харцгаая.", graphType:"antideriv", sliders:[] },
    q("∫x²dx=?",["x³/3+C","x³+C","2x+C","x²+C"],0,"∫xⁿdx=xⁿ⁺¹/(n+1)+C, n=2."),
    q("∫5dx=?",["5x+C","5+C","x+C","0"],0,"∫cdx=cx+C."),
    worked("∫(3x²+2x−1)dx ол.",
      [step("1. Гишүүн бүр","тус тусад нь интеграл","3·x³/3+2·x²/2−x+C"),
       step("2. Хялбарчил","","x³+x²−x+C")]),
    { type:"complete", xp:110, nextId:"g11-4-2", nextTitle:"Риманы нийлбэр" },
  ],
};

const g11_4_2: Lesson = {
  id:"g11-4-2", title:"Риманы нийлбэр", desc:"Талбайг тэгш өнцөгтөөр тооцоолох",
  levelColor:"#BA7517", levelName:"11-р анги · Интеграл", totalXp:120, duration:"15 мин",
  slides:[
    { type:"intro", emoji:"📊", title:"Риманы нийлбэр", subtitle:"11-р анги · Интеграл",
      body:"Муруйн доорх талбайг тэгш өнцөгтүүдийн нийлбэрээр тооцоолно.", xp:120, duration:"15 мин", questions:2 },
    { type:"concept", title:"Тодорхой интеграл", body:"n тэгш өнцөгт нэмэгдэх тусам нарийвчлал сайжирна.", formula:"∫ₐᵇf(x)dx = F(b) − F(a)",
      bullets:[ bullet("📊","Талбай ≈ тэгш өнцөгтүүдийн нийлбэр"), bullet("↗️","n→∞ үед нарийвчлал нэмэгдэнэ"), bullet("📐","Ньютон–Лейбниц: F(b)−F(a)") ] },
    { type:"interactive", title:"n тэгш өнцөгт", body:"n-г нэмэгдүүлэх тусам Риманы нийлбэр тодорхой интеграл руу ойртдог.", graphType:"riemann", sliders:["n"], initN:4 },
    q("∫₀² x dx=?",["2","1","4","0"],0,"[x²/2]₀²=4/2−0=2."),
    q("Тодорхой интеграл юуг илэрхийлдэг?",["Муруйн доорх талбай","Налуу","Уламжлал","Тогтмол"],0,"Геометрийн утга: талбай."),
    worked("∫₁³(x²+1)dx бод.",
      [step("1. Антиуламжлал","x³/3+x","F(x)=x³/3+x"),
       step("2. F(3)","9+3=12","F(3)=12"),
       step("3. F(1)","1/3+1=4/3","F(1)=4/3"),
       step("4. Хариу","12−4/3=32/3","∫₁³(x²+1)dx = 32/3")]),
    { type:"complete", xp:120, nextId:"g11-4-3", nextTitle:"Тодорхой интеграл ба талбай" },
  ],
};

const g11_4_3: Lesson = {
  id:"g11-4-3", title:"Тодорхой интеграл ба талбай", desc:"Хоёр муруйн хооронд талбай",
  levelColor:"#BA7517", levelName:"11-р анги · Интеграл", totalXp:130, duration:"17 мин",
  slides:[
    { type:"intro", emoji:"🎨", title:"Интеграл ба талбай", subtitle:"11-р анги · Интеграл",
      body:"Хоёр функцийн хооронд орших талбайг тодорхой интегралаар тооцоолно.", xp:130, duration:"17 мин", questions:2 },
    { type:"concept", title:"Хоёр муруйн хооронд", body:"Дээрх функцийг доорх функцээс хасна.", formula:"S = ∫ₐᵇ[f(x)−g(x)]dx",
      bullets:[ bullet("📐","f(x)≥g(x) → f−g хасна"), bullet("🔍","Огтлолцох цэг = хилийн цэг"), bullet("🎨","Абсолют утга хэрэглэнэ") ] },
    { type:"interactive", title:"y=x ба y=x² хооронд талбай", body:"Ягаан (x²) ба ногоон (x) хооронд ягаанаар өнгөлсөн талбайг харцгаая.", graphType:"areaBetween", sliders:[] },
    q("∫₀¹ x² dx=?",["1/3","1","1/2","2"],0,"[x³/3]₀¹=1/3."),
    q("Хоёр муруйн хооронд талбай олохдоо?",["Дээрхээс доорхийг хасна","Нэмнэ","Үржүүлнэ","Хуваана"],0,"S=∫[f(x)−g(x)]dx."),
    worked("y=x ба y=x² хооронд талбай ол.",
      [step("1. Огтлолцол","x=x² → x=0, x=1","x=0, x=1"),
       step("2. Интеграл","∫₀¹(x−x²)dx","[x²/2−x³/3]₀¹"),
       step("3. Хариу","1/2−1/3","S = 1/6")]),
    { type:"complete", xp:130 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE 12 — MODULE 1: ФУНКЦ II (#7F77DD)
// ═══════════════════════════════════════════════════════════════════════════════

const g12_1_1: Lesson = {
  id:"g12-1-1", title:"Логарифм", desc:"Логарифмын тодорхойлолт ба үндсэн чанар",
  levelColor:"#7F77DD", levelName:"12-р анги · Функц II", totalXp:120, duration:"15 мин",
  slides:[
    { type:"intro", emoji:"🔢", title:"Логарифм", subtitle:"12-р анги · Функц II",
      body:"logₐb = c нь aᶜ = b-тэй адил утгатай. Зэрэглэлийн урвуу үйлдэл.", xp:120, duration:"15 мин", questions:2 },
    { type:"concept", title:"Логарифмын тодорхойлолт", body:"aᶜ=b ↔ logₐb=c гэсэн холбоо.", formula:"logₐb = c  ↔  aᶜ = b",
      bullets:[ bullet("📖","logₐb: a суурьтай b-ийн логарифм"), bullet("📝","log₁₀x = log x (арав.), ln x = logₑx"), bullet("🔑","logₐ1=0, logₐa=1") ] },
    { type:"interactive", title:"y=log₂x ба y=2ˣ", body:"Логарифм ба экспоненциал нь урвуу функцүүд.", graphType:"log", sliders:[] },
    q("log₂8=?",["3","2","4","8"],0,"2³=8 тул log₂8=3."),
    q("log₁₀100=?",["2","1","3","10"],0,"10²=100 тул log=2."),
    worked("log₂32 + log₂4 ол.",
      [step("1. Тусад нь","log₂32=5, log₂4=2",""),
       step("2. Нийлбэрийн чанар","log₂(32×4)=log₂128","log₂128=7")]),
    { type:"complete", xp:120, nextId:"g12-1-2", nextTitle:"Логарифмын чанар" },
  ],
};

const g12_1_2: Lesson = {
  id:"g12-1-2", title:"Логарифмын чанар", desc:"Нийлбэр, ялгавар, зэрэгт дүрмүүд",
  levelColor:"#7F77DD", levelName:"12-р анги · Функц II", totalXp:110, duration:"14 мин",
  slides:[
    { type:"intro", emoji:"📐", title:"Логарифмын чанарууд", subtitle:"12-р анги · Функц II",
      body:"Логарифмын дүрмүүд нь нийлмэл илэрхийллийг хялбарчилна.", xp:110, duration:"14 мин", questions:2 },
    { type:"concept", title:"Үйлдлийн дүрмүүд", body:"Зэрэглэлийн үйлдэлтэй тохирдог.", formula:"logₐ(xy) = logₐx + logₐy",
      bullets:[ bullet("✖️","logₐ(xy)=logₐx+logₐy"), bullet("➗","logₐ(x/y)=logₐx−logₐy"), bullet("⬆️","logₐ(xⁿ)=n·logₐx") ] },
    { type:"interactive", title:"log(xy) = log(x) + log(y)", body:"log₂(x) ба log₂(2x)=log₂(x)+1 хоёр графикийг харцгаая.", graphType:"logProperty", sliders:[] },
    q("log(100·10)=?",["3","2","4","1"],0,"log100+log10=2+1=3."),
    q("log₂(8/2)=?",["2","1","3","4"],0,"log₂8−log₂2=3−1=2."),
    worked("log₂48 хялбарчил.",
      [step("1. Задлах","48=16×3","log₂16+log₂3"),
       step("2. Тооцоол","log₂16=4","4+log₂3 ≈ 5.585")]),
    { type:"complete", xp:110, nextId:"g12-1-3", nextTitle:"y=eˣ ба y=lnx" },
  ],
};

const g12_1_3: Lesson = {
  id:"g12-1-3", title:"y=eˣ ба y=lnx", desc:"Байгалийн логарифм, e тоо",
  levelColor:"#7F77DD", levelName:"12-р анги · Функц II", totalXp:120, duration:"15 мин",
  slides:[
    { type:"intro", emoji:"🌿", title:"y=eˣ ба y=lnx", subtitle:"12-р анги · Функц II",
      body:"e≈2.718 Эйлерийн тоо. y=eˣ ба y=lnx нь урвуу функцүүд.", xp:120, duration:"15 мин", questions:2 },
    { type:"concept", title:"Байгалийн логарифм", body:"e нь байгалийн өсөлтийн тогтмол.", formula:"ln(eˣ) = x  ба  e^(lnx) = x",
      bullets:[ bullet("🌱","e≈2.718 Эйлерийн тоо"), bullet("🔄","y=eˣ ба y=lnx урвуу"), bullet("⚡","(eˣ)'=eˣ, (lnx)'=1/x") ] },
    { type:"interactive", title:"y=eˣ ба y=lnx харах", body:"Хоёр функц y=x шулуунтай тэгш хэмтэй.", graphType:"naturalLog", sliders:[] },
    q("(eˣ)'=?",["eˣ","xeˣ","e","1/x"],0,"Экспоненциалийн өвөрмөц чанар."),
    q("ln(e³)=?",["3","e","e³","1"],0,"ln(eˣ)=x томьёогоор."),
    worked("f(x)=e²ˣ уламжлал ол.",
      [step("1. Нийлмэл","u=2x, u'=2","(eᵘ)'=eᵘ·u'"),
       step("2. Хариу","","f'(x) = 2e²ˣ")]),
    { type:"complete", xp:120, nextId:"g12-1-4", nextTitle:"Рациональ функц" },
  ],
};

const g12_1_4: Lesson = {
  id:"g12-1-4", title:"Рациональ функц", desc:"y=k/x гиперболын хэлбэр, асимптот",
  levelColor:"#7F77DD", levelName:"12-р анги · Функц II", totalXp:110, duration:"14 мин",
  slides:[
    { type:"intro", emoji:"➗", title:"Рациональ функц", subtitle:"12-р анги · Функц II",
      body:"y=k/x нь гиперболын хэлбэртэй. x=0 ба y=0 нь асимптотууд.", xp:110, duration:"14 мин", questions:2 },
    { type:"concept", title:"Гипербол ба асимптот", body:"Q(x)=0 цэгт функц тодорхойгүй → босоо асимптот.", formula:"y = k/x  (k ≠ 0)",
      bullets:[ bullet("🚫","x=0 үед тодорхойгүй"), bullet("📐","x=0: босоо, y=0: хэвтээ асимптот"), bullet("📊","k>0: 1,3-р улирал; k<0: 2,4-р улирал") ] },
    { type:"interactive", title:"k өөрчлөх", body:"k-г өөрчлөн гиперболын хэлбэр хэрхэн өөрчлөгдөхийг харцгаая.", graphType:"hyperbola", sliders:["k"], initK:2 },
    q("y=1/x x=0-д яагаад тодорхойгүй?",["0-д хувааж болохгүй","x<0","y=0","Тогтмол"],0,"1/0 тодорхойгүй."),
    q("y=2/x асимптотууд?",["x=0 ба y=0","x=2 ба y=2","x=1","y=1"],0,"Хуваагч=0 → x=0, y→0 → y=0."),
    worked("y=3/(x−2)+1 асимптот, тодорхойлох муж ол.",
      [step("1. Тодорхойлох муж","x−2≠0","x ≠ 2"),
       step("2. Босоо асимптот","x−2=0","x = 2"),
       step("3. Хэвтээ асимптот","y→1","y = 1")]),
    { type:"complete", xp:110 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE 12 — MODULE 2: УЛАМЖЛАЛ II (#1D9E75)
// ═══════════════════════════════════════════════════════════════════════════════

const g12_2_1: Lesson = {
  id:"g12-2-1", title:"y=eˣ функцийн уламжлал", desc:"Экспоненциал функцийн уламжлал, нийлмэл",
  levelColor:"#1D9E75", levelName:"12-р анги · Уламжлал II", totalXp:110, duration:"14 мин",
  slides:[
    { type:"intro", emoji:"🔬", title:"y=eˣ уламжлал", subtitle:"12-р анги · Уламжлал II",
      body:"(eˣ)'=eˣ — экспоненциал функцийн өвөрмөц чанар.", xp:110, duration:"14 мин", questions:2 },
    { type:"concept", title:"Томьёо ба нийлмэл", body:"(eᵘ)'=eᵘ·u' нийлмэл функцийн уламжлал.", formula:"(eˣ)' = eˣ",
      bullets:[ bullet("⚡","(eˣ)'=eˣ"), bullet("🔗","(eᵘ)'=eᵘ·u' нийлмэл"), bullet("📐","(2ˣ)'=2ˣ·ln2") ] },
    { type:"interactive", title:"y=eˣ ба уламжлал нь өөрөө", body:"y=eˣ функц болон уламжлал нь ижил.", graphType:"expDeriv", sliders:[] },
    q("(e³ˣ)'=?",["3e³ˣ","e³ˣ","3x","eˣ"],0,"u=3x, u'=3, (eᵘ)'=eᵘ·u'=3e³ˣ."),
    q("(2ˣ)'=?",["2ˣ·ln2","2ˣ","x·2ˣ⁻¹","ln2"],0,"(aˣ)'=aˣ·lna."),
    worked("f(x)=e^(x²+1) уламжлал.",
      [step("1. u=x²+1","u'=2x","нийлмэл"),
       step("2. Хариу","","f'(x) = 2x·e^(x²+1)")]),
    { type:"complete", xp:110, nextId:"g12-2-2", nextTitle:"y=lnx уламжлал" },
  ],
};

const g12_2_2: Lesson = {
  id:"g12-2-2", title:"y=lnx функцийн уламжлал", desc:"Логарифм функцийн уламжлал",
  levelColor:"#1D9E75", levelName:"12-р анги · Уламжлал II", totalXp:110, duration:"14 мин",
  slides:[
    { type:"intro", emoji:"🌱", title:"y=lnx уламжлал", subtitle:"12-р анги · Уламжлал II",
      body:"(lnx)'=1/x. Байгалийн логарифмийн уламжлал.", xp:110, duration:"14 мин", questions:2 },
    { type:"concept", title:"Томьёо ба нийлмэл", body:"Нийлмэл хувилбар: (lnu)'=u'/u.", formula:"(ln x)' = 1/x",
      bullets:[ bullet("🔑","(lnx)'=1/x"), bullet("🔗","(lnu)'=u'/u"), bullet("📐","(ln(x²))'=2x/x²=2/x") ] },
    { type:"interactive", title:"y=lnx ба y=1/x", body:"Логарифм функц (ягаан) ба түүний уламжлал 1/x (ногоон).", graphType:"lnDeriv", sliders:[] },
    q("(ln(3x))'=?",["1/x","3/x","1/3","3ln(x)"],0,"u=3x, (lnu)'=u'/u=3/3x=1/x."),
    q("(ln(x²+1))'=?",["2x/(x²+1)","2x","1/(x²+1)","2/x"],0,"u=x²+1, u'=2x."),
    worked("f(x)=ln(x²−3x+2) уламжлал.",
      [step("1. u=x²−3x+2","u'=2x−3",""),
       step("2. Хариу","(lnu)'=u'/u","f'(x)=(2x−3)/(x²−3x+2)")]),
    { type:"complete", xp:110, nextId:"g12-2-3", nextTitle:"sinx, cosx уламжлал" },
  ],
};

const g12_2_3: Lesson = {
  id:"g12-2-3", title:"y=sinx ба y=cosx уламжлал", desc:"Тригонометрийн уламжлал",
  levelColor:"#1D9E75", levelName:"12-р анги · Уламжлал II", totalXp:120, duration:"15 мин",
  slides:[
    { type:"intro", emoji:"〜", title:"sin ба cos уламжлал", subtitle:"12-р анги · Уламжлал II",
      body:"(sinx)'=cosx, (cosx)'=−sinx. Тригонометрийн нийлмэл уламжлал.", xp:120, duration:"15 мин", questions:2 },
    { type:"concept", title:"Томьёо ба нийлмэл", body:"(sinu)'=cosu·u' нийлмэл хувилбар.", formula:"(sin x)' = cos x,  (cos x)' = −sin x",
      bullets:[ bullet("📐","(sinx)'=cosx"), bullet("🔄","(cosx)'=−sinx"), bullet("🔗","(sinu)'=cosu·u'") ] },
    { type:"interactive", title:"y=sinx ба y=cosx", body:"sinx (ягаан) функц ба түүний уламжлал cosx (ногоон).", graphType:"trigDeriv", sliders:[] },
    q("(sin3x)'=?",["3cos3x","cos3x","3sinx","−3cos3x"],0,"u=3x, (sinu)'=cosu·u'=cos3x·3."),
    q("(cos²x)'=?",["−sin2x","sin2x","2cosx","−2sinx"],0,"2cosx·(−sinx)=−sin2x."),
    worked("f(x)=sin(x²+π) уламжлал.",
      [step("1. u=x²+π","u'=2x","нийлмэл"),
       step("2. Хариу","","f'(x)=2x·cos(x²+π)")]),
    { type:"complete", xp:120, nextId:"g12-2-4", nextTitle:"y=tanx уламжлал" },
  ],
};

const g12_2_4: Lesson = {
  id:"g12-2-4", title:"y=tanx функцийн уламжлал", desc:"Tangent уламжлал, тодорхойлох муж",
  levelColor:"#1D9E75", levelName:"12-р анги · Уламжлал II", totalXp:110, duration:"14 мин",
  slides:[
    { type:"intro", emoji:"📐", title:"y=tanx уламжлал", subtitle:"12-р анги · Уламжлал II",
      body:"(tanx)'=1/cos²x. tanx=sinx/cosx-ийн уламжлалаас гарна.", xp:110, duration:"14 мин", questions:2 },
    { type:"concept", title:"Tangent уламжлал", body:"(tanu)'=u'/cos²u нийлмэл хувилбар.", formula:"(tan x)' = 1/cos²x = sec²x",
      bullets:[ bullet("🔑","(tanx)'=1/cos²x"), bullet("🔗","(tanu)'=u'/cos²u"), bullet("🚫","x=π/2+πn-д тодорхойгүй") ] },
    { type:"interactive", title:"y=tanx ба y=1/cos²x", body:"Tangent функц (ягаан) ба түүний уламжлал (ногоон).", graphType:"tanDeriv", sliders:[] },
    q("(tan5x)'=?",["5/cos²5x","1/cos²x","5cosx","tanx"],0,"u=5x, (tanu)'=u'/cos²u=5/cos²5x."),
    q("tanx хэзээ тодорхойгүй?",["x=π/2+πn","x=πn","x=0","x=π"],0,"cosx=0 үед tanx тодорхойгүй."),
    worked("f(x)=tan(x²) уламжлал.",
      [step("1. u=x²","u'=2x","нийлмэл"),
       step("2. Хариу","","f'(x)=2x/cos²(x²)")]),
    { type:"complete", xp:110 },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE 12 — MODULE 3: ИНТЕГРАЛ II (#BA7517)
// ═══════════════════════════════════════════════════════════════════════════════

const g12_3_1: Lesson = {
  id:"g12-3-1", title:"Илтгэгч функцийн интеграл", desc:"∫eˣdx ба ∫aˣdx томьёо",
  levelColor:"#BA7517", levelName:"12-р анги · Интеграл II", totalXp:120, duration:"15 мин",
  slides:[
    { type:"intro", emoji:"🔋", title:"Илтгэгч интеграл", subtitle:"12-р анги · Интеграл II",
      body:"∫eˣdx=eˣ+C. Экспоненциалийн интеграл нь өөрөө байдаг.", xp:120, duration:"15 мин", questions:2 },
    { type:"concept", title:"Томьёонууд", body:"Экспоненциал болон зэрэглэлт функцийн интеграл.", formula:"∫eˣdx = eˣ + C",
      bullets:[ bullet("🔑","∫eˣdx=eˣ+C"), bullet("📐","∫eᵃˣdx=eᵃˣ/a+C"), bullet("📊","∫aˣdx=aˣ/lna+C") ] },
    { type:"interactive", title:"y=eˣ антиуламжлал", body:"f(x)=eˣ (ногоон) ба F(x)=eˣ (ягаан) нь ижил.", graphType:"expIntegral", sliders:[] },
    q("∫e²ˣdx=?",["e²ˣ/2+C","e²ˣ+C","2e²ˣ+C","eˣ+C"],0,"∫eᵃˣdx=eᵃˣ/a+C, a=2."),
    q("∫3ˣdx=?",["3ˣ/ln3+C","3ˣ+C","ln3·3ˣ+C","3ˣ/3+C"],0,"∫aˣdx=aˣ/lna+C."),
    worked("∫₀¹ e²ˣdx бод.",
      [step("1. Антиуламжлал","F(x)=e²ˣ/2",""),
       step("2. Тооцоол","[e²ˣ/2]₀¹=e²/2−1/2",""),
       step("3. Хариу","","(e²−1)/2")]),
    { type:"complete", xp:120, nextId:"g12-3-2", nextTitle:"Тригонометрийн интеграл" },
  ],
};

const g12_3_2: Lesson = {
  id:"g12-3-2", title:"Тригонометрийн интеграл", desc:"∫sinx ба ∫cosx томьёо",
  levelColor:"#BA7517", levelName:"12-р анги · Интеграл II", totalXp:110, duration:"14 мин",
  slides:[
    { type:"intro", emoji:"〜", title:"Тригонометрийн интеграл", subtitle:"12-р анги · Интеграл II",
      body:"∫sinxdx=−cosx+C, ∫cosxdx=sinx+C.", xp:110, duration:"14 мин", questions:2 },
    { type:"concept", title:"Томьёонууд", body:"Синус ба косинусын интегралууд.", formula:"∫sin x dx = −cos x + C",
      bullets:[ bullet("🔑","∫sinxdx=−cosx+C"), bullet("📐","∫cosxdx=sinx+C"), bullet("📊","∫sin(ax)dx=−cos(ax)/a+C") ] },
    { type:"interactive", title:"y=sinx ба −cosx", body:"sin (ногоон) функц ба антиуламжлал −cosx (ягаан).", graphType:"trigIntegral", sliders:[] },
    q("∫cos3xdx=?",["sin3x/3+C","sin3x+C","cos3x/3+C","−sin3x+C"],0,"∫cos(ax)dx=sin(ax)/a+C."),
    q("∫sinxdx=?",["−cosx+C","cosx+C","sinx+C","−sinx+C"],0,"Синусын интеграл."),
    worked("∫₀^(π/2) sinx dx бод.",
      [step("1. Антиуламжлал","−cosx",""),
       step("2. Тооцоол","[−cosx]₀^(π/2)","−cos(π/2)+cos(0)"),
       step("3. Хариу","0+1","∫₀^(π/2)sinxdx = 1")]),
    { type:"complete", xp:110, nextId:"g12-3-3", nextTitle:"Рациональ интеграл" },
  ],
};

const g12_3_3: Lesson = {
  id:"g12-3-3", title:"Рациональ функцийн интеграл", desc:"∫1/x = ln|x|+C томьёо",
  levelColor:"#BA7517", levelName:"12-р анги · Интеграл II", totalXp:120, duration:"15 мин",
  slides:[
    { type:"intro", emoji:"➗", title:"Рациональ интеграл", subtitle:"12-р анги · Интеграл II",
      body:"∫(1/x)dx=ln|x|+C — логарифм интегралын үндсэн томьёо.", xp:120, duration:"15 мин", questions:2 },
    { type:"concept", title:"Томьёонууд", body:"f'(x)/f(x) хэлбэрийн интеграл логарифм гарна.", formula:"∫(1/x) dx = ln|x| + C",
      bullets:[ bullet("🔑","∫1/x dx=ln|x|+C"), bullet("🔗","∫f'/f dx=ln|f|+C"), bullet("📐","∫1/(ax+b)dx=ln|ax+b|/a+C") ] },
    { type:"interactive", title:"y=1/x ба y=ln|x|", body:"1/x функц (ногоон) ба антиуламжлал ln|x| (ягаан).", graphType:"rationalIntegral", sliders:[] },
    q("∫1/(2x)dx=?",["ln|x|/2+C","ln|2x|+C","1/2+C","2ln|x|+C"],0,"∫1/(ax)dx=ln|x|/a+C."),
    q("∫2x/(x²+1)dx=?",["ln(x²+1)+C","2x+C","ln(2x)+C","arctan(x)+C"],0,"f=x²+1, f'=2x → ln|f|+C."),
    worked("∫(3x²)/(x³+1)dx ол.",
      [step("1. u=x³+1","u'=3x²",""),
       step("2. ∫u'/u","ln|u|+C",""),
       step("3. Хариу","","ln|x³+1| + C")]),
    { type:"complete", xp:120 },
  ],
};

// ─── Export ───────────────────────────────────────────────────────────────────
const ALL_LESSONS: Lesson[] = [
  // G11 Module 1
  fn1, fn2, fn3, g11_1_4, g11_1_5, g11_1_6,
  // G11 Module 2
  g11_2_1, g11_2_2, g11_2_3,
  // G11 Module 3
  g11_3_1, g11_3_2, g11_3_3, g11_3_4,
  // G11 Module 4
  g11_4_1, g11_4_2, g11_4_3,
  // G12 Module 1
  g12_1_1, g12_1_2, g12_1_3, g12_1_4,
  // G12 Module 2
  g12_2_1, g12_2_2, g12_2_3, g12_2_4,
  // G12 Module 3
  g12_3_1, g12_3_2, g12_3_3,
];

export const LESSONS: Record<string, Lesson> = Object.fromEntries(ALL_LESSONS.map((l) => [l.id, l]));

// legacy aliases
LESSONS["fn-4"] = { ...g11_1_4, id:"fn-4" };

// Course structure for courses page
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

// Lesson unlock state
export const LESSON_STATE: Record<string, "completed"|"unlocked"|"locked"> = {
  "fn-1":"completed", "fn-2":"completed", "fn-3":"unlocked",
};

export function getLessonState(id: string): "completed"|"unlocked" {
  return (LESSON_STATE[id] === "completed") ? "completed" : "unlocked";
}

// Legacy exports kept for backward compat
export const LEVEL1_LESSONS = [fn1, fn2, fn3, g11_1_4];
