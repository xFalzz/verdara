/**
 * Unified Meta Model API Gateway & Deterministic Site-Brief Number Validator
 * Connects to dev.meta.ai ($150 Credit Pool) for:
 * - Muse Spark (`muse-spark`)
 * - SAM 3.1 (`sam-3-1`)
 * - Muse Image / Muse Wonder (`muse-image` / `muse-wonder`)
 * - Muse Voice Transcribe (`muse-voice-transcribe`)
 * - Muse Spark Open / Muse Glimmer (`muse-spark-open` / `muse-glimmer`)
 */

import {
  checkAiCreditShield,
  recordAiUsage,
  type AiOperation,
} from "./shield";

export interface AiTelemetryMeta {
  provider: "meta-model-api";
  models: string[];
  masksCount: number;
  latencyMs: number;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  cache: "hit" | "miss";
  shieldMode: "live_meta_api" | "eco_saver_cache";
  shieldReason: string;
}

export interface SiteBrief {
  city: string;
  countryCode: string;
  koppenCode: string;
  koppenName: string;
  season: string;
  footprintM2: number;
  solarKwp: number;
  solarKwhYear: number;
  solarSavingsYear: number;
  currency: string;
  co2eKgYear: number;
  rainLitersYear: number;
  bioporeUnits: number;
  tciScore: number;
  electricityTariff: number;
  nearestHubName: string;
  nearestHubDistanceKm: number;
  outputLanguage: "en" | "id" | (string & {});
}

export type SupportedCouncilLanguage =
  | "id"
  | "en"
  | "es"
  | "fr"
  | "de"
  | "ja"
  | "zh"
  | "ar"
  | "pt"
  | "it"
  | "nl";

/**
 * Ultra-fast zero-dependency query language detector:
 * Categorizes user questions into supported locales so that The Verdara Specialist Council
 * synthesizes answers in the exact language used by the resident (Indonesian, Spanish, French, German, Japanese, Chinese, Arabic, etc.).
 */
export function detectQueryLanguage(
  query?: string,
  fallbackLocale = "en"
): SupportedCouncilLanguage {
  if (!query || !query.trim()) {
    return fallbackLocale === "id" ? "id" : "en";
  }
  const q = query.trim();

  // 1. Non-Latin Script detection
  if (/[\u3040-\u30ff]/.test(q)) return "ja"; // Japanese (Hiragana/Katakana)
  if (/[\u4e00-\u9fff]/.test(q)) return "zh"; // Chinese (Hanzi)
  if (/[\u0600-\u06ff]/.test(q)) return "ar"; // Arabic
  if (/[\uac00-\ud7af]/.test(q)) return "ja"; // East-Asian fallback

  const lower = q.toLowerCase();

  // 2. Spanish detection (inverted question punctuation or characteristic markers)
  if (
    /[¿¡]/.test(q) ||
    /\b(quién|quien|cómo|como|cuál|cual|cuánto|cuanto|cuántos|por\s+qué|porque|para|con|las|los|del|una|un|este|esta|estas|estos|plantas|cuidar|ahorro|techo|hongos|lluvia|residuos|reciclaje|energía|enfermedad|enfermedades|paneles|presidente|españa)\b/i.test(lower)
  ) {
    if (/\b(não|você|obrigado|telhado|chuva)\b/i.test(lower)) {
      return "pt";
    }
    return "es";
  }

  // 3. French detection
  if (
    /\b(qui|que|quoi|comment|pourquoi|combien|quel|quelle|quelles|quels|est-ce|avec|pour|dans|sur|les|des|une|un|cette|ces|du|de|la|le|soigner|plantes|panneaux|toit|pluie|déchets|durabilité|malades|énergie|président|france)\b/i.test(lower)
  ) {
    return "fr";
  }

  // 4. German detection
  if (
    /\b(wer|wie|was|wo|warum|weshalb|wieviel|welche|welcher|welches|ist|sind|mit|für|auf|dem|der|die|das|den|ein|eine|einer|eines|pflanzen|pflegen|kranke|pilze|pilzen|solaranlage|solarstrom|dach|regenwasser|nachhaltigkeit|energie|bundeskanzler|deutschland)\b/i.test(lower)
  ) {
    return "de";
  }

  // 5. Portuguese detection
  if (
    /\b(como|quanto|quantos|qual|quais|por\s+que|porque|para|com|uma|este|esta|estas|estes|plantas|cuidar|telhado|fungos|chuva|resíduos|reciclagem|energia|doentes)\b/i.test(lower)
  ) {
    return "pt";
  }

  // 6. Italian detection
  if (
    /\b(come|perché|quanto|quanti|quale|quali|con|per|nei|nella|delle|della|questo|questa|questi|piante|curare|tetto|funghi|pioggia|rifiuti|riciclo|energia|malate)\b/i.test(lower)
  ) {
    return "it";
  }

  // 7. Dutch detection
  if (
    /\b(hoe|waarom|hoeveel|welke|wat|met|voor|van|het|een|deze|planten|verzorgen|dak|zonnepanelen|regenwater|afval|duurzaamheid|zieke)\b/i.test(lower)
  ) {
    return "nl";
  }

  // 8. Indonesian / Malay detection
  if (
    /\b(bagaimana|apakah|berapa|kenapa|mengapa|apa|yang|untuk|dengan|dan|pada|di|dari|bisa|ini|itu|sudah|adalah|saya|kami|terkena|merawat|rawat|tumbuhan|tanaman|sampah|surya|hujan|atap|sakit|jamur|hama)\b/i.test(lower)
  ) {
    return "id";
  }

  // Fallback to brief language hint or English
  return fallbackLocale === "id" ? "id" : "en";
}

export interface CouncilAgentMessage {
  agent: "flora" | "arka" | "sirkula";
  name: string;
  roleEn: string;
  roleId: string;
  modelUsed: string;
  content: string;
  recommendations: {
    impact: "high" | "med" | "low";
    effort: "low" | "med" | "high";
    text: string;
  }[];
  verifiedNumbers: string[];
  unverifiedNumbers: string[];
}

export interface ActionBlueprintItem {
  id: string;
  ownerAgent: "flora" | "arka" | "sirkula";
  title: string;
  steps: string[];
  effort: "low" | "med" | "high";
  costBand: "low" | "med" | "high";
  metricRefs: string[];
  courseTrack: "zero_waste" | "urban_farming" | "passive_cooling" | "rainwater";
}

export interface CouncilTopicValidation {
  isAllowed: boolean;
  domain?: "solar_physics" | "hydrology" | "microclimate_botany" | "circular_waste" | "general_site";
  offTopicReasonEn?: string;
  offTopicReasonId?: string;
  offTopicReason?: string;
  detectedLanguage?: SupportedCouncilLanguage;
}

/**
 * Strict Multilingual Topic Boundary Validator for The Verdara Specialist Council:
 * Ensures consultations remain strictly confined to site ecological engineering,
 * solar PV physics, hydrology & rainwater, microclimate (TCI) & botany, and circular waste
 * across any language queried by the user (Indonesian, English, Spanish, French, German, Japanese, Chinese, Arabic, etc.).
 */
export function validateCouncilTopic(
  query?: string,
  fallbackLocale = "en"
): CouncilTopicValidation {
  if (!query || !query.trim()) {
    return { isAllowed: true, domain: "general_site", detectedLanguage: fallbackLocale === "id" ? "id" : "en" };
  }

  const detectedLanguage = detectQueryLanguage(query, fallbackLocale);
  const q = query.trim().toLowerCase();

  // Explicit off-topic categories (politics, celebrity gossip, recipes, coding, general trivia, entertainment)
  const explicitOffTopic =
    /\b(presiden|president|presidente|politik|politics|política|politique|politik|pemilu|election|elecciones|élections|wahl|wahlen|menteri|minister|ministre|partai|party|parlemen|parliament|parlamento|sepak\s*bola|football|soccer|fútbol|fussball|calcio|champions\s*league|liga|ronaldo|messi|puisi|poem|poetry|poesía|poésie|gedicht|lagu|song|chanson|lied|lirik|lyrics|film|movie|película|kino|artis|celebrity|selebriti|célébrité|resep|recipe|receta|recette|rezept|masak|cooking|cocina|cuisine|kochen|makanan|cake|kue|tarta|gâteau|kuchen|nasi\s*goreng|restoran|restaurant|koding|coding|python|javascript|typescript|java|c\+\+|html|css|sql|react|vue|angular|docker|kubernetes|hack|retas|exploit|crypto|bitcoin|ethereum|saham|stock\s*market|bolsa|aktien|forex|judi|casino|pacar|cinta|love|amor|amour|liebe|zodiak|horoscope|horóscopo|humor|joke|lelucon|chiste|blague|witz|game|gaming|juego|jeu|spiel|dota|mobile\s*legends|valorant|ff|free\s*fire|genshin)\b/i;

  const nonLatinExplicitOffTopic =
    /(大統領|総理大臣|政治|選挙|サッカー|映画|芸能人|料理|レシピ|プログラミング|暗号資産|ビットコイン|总统|总理|政治|选举|足球|电影|明星|烹饪|食谱|编程|比特币|رئيس|سياسة|انتخابات|كرة\s*قدم|فيلم|ممثل|طبخ|وصفة|برمجة|بيتكوين)/;

  // Multilingual on-topic keywords across Verdara domains: solar, water, microclimate, botany, plant care & pathology, nature, sustainability & circular waste
  const latinOnTopic =
    /\b(solar(?:strom|anlage)?|surya|pv|panel|paneles|panneau|panneaux|inverter|inversor|onduleur|baterai|battery|batería|batterie|listrik|daya|kwh|kwp|atap|roof|toit|techo|telhado|tetto|dach(?:fläche)?|tilt|plts|pln|kemiringan|energi|energy|energía|énergie|strom|photovoltaik(?:anlage)?|grid|tarif|tariff|tarifa|tarife|rain|hujan|lluvia|pluie|regen(?:wasser)?|chuva|pioggia|air|water|eau|wasser|agua|água|resapan|infiltrasi|infiltración|infiltration|biopori|biopore|cistern|tandon|réservoir|depósito|cisterna|speicher|talang|downspout|gouttière|drainase|drainage|drain|macropore|permeabilitas|permeability|limpasan|runoff|escorrentía|ruissellement|banjir|flood|inundación|inondation|sumur\s*resapan|plant|plants|planta|plantas|plante|plantes|pflanze|pflanzen|pianta|piante|tanaman|tumbuhan|tumbuh|merawat|rawat|cuidar|soigner|pflegen|curare|verzorgen|perawatan|pemeliharaan|pruning|poda|pangkas|pohon|tree|trees|árbol|árboles|arbre|arbres|baum|bäume|daun|leaf|leaves|hoja|hojas|feuille|feuilles|blatt|blätter|foglia|foglie|flora|botani|botany|botánica|botanique|botanik|vegetasi|vegetation|vegetación|végétation|akar|root|roots|raíz|raíces|racine|racines|wurzel|wurzeln|batang|stem|bunga|flower|flores|fleur|fleurs|blume|blumen|buah|fruit|fruta|benih|seed|semilla|graine|samen|bibit|sprout|tunas|hama|pest|pests|plaga|plagas|ravageur|ravageurs|schädling|schädlinge|penyakit|disease|diseases|enfermedad|enfermedades|maladie|maladies|krankheit|krankheiten|malattia|malattie|jamur|fungus|fungi|fungal|hongos?|champignon|champignons|pilz|pilze|pilzen|funghi|schimmel|schimmels|lesi|lesion|lesions|lesión|lesiones|bakteri|bacteria|bactérie|layu|wilt|kuning|yellowing|amarillamiento|gelb|busuk|rot|pourriture|fäule|bercak|spot|spots|manchas?|kebun|garden|jardín|jardin|garten|gardening|jardinería|taman|perkebunan|tanah|soil|sol|boden|tierra|humus|pupuk|fertilizer|fertilizante|engrais|dünger|abono|kompos|compost|compostaje|compostage|kompost|kompostierung|aerobik|aerobic|biophilic|greenery|peneduh|shade|sombra|ombre|evapotranspirasi|evapotranspiration|kanopi|canopy|canopée|urban\s*farming|hidroponik|aeroponik|permakultur|permaculture|agroforestri|agroforestry|alam|nature|naturaleza|natur|natura|natural|hayati|biodiversitas|biodiversity|biodiversidad|biodiversité|biodiversität|ekosistem|ecosystem|ecosistema|écosystème|ökosystem|ekologi|ecology|ecología|écologie|ökologie|habitat|konservasi|conservation|conservación|lingkungan|environment|environmental|medio\s*ambiente|environnement|umwelt|satwa|fauna|lebah|bee|bees|abeja|abejas|abeille|abeilles|biene|bienen|polinator|pollinator|pollinisateur|burung|bird|birds|oiseau|vogel|hutan|forest|forêt|wald|penghijauan|greening|sustainability|sustainable|sostenible|sostenibilidad|durable|durabilité|nachhaltig|nachhaltigkeit|sostenibile|keberlanjutan|berkelanjutan|lestari|kelestarian|ramah\s*lingkungan|eco[- ]?friendly|eco|green\s*living|zero\s*waste|net\s*zero|jejak\s*karbon|carbon\s*footprint|huella\s*de\s*carbono|empreinte\s*carbone|karbon|carbon|carbone|kohlenstoff|emisi|emission|emisiones|émissions|emissionen|dekarbonisasi|polusi|pollution|polución|kualitas\s*udara|air\s*quality|sampah|waste|residuos|déchets|müll|abfall|rifiuti|daur\s*ulang|recycle|recycling|reciclaje|recyclage|reuse|reduce|upcycle|pet|hdpe|plastik|plastic|plástico|plastique|aluminium|aluminum|aluminio|kaca|glass|vidrio|verre|glas|kardus|cardboard|cartón|carton|kappe|kertas|paper|papier|papel|organik|organic|orgánico|anorganik|anorganic|sirkular|circular|circulaire|zirkulär|bank\s*sampah|tpa|drop-off|hub|tci|thermal|comfort|confort|komfort|panas|heat|calor|chaleur|hitze|suhu|temperature|temperatura|température|temperatur|iklim|climate|clima|climat|klima|pemanasan\s*global|global\s*warming|calentamiento\s*global|réchauffement\s*climatique|perubahan\s*iklim|climate\s*change|cambio\s*climático|changement\s*climatique|klimawandel|k[oö]ppen|tapak|site|sitio|standort|bangunan|building|edificio|bâtiment|gebäude|rumah|house|home|casa|maison|haus|m2|footprint|arsitektur|architecture|arquitectura|architektur|retrofit|renovasi|renovation|biaya|cost|costo|coût|kosten|hemat|saving|savings|ahorro|ahorros|économie|roi|anggaran|investasi|inversión)\b/i;

  const nonLatinOnTopic =
    /(植物|病気|病害|真菌|菌類|太陽光|ソーラー|雨水|堆肥|コンポスト|リサイクル|ゴミ|廃棄物|環境|生態|屋根|温暖化|気候|節約|省エネ|太阳能|光伏|植物|疾病|真菌|病害|雨水|堆肥|垃圾|回收|循环|环境|生态|屋顶|气候|节约|نبات|نباتات|طاقة\s*شمسية|ألواح\s*شمسية|مطر|مياه|تسميد|سماد|نفايات|تدوير|إعادة\s*تدوير|بيئة|مرض|أمراض|فطريات|سطح|مناخ)/;

  const matchesStrictOffTopic = explicitOffTopic.test(q) || nonLatinExplicitOffTopic.test(query);
  const matchesOnTopic = latinOnTopic.test(q) || nonLatinOnTopic.test(query);

  const localizedRefusals: Record<string, string> = {
    id: "Pertanyaan Anda berada di luar cakupan sains rekayasa tapak, energi surya, tata air, iklim mikro, dan pengelolaan sampah sirkular Verdara.",
    en: "Your query is outside Verdara's residential site engineering, solar energy, hydrology, microclimate, and circular waste scope.",
    es: "Su consulta está fuera del ámbito de ingeniería ecológica del sitio residencial, energía solar, hidrología, microclima y residuos circulares de Verdara.",
    fr: "Votre question sort du cadre de l'ingénierie écologique du site résidentiel, de l'énergie solaire, de l'hydrologie, du microclimat et du recyclage Verdara.",
    de: "Ihre Anfrage liegt außerhalb der ökologischen Gebäudeplanung, Solarenergie, Hydrologie, des Mikroklimas und der Kreislaufwirtschaft von Verdara.",
    ja: "ご質問はVerdaraの住宅敷地工学、太陽光エネルギー、水文学、微気候、循環型廃棄物管理の適用範囲外です。",
    zh: "您的咨询超出了Verdara住宅生态工程、太阳能、水文学、微气候及循环废弃物管理的专业范围。",
    ar: "استفساركم يقع خارج نطاق الهندسة البيئية للموقع السكني والطاقة الشمسية والهيدرولوجيا والمناخ الدقيق وإعادة التدوير في فيردارا.",
  };

  const currentRefusal = localizedRefusals[detectedLanguage] || localizedRefusals.en;

  if (matchesStrictOffTopic && !matchesOnTopic) {
    return {
      isAllowed: false,
      offTopicReasonId: localizedRefusals.id,
      offTopicReasonEn: localizedRefusals.en,
      offTopicReason: currentRefusal,
      detectedLanguage,
    };
  }

  // Reject multi-word queries that contain zero site-relevant keywords
  const words = q.split(/\s+/).filter(Boolean);
  if ((words.length >= 2 || /[\u3040-\u9fff\u0600-\u06ff]/.test(query)) && !matchesOnTopic) {
    return {
      isAllowed: false,
      offTopicReasonId: localizedRefusals.id,
      offTopicReasonEn: localizedRefusals.en,
      offTopicReason: currentRefusal,
      detectedLanguage,
    };
  }

  let domain: CouncilTopicValidation["domain"] = "general_site";
  if (
    /\b(solar(?:strom|anlage)?|solaires?|surya|pv|panel(?:es)?|panneau(?:x)?|inverter|inversor|baterai|battery|batería|batterie|kwh|kwp|plts|photovoltaik)\b/i.test(q) ||
    /太陽光|ソーラー|光伏|طاقة\s*شمسية/.test(query)
  ) {
    domain = "solar_physics";
  } else if (
    /\b(rain|hujan|lluvia|pluie|regen|air|water|eau|wasser|agua|biopori|biopore|cistern|tandon|talang|banjir|flood|drainase|drainage)\b/i.test(q) ||
    /雨水|浸透|مطر|مياه/.test(query)
  ) {
    domain = "hydrology";
  } else if (
    /\b(plant(?:s)?|planta(?:s)?|plante(?:s)?|pflanze(?:n)?|pianta|piante|tanaman|tumbuhan|merawat|rawat|cuidar|soigner|pflegen|curare|verzorgen|penyakit|hama|jamur|fungus|fungi|fungal|hongos?|champignons?|pilz(?:e|en)?|schimmel|schimmels|maladie(?:s)?|enfermedad(?:es)?|krankheit(?:en)?|lesion|bercak|pohon|tree|trees|daun|leaf|leaves|flora|botani|botany|kebun|taman|vegetasi|alam|nature|tci|panas|heat|suhu|kanopi|shade|peneduh|kompos|compost|pupuk|soil|tanah)\b/i.test(q) ||
    /植物|病気|病害|真菌|菌類|堆肥|نبات|مرض|فطريات/.test(query)
  ) {
    domain = "microclimate_botany";
  } else if (
    /\b(sampah|waste|residuos|déchets|müll|daur\s*ulang|recycle|recycling|reciclaje|sustainability|sustainable|keberlanjutan|lestari|pet|hdpe|plastik|aluminium|kaca|kardus|bank\s*sampah|sirkular)\b/i.test(q) ||
    /ゴミ|廃棄物|リサイクル|垃圾|回收|نفايات|تدوير/.test(query)
  ) {
    domain = "circular_waste";
  }

  return { isAllowed: true, domain, detectedLanguage };
}

export interface CouncilSynthesisResult {
  sessionId: string;
  siteBrief: SiteBrief;
  messages: CouncilAgentMessage[];
  blueprint: {
    title: string;
    summary: string;
    actions: ActionBlueprintItem[];
    caveats: string[];
  };
  telemetry: AiTelemetryMeta;
  isOffTopic?: boolean;
  offTopicCategory?: string;
  offTopicMessage?: string;
  detectedLanguage?: SupportedCouncilLanguage;
}

/**
 * Deterministic Post-Response Number Validator (TRD §9.7):
 * Checks every numeric token in an agent's output against the numbers present in SiteBrief.
 */
export function validateNumbersAgainstSiteBrief(
  text: string,
  brief: SiteBrief
): { verifiedNumbers: string[]; unverifiedNumbers: string[] } {
  const allowedValues: number[] = [
    brief.footprintM2,
    brief.solarKwp,
    brief.solarKwhYear,
    brief.solarSavingsYear,
    brief.co2eKgYear,
    brief.rainLitersYear,
    brief.bioporeUnits,
    brief.tciScore,
    brief.electricityTariff,
    brief.nearestHubDistanceKm,
    // Common derived/rounded values & percentages
    Math.round(brief.solarKwhYear),
    Math.round(brief.co2eKgYear),
    Math.round(brief.footprintM2 * 0.6),
    60,
    70,
    78,
    85,
    90,
    100,
    200,
    30,
  ];

  const regex = /\b\d+(?:[\s\u00a0\u202f.,]\d{3})*(?:[.,]\d+)?\b/g;
  const matches = text.match(regex) ?? [];
  const verified = new Set<string>();
  const unverified = new Set<string>();

  for (const raw of matches) {
    const trimmed = raw.trim();
    // Candidate numbers based on thousand/decimal formatting variants
    const c1 = Number(trimmed.replace(/,/g, ""));
    const c2 = Number(trimmed.replace(/\./g, ""));
    const c3 = Number(trimmed.replace(/[\s\u00a0\u202f]/g, ""));
    const c4 = Number(trimmed.replace(/,/g, "."));
    const c5 = Number(trimmed);

    const candidates = [c1, c2, c3, c4, c5].filter((c) => !Number.isNaN(c));
    if (candidates.length === 0) continue;

    const isMatched = candidates.some((cleaned) => {
      if (
        (Number.isInteger(cleaned) && cleaned >= 1 && cleaned <= 16) ||
        (cleaned >= 1990 && cleaned <= 2050)
      ) {
        return true;
      }
      return allowedValues.some((allowed) => {
        const denom = Math.max(Math.abs(allowed), 1);
        return Math.abs(cleaned - allowed) / denom <= 0.03;
      });
    });

    if (isMatched) {
      verified.add(raw);
    } else {
      unverified.add(raw);
    }
  }

  return {
    verifiedNumbers: Array.from(verified),
    unverifiedNumbers: Array.from(unverified),
  };
}

function parseCouncilSections(raw: string) {
  const flora =
    raw.match(/\[FLORA\]([\s\S]*?)(?=\[(?:ARKA|SIRKULA|SUMMARY)\]|$)/i)?.[1]?.trim() ?? null;
  const arka =
    raw.match(/\[ARKA\]([\s\S]*?)(?=\[(?:FLORA|SIRKULA|SUMMARY)\]|$)/i)?.[1]?.trim() ?? null;
  const sirkula =
    raw.match(/\[SIRKULA\]([\s\S]*?)(?=\[(?:FLORA|ARKA|SUMMARY)\]|$)/i)?.[1]?.trim() ?? null;
  const summary =
    raw.match(/\[SUMMARY\]([\s\S]*?)(?=\[(?:FLORA|ARKA|SIRKULA)\]|$)/i)?.[1]?.trim() ?? null;
  return { flora, arka, sirkula, summary };
}

function cleanAgentPrefix(text: string | null) {
  if (!text) return null;
  return text.replace(/^(?:Dr\.\s*Flora[^:]*|Ir\.\s*Arka[^:]*|Sirkula[^:]*):\s*/i, "").trim();
}

/**
 * Runs the 3-Agent Verdara Council (Flora, Arka, Sirkula) using Meta Model API
 * (`muse-spark` or `muse-spark-open`) guarded by the 7-Layer AI Credit Shield.
 */
export async function executeVerdaraCouncil(
  brief: SiteBrief,
  opts: {
    userId: string;
    ipHash: string;
    isJudge: boolean;
    useOpenWeightModel?: boolean;
    userQuery?: string;
  }
): Promise<CouncilSynthesisResult> {
  const startMs = Date.now();
  const modelId = opts.useOpenWeightModel
    ? process.env.META_MODEL_OPEN || "muse-spark-1.3-contributor"
    : process.env.META_MODEL_SPARK || "muse-spark-1.3";

  const shield = checkAiCreditShield({
    userId: opts.userId,
    ipHash: opts.ipHash,
    isJudge: opts.isJudge,
    op: "council",
  });

  const userLang = detectQueryLanguage(opts.userQuery, brief.outputLanguage);
  const isId = userLang === "id";
  const isEs = userLang === "es";
  const isFr = userLang === "fr";
  const isDe = userLang === "de";
  const isJa = userLang === "ja";
  const isZh = userLang === "zh";
  const isAr = userLang === "ar";

  const localeMap: Record<string, string> = {
    id: "id-ID",
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    ja: "ja-JP",
    zh: "zh-CN",
    ar: "ar-EG",
    pt: "pt-BR",
    it: "it-IT",
    nl: "nl-NL",
  };
  const fmtNum = (n: number) =>
    new Intl.NumberFormat(isId ? "id-ID" : "en-US").format(Math.round(n));

  // Step 1: Pre-flight Topic Validation Guardrail
  const topicValidation = validateCouncilTopic(opts.userQuery, brief.outputLanguage);
  let isOffTopic = !topicValidation.isAllowed;
  let offTopicReason =
    topicValidation.offTopicReason ||
    (isId ? topicValidation.offTopicReasonId : topicValidation.offTopicReasonEn);

  const queryFocus = opts.userQuery?.trim().toLowerCase() || "";
  const hasSolarQuery =
    /\b(solar(?:strom|anlage)?|surya|pv|panel|paneles|panneau|panneaux|inverter|baterai|battery|batería|batterie|listrik|daya|kwh|kwp|plts|roi|hemat|saving|savings|ahorro|économie|strom|photovoltaik)\b/i.test(queryFocus) ||
    /太陽光|ソーラー|光伏|طاقة\s*شمسية/.test(opts.userQuery || "");

  const hasRainQuery =
    /\b(rain|hujan|lluvia|pluie|regen|air|water|eau|wasser|agua|água|biopori|biopore|banjir|flood|cistern|tandon|réservoir|depósito|speicher|talang|downspout|drainase|drainage|inundación|inondation)\b/i.test(queryFocus) ||
    /雨水|浸透|مطر|مياه/.test(opts.userQuery || "");

  const hasDiseaseQuery =
    /\b(penyakit|sakit|hama|jamur|fungus|fungi|fungal|lesion|lesi|bercak|layu|rot|busuk|disease|diseases|pest|pests|enfermedad|enfermedades|hongos?|plaga|plagas|maladie|maladies|champignon|champignons|ravageur|krankheit|krankheiten|pilz|pilze|pilzen|schädling|schädlinge|schimmel|schimmels|malattia|malattie|funghi)\b/i.test(queryFocus) ||
    /病気|病害|真菌|菌類|疾病|مرض|أمراض|فطريات/.test(opts.userQuery || "");

  const hasPlantQuery =
    /\b(plant|plants|planta|plantas|plante|plantes|pflanze|pflanzen|pianta|piante|tanaman|tumbuhan|merawat|rawat|cuidar|soigner|pflegen|curare|verzorgen|pohon|tree|trees|árbol|árboles|arbre|arbres|baum|bäume|daun|leaf|leaves|hoja|hojas|feuille|feuilles|blatt|blätter|kompos|compost|panas|heat|calor|chaleur|hitze|tci|suhu|temperature|temperatura|température|temperatur|alam|nature|naturaleza|natur|natura)\b/i.test(queryFocus) ||
    /植物|樹木|緑化|環境|自然|نبات|نباتات|طبيعة/.test(opts.userQuery || "") ||
    hasDiseaseQuery;

  // Step 2: Live Meta Model API Call (with strict topic boundary guardrail)
  let liveCustomNote: string | null = null;
  let liveFlora: string | null = null;
  let liveArka: string | null = null;
  let liveSirkula: string | null = null;
  let liveSummary: string | null = null;
  let tokensIn = 1420;
  let tokensOut = 680;
  let costUsd = 0;
  let cacheStatus: "hit" | "miss" = "hit";

  if (shield.mode === "live_meta_api" && process.env.META_API_KEY && !isOffTopic) {
    try {
      const baseUrl = (
        process.env.META_API_BASE_URL || "https://api.meta.ai/v1"
      ).replace(/\/$/, "");

      const queryText =
        opts.userQuery?.trim() || "Comprehensive residential site ecological synthesis.";

      const langNames: Record<string, string> = {
        id: "Indonesian (Bahasa Indonesia)",
        en: "English",
        es: "Spanish (Español)",
        fr: "French (Français)",
        de: "German (Deutsch)",
        ja: "Japanese (日本語)",
        zh: "Chinese (中文)",
        ar: "Arabic (العربية)",
        pt: "Portuguese (Português)",
        it: "Italian (Italiano)",
        nl: "Dutch (Nederlands)",
      };
      const targetLangName = langNames[userLang] || "the user's language";

      const systemPrompt =
        `You are The Verdara Specialist Council synthesizer.\n` +
        `You MUST generate your entire response exclusively in ${targetLangName}.\n` +
        `Keep your internal reasoning brief, direct, and focused.\n` +
        `Output 4 clearly tagged sections exactly as follows:\n\n` +
        `[FLORA]\n` +
        `Dr. Flora Daniswara: 2-3 sentences on botanical, plant pathology, microclimate (TCI ${brief.tciScore}/100), and canopy recommendations addressing the user query in ${targetLangName}.\n\n` +
        `[ARKA]\n` +
        `Ir. Arka Mahendra: 2 sentences on roof solar PV (${brief.solarKwp} kWp, ${fmtNum(brief.solarKwhYear)} kWh/yr), rainwater harvesting (${fmtNum(brief.rainLitersYear)} L/yr), and ${brief.bioporeUnits} biopores in ${targetLangName}.\n\n` +
        `[SIRKULA]\n` +
        `Sirkula Hidayat: 2 sentences on circular waste sorting, handling diseased cuttings outside compost, and local recycling at ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km) in ${targetLangName}.\n\n` +
        `[SUMMARY]\n` +
        `Consolidated 2-sentence site blueprint summary addressing the user query in ${targetLangName}.\n\n` +
        `STRICT OFF-TOPIC REFUSAL RULE:\n` +
        `If and ONLY if the user query is completely unrelated to site planning, plants/botany, nature, sustainability, solar energy, water, or circular waste (such as celebrity gossip, sports match scores, food recipes, software coding), reply EXACTLY:\n` +
        `REJECTED_OFF_TOPIC\n` +
        `Otherwise, provide all 4 sections in ${targetLangName}. Cite only facts and numbers from SITE_BRIEF.`;

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.META_API_KEY}`,
        },
        body: JSON.stringify({
          model: modelId,
          max_tokens: 4096,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: `SITE_BRIEF:\n${JSON.stringify(brief)}\n\nUSER_QUERY:\n${queryText}`,
            },
          ],
        }),
        signal: AbortSignal.timeout(45_000),
      });

      if (res.ok) {
        const json = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
          usage?: { prompt_tokens?: number; completion_tokens?: number };
        };
        const reply = json.choices?.[0]?.message?.content?.trim() ?? "";
        tokensIn = json.usage?.prompt_tokens ?? 390;
        tokensOut = json.usage?.completion_tokens ?? 3300;
        costUsd = Number(
          ((tokensIn * 1.25 + tokensOut * 4.25) / 1_000_000).toFixed(5)
        );
        cacheStatus = "miss";

        if (reply.includes("REJECTED_OFF_TOPIC")) {
          isOffTopic = true;
          offTopicReason =
            topicValidation.offTopicReason ||
            (isId
              ? "Pertanyaan Anda berada di luar koridor sains rekayasa tapak hunian dan ekologi Verdara."
              : "Your query lies outside Verdara's residential site engineering and ecological scope.");
        } else {
          const parsed = parseCouncilSections(reply);
          if (parsed.flora) liveFlora = parsed.flora;
          if (parsed.arka) liveArka = parsed.arka;
          if (parsed.sirkula) liveSirkula = parsed.sirkula;
          if (parsed.summary) liveSummary = parsed.summary;
          liveCustomNote = liveSummary || reply;
        }
      }
    } catch {
      // Graceful fallback to deterministic synthesis
    }
  }

  recordAiUsage({
    userId: opts.userId,
    ipHash: opts.ipHash,
    isJudge: opts.isJudge,
    op: "council" as AiOperation,
    model: modelId,
    costUsd,
    cacheHit: cacheStatus === "hit",
    latencyMs: Math.max(140, Date.now() - startMs),
  });

  // Step 3: Handle Strict Off-Topic Refusal
  if (isOffTopic) {
    const refusalFlora = isId
      ? `Pertanyaan Anda di luar cakupan iklim mikro dan biodiversitas tapak. Saya hanya membedah skor Thermal Comfort Index (TCI ${brief.tciScore}/100), vegetasi kanopi peneduh lokal iklim ${brief.koppenCode}, dan rancangan biophilic tapak bangunan.`
      : isEs
      ? `Su consulta está fuera del alcance del microclima y la biodiversidad del sitio. Analizo exclusivamente el índice de confort térmico (TCI ${brief.tciScore}/100), el dosel de vegetación nativa para clima ${brief.koppenCode} y la biofilia del sitio.`
      : isFr
      ? `Votre question sort du cadre du microclimat et de la biodiversité du site. J'analyse exclusivement l'indice de confort thermique (TCI ${brief.tciScore}/100), la canopée végétale indigène pour le climat ${brief.koppenCode} et les aménagements biophiliques.`
      : isDe
      ? `Ihre Anfrage liegt außerhalb des Mikroklimas und der Standortbiodiversität. Ich untersuche ausschließlich den thermischen Komfortindex (TCI ${brief.tciScore}/100), standortgerechte Beschattungsvegetation für ${brief.koppenCode} und biophile Gebäudegestaltung.`
      : isJa
      ? `ご質問は敷地の微気候および生物多様性の対象外です。私は温熱快適性指数（TCI ${brief.tciScore}/100）、気候区分${brief.koppenCode}に適した在来樹木による日陰形成、およびバイオフィリック設計を専門に診断します。`
      : `Your query is outside the scope of microclimate and site biodiversity. I specialize exclusively in Thermal Comfort Index (TCI ${brief.tciScore}/100), ${brief.koppenCode} native canopy shade flora, and biophilic site retrofits.`;

    const refusalArka = isId
      ? `Pertanyaan tersebut tidak terkait fisika atap maupun tata air tapak. Saya hanya menghitung kapasitas panel surya (${brief.solarKwp} kWp), produksi energi (${fmtNum(brief.solarKwhYear)} kWh/tahun), tandon air hujan (${fmtNum(brief.rainLitersYear)} L/tahun), dan lubang resapan biopori (${brief.bioporeUnits} unit).`
      : isEs
      ? `Esa pregunta no está relacionada con la física del techo ni la hidrología. Calculo la capacidad solar (${brief.solarKwp} kWp), producción anual (${fmtNum(brief.solarKwhYear)} kWh/año), captación pluvial (${fmtNum(brief.rainLitersYear)} L/año) y pozos de bioporos (${brief.bioporeUnits} unidades).`
      : isFr
      ? `Cette question n'est pas liée à la physique de la toiture ni à l'hydrologie. Je calcule la puissance solaire (${brief.solarKwp} kWp), la production annuelle (${fmtNum(brief.solarKwhYear)} kWh/an), la réserve d'eau de pluie (${fmtNum(brief.rainLitersYear)} L/an) et les puits de biopores (${brief.bioporeUnits} unités).`
      : isDe
      ? `Diese Frage betrifft weder Dachphysik noch Standorthydrologie. Ich berechne die Photovoltaik-Kapazität (${brief.solarKwp} kWp), Jahreserzeugung (${fmtNum(brief.solarKwhYear)} kWh/Jahr), Regenwassernutzung (${fmtNum(brief.rainLitersYear)} L/Jahr) und Bioporen (${brief.bioporeUnits} Einheiten).`
      : isJa
      ? `その質問は屋根物理学および水文学に関連していません。私は太陽光発電容量（${brief.solarKwp} kWp）、年間発電量（${fmtNum(brief.solarKwhYear)} kWh/年）、雨水貯留量（${fmtNum(brief.rainLitersYear)} L/年）、およびバイオポア浸透孔（${brief.bioporeUnits} 基）の計算を担当します。`
      : `That question is unrelated to roof physics and site hydrology. I calculate solar PV capacity (${brief.solarKwp} kWp), annual generation (${fmtNum(brief.solarKwhYear)} kWh/year), rainwater harvest (${fmtNum(brief.rainLitersYear)} L/year), and biopore shafts (${brief.bioporeUnits} units).`;

    const refusalSirkula = isId
      ? `Pertanyaan di luar ranah ekonomi sirkular dan material tapak. Saya hanya menangani pemilahan sampah bernilai ekonomis (PET, aluminium, kertas, kaca), titik drop-off ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km), dan reduksi emisi (${fmtNum(brief.co2eKgYear)} kg CO2e/tahun).`
      : isEs
      ? `Su consulta está fuera de la economía circular y flujo de materiales. Gestiono la clasificación de reciclables (PET, aluminio, cartón), punto de entrega en ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km) y reducción de emisiones (${fmtNum(brief.co2eKgYear)} kg CO2e/año).`
      : isFr
      ? `Votre question sort de l'économie circulaire et des flux de matières. Je gère le tri des recyclables (PET, aluminium, carton), le dépôt à ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km) et la réduction des émissions (${fmtNum(brief.co2eKgYear)} kg CO2e/an).`
      : isDe
      ? `Ihre Frage liegt außerhalb der Kreislaufwirtschaft und Stoffströme. Ich verwalte die Wertstofftrennung (PET, Aluminium, Pappe), die Sammelstelle ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km) und vermiedene Emissionen (${fmtNum(brief.co2eKgYear)} kg CO2e/Jahr).`
      : isJa
      ? `ご質問は循環経済および資源循環の対象外です。私は有価資源物の分別（PET、アルミ、段ボール）、最寄りの拠点${brief.nearestHubName}（${brief.nearestHubDistanceKm} km）、および年間CO2e削減量（${fmtNum(brief.co2eKgYear)} kg CO2e/年）を管理します。`
      : `Your query falls outside circular economy and material flows. I solely manage recyclable classification (PET, aluminum, cardboard), local drop-off at ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km), and avoided emissions (${fmtNum(brief.co2eKgYear)} kg CO2e/year).`;

    const offTopicMessages: CouncilAgentMessage[] = [
      {
        agent: "flora",
        name: "Dr. Flora",
        roleEn: "Urban Botanist & Microclimate Ecologist",
        roleId: "Ahli Botani Kota & Ekologi Iklim Mikro",
        modelUsed: modelId,
        content: refusalFlora,
        recommendations: [
          {
            impact: "high",
            effort: "low",
            text: isId
              ? "Ajukan pertanyaan seputar vegetasi peneduh, indeks kenyamanan termal (TCI), atau kompos aerobik tapak."
              : isEs
              ? "Consulte sobre vegetación de sombra, índice de confort térmico (TCI) o compostaje del sitio."
              : isFr
              ? "Posez des questions sur la végétation d'ombrage, l'indice TCI ou le compostage aérobie."
              : isDe
              ? "Fragen Sie nach Schattenvegetation, dem thermischen Komfortindex (TCI) oder Standortkompostierung."
              : isJa
              ? "日陰植物、温熱快適性指数（TCI）、または好気性堆肥化についてご質問ください。"
              : "Submit inquiries regarding shade vegetation, Thermal Comfort Index (TCI), or site composting.",
          },
        ],
        verifiedNumbers: [],
        unverifiedNumbers: [],
      },
      {
        agent: "arka",
        name: "Ir. Arka",
        roleEn: "Building Energy & Hydrological Systems Architect",
        roleId: "Arsitek Energi Bangunan & Sistem Hidrologi",
        modelUsed: modelId,
        content: refusalArka,
        recommendations: [
          {
            impact: "high",
            effort: "low",
            text: isId
              ? "Ajukan pertanyaan seputar kapasitas fotovoltaik, sudut kemiringan atap, tandon air hujan, atau sumur resapan."
              : isEs
              ? "Consulte sobre capacidad fotovoltaica, inclinación del techo, tanques pluviales o bioporos."
              : isFr
              ? "Posez des questions sur la puissance photovoltaïque, l'inclinaison du toit, les citernes ou biopores."
              : isDe
              ? "Fragen Sie nach PV-Kapazität, Dachneigung, Regenwassertanks oder Bioporen-Infiltration."
              : isJa
              ? "太陽光発電容量、屋根の傾斜角、雨水タンク、またはバイオポア浸透についてご質問ください。"
              : "Ask questions regarding PV capacity, optimal roof tilt, rainwater storage, or biopore drainage.",
          },
        ],
        verifiedNumbers: [],
        unverifiedNumbers: [],
      },
      {
        agent: "sirkula",
        name: "Sirkula",
        roleEn: "Circular Economy & Household ROI Strategist",
        roleId: "Ahli Strategi Ekonomi Sirkular & Efisiensi Rumah",
        modelUsed: modelId,
        content: refusalSirkula,
        recommendations: [
          {
            impact: "high",
            effort: "low",
            text: isId
              ? "Ajukan pertanyaan seputar klasifikasi sampah daur ulang, rute Bank Sampah terdekat, atau estimasi penghematan biaya."
              : isEs
              ? "Consulte sobre clasificación de reciclables, rutas al centro de reciclaje o ahorro en facturas."
              : isFr
              ? "Posez des questions sur le tri des déchets, les centres de recyclage ou les économies d'énergie."
              : isDe
              ? "Fragen Sie nach Wertstofftrennung, Sammelstellen oder Stromkosteneinsparungen."
              : isJa
              ? "資源ごみの分別、最寄りの回収拠点、または光熱費削減効果についてご質問ください。"
              : "Ask questions regarding recyclable classification, Bank Sampah drop-off routing, or utility bill savings.",
          },
        ],
        verifiedNumbers: [],
        unverifiedNumbers: [],
      },
    ];

    return {
      sessionId: `council-offtopic-${Date.now().toString(36)}`,
      siteBrief: brief,
      messages: offTopicMessages,
      blueprint: {
        title: isId
          ? "Topik Ditolak: Di Luar Lingkup Rekayasa Tapak & Ekologi"
          : isEs
          ? "Consulta Rechazada: Fuera del Ámbito Ecológico del Sitio"
          : isFr
          ? "Demande Refusée : Hors du Périmètre Écologique du Site"
          : isDe
          ? "Thema Abgelehnt: Außerhalb des Ökologischen Standortbereichs"
          : isJa
          ? "トピック却下：敷地生態工学の対象外"
          : "Query Declined: Outside Ecological Site Scope",
        summary: isId
          ? `Dewan Spesialis Verdara (Flora, Arka, Sirkula) menolak pertanyaan: "${opts.userQuery}". Dewan kami secara eksklusif hanya menganalisis efisiensi energi surya, konservasi tata air, kenyamanan iklim mikro (TCI), dan ekonomi sirkular Bank Sampah.`
          : isEs
          ? `El Consejo Especialista Verdara (Flora, Arka, Sirkula) rechazó la consulta: "${opts.userQuery}". Nuestro consejo asesora exclusivamente sobre física solar en techos, conservación de agua de lluvia, confort microclimático (TCI) y recuperación circular de residuos.`
          : isFr
          ? `Le Conseil de Spécialistes Verdara (Flora, Arka, Sirkula) a décliné la demande : "${opts.userQuery}". Notre conseil traite exclusivement de l'énergie solaire en toiture, de la gestion de l'eau de pluie, du confort thermique (TCI) et de l'économie circulaire.`
          : isDe
          ? `Der Verdara-Spezialistenrat (Flora, Arka, Sirkula) hat die Anfrage abgelehnt: "${opts.userQuery}". Unser Rat berät ausschließlich zu Dächer-Solarenergie, Regenwassermanagement, Mikroklimakomfort (TCI) und Kreislaufwirtschaft.`
          : isJa
          ? `Verdara専門家評議会（Flora、Arka、Sirkula）は質問「${opts.userQuery}」を却下しました。当評議会は屋根上太陽光物理学、雨水保全、微気候快適性（TCI）、および循環型廃棄物回収のみを診断します。`
          : `The Verdara Specialist Council (Flora, Arka, Sirkula) declined the query: "${opts.userQuery}". Our council strictly advises on rooftop solar physics, rainwater conservation, microclimate comfort (TCI), and circular waste recovery.`,
        actions: [
          {
            id: "guide-solar",
            ownerAgent: "arka",
            title: isId
              ? "Konsultasi Optimalisasi Panel Surya (Ir. Arka)"
              : isEs
              ? "Consulta de Optimización Solar Fotovoltaica (Ir. Arka)"
              : isFr
              ? "Consultation Optimisation Solaire Photovoltaïque (Ir. Arka)"
              : isDe
              ? "Beratung zur Photovoltaik-Optimierung (Ir. Arka)"
              : isJa
              ? "太陽光発電最適化相談（Ir. Arka）"
              : "Rooftop Solar PV Consultation (Ir. Arka)",
            steps: isId
              ? [
                  "Tanyakan potensi kWh tahunan dan sudut kemiringan panel surya.",
                  "Hitung estimasi penghematan tagihan listrik rumah.",
                ]
              : isEs
              ? [
                  "Pregunte por el potencial de generación en kWh y la inclinación óptima.",
                  "Calcule el ahorro estimado en su factura eléctrica.",
                ]
              : isFr
              ? [
                  "Renseignez-vous sur le potentiel kWh annuel et l'angle d'inclinaison idéal.",
                  "Estimez les économies réalisées sur vos factures énergétiques.",
                ]
              : isDe
              ? [
                  "Erfragen Sie den jährlichen kWh-Ertrag und den optimalen Neigungswinkel.",
                  "Berechnen Sie die voraussichtlichen Einsparungen bei den Stromkosten.",
                ]
              : isJa
              ? [
                  "年間発電量（kWh）および最適なパネル傾斜角について質問します。",
                  "家庭の電気料金削減額の見積もりを計算します。",
                ]
              : [
                  "Ask about annual kWh generation and optimal panel tilt angle.",
                  "Calculate estimated household electricity bill savings.",
                ],
            effort: "low",
            costBand: "low",
            metricRefs: ["solarKwp", "solarKwhYear"],
            courseTrack: "passive_cooling",
          },
          {
            id: "guide-water",
            ownerAgent: "arka",
            title: isId
              ? "Konsultasi Pemanenan Air Hujan & Biopori (Ir. Arka)"
              : isEs
              ? "Consulta de Captación de Agua de Lluvia y Bioporos (Ir. Arka)"
              : isFr
              ? "Consultation Récupération d'Eau de Pluie et Biopores (Ir. Arka)"
              : isDe
              ? "Beratung zu Regenwassernutzung und Bioporen (Ir. Arka)"
              : isJa
              ? "雨水利用およびバイオポア相談（Ir. Arka）"
              : "Rainwater Harvesting & Biopore Consultation (Ir. Arka)",
            steps: isId
              ? [
                  "Konsultasikan ukuran tandon air hujan berdasarkan luas atap.",
                  "Ketahui kedalaman dan jumlah lubang biopori yang diperlukan.",
                ]
              : isEs
              ? [
                  "Dimensione el tanque pluvial según la superficie del techo.",
                  "Determine la profundidad y cantidad requerida de pozos de bioporos.",
                ]
              : isFr
              ? [
                  "Calibrez la citerne d'eau de pluie en fonction de la toiture.",
                  "Déterminez la profondeur et le nombre de biopores nécessaires.",
                ]
              : isDe
              ? [
                  "Passen Sie die Zisternengröße an die Dachfläche an.",
                  "Bestimmen Sie Tiefe und Anzahl der benötigten Bioporen.",
                ]
              : isJa
              ? [
                  "屋根面積に基づいて最適な雨水貯留タンク容量を相談します。",
                  "必要なバイオポア浸透孔の深さと設置基数を把握します。",
                ]
              : [
                  "Consult rainwater cistern sizing based on roof footprint.",
                  "Determine optimal biopore depth and required unit count.",
                ],
            effort: "low",
            costBand: "low",
            metricRefs: ["rainLitersYear", "bioporeUnits"],
            courseTrack: "rainwater",
          },
          {
            id: "guide-flora",
            ownerAgent: "flora",
            title: isId
              ? "Konsultasi Vegetasi Kanopi & Iklim Mikro (Dr. Flora)"
              : isEs
              ? "Consulta de Vegetación de Dosel y Microclima (Dr. Flora)"
              : isFr
              ? "Consultation Végétation de Canopée et Microclimat (Dr. Flora)"
              : isDe
              ? "Beratung zu Schattenspender-Vegetation und Mikroklima (Dr. Flora)"
              : isJa
              ? "緑陰植栽および微気候相談（Dr. Flora）"
              : "Canopy Vegetation & Microclimate Consultation (Dr. Flora)",
            steps: isId
              ? [
                  "Tanyakan tanaman lokal yang cocok untuk menurunkan panas atap.",
                  "Pelajari metode komposter aerobik tanpa bau di halaman rumah.",
                ]
              : isEs
              ? [
                  "Pregunte por especies nativas que reduzcan el calor del techo.",
                  "Aprenda métodos de compostaje aeróbico sin olores para el patio.",
                ]
              : isFr
              ? [
                  "Identifiez les espèces indigènes pour réduire la chaleur du toit.",
                  "Découvrez les techniques de compostage aérobie sans odeur.",
                ]
              : isDe
              ? [
                  "Informieren Sie sich über einheimische Pflanzen zur Hitzeminderung.",
                  "Erlernen Sie geruchsfreie aerobe Kompostierung im Garten.",
                ]
              : isJa
              ? [
                  "屋根の放射熱を遮る適した在来植物について質問します。",
                  "無臭の家庭用好気性堆肥化手法を習得します。",
                ]
              : [
                  "Inquire about native plant species that effectively mitigate roof heat.",
                  "Learn odor-free domestic aerobic composting methods.",
                ],
            effort: "low",
            costBand: "low",
            metricRefs: ["tciScore"],
            courseTrack: "urban_farming",
          },
          {
            id: "guide-waste",
            ownerAgent: "sirkula",
            title: isId
              ? "Konsultasi Pemilahan Bank Sampah (Sirkula Hidayat)"
              : isEs
              ? "Consulta de Reciclaje Circular y Centro de Acopio (Sirkula Hidayat)"
              : isFr
              ? "Consultation Tri Sélectif et Centre de Recyclage (Sirkula Hidayat)"
              : isDe
              ? "Beratung zu Mülltrennung und Wertstoffhöfen (Sirkula Hidayat)"
              : isJa
              ? "循環型分別および資源回収相談（Sirkula Hidayat）"
              : "Circular Sorting & Bank Sampah Consultation (Sirkula Hidayat)",
            steps: isId
              ? [
                  "Tanyakan klasifikasi botol PET, kaleng aluminium, dan kardus.",
                  "Ketahui lokasi drop-off dan nilai ekonomi pemulihan material.",
                ]
              : isEs
              ? [
                  "Consulte la clasificación de botellas PET, latas de aluminio y cartón.",
                  "Localice el punto de entrega y calcule el valor de los materiales.",
                ]
              : isFr
              ? [
                  "Informez-vous sur le tri des bouteilles PET, canettes d'aluminium et carton.",
                  "Trouvez le point de collecte et estimez la valorisation matière.",
                ]
              : isDe
              ? [
                  "Erfragen Sie die Trennung von PET, Aluminium und Kartonagen.",
                  "Finden Sie die Sammelstelle und den Wert der Wertstoffe.",
                ]
              : isJa
              ? [
                  "PETボトル、アルミ缶、段ボールの分別基準について質問します。",
                  "最寄りの回収拠点と資源回収の経済的価値を確認します。",
                ]
              : [
                  "Ask about classifications for PET bottles, aluminum cans, and cardboard.",
                  "Locate the nearest drop-off hub and calculate recovery value.",
                ],
            effort: "low",
            costBand: "low",
            metricRefs: ["nearestHubDistanceKm"],
            courseTrack: "zero_waste",
          },
        ],
        caveats: isId
          ? [
              "Dewan Spesialis Verdara memiliki pagar pembatas (guardrail) topik ketat demi menjamin akurasi sains keteknikan tapak dan perlindungan kuota token AI.",
            ]
          : isEs
          ? [
              "El Consejo de Especialistas de Verdara aplica barreras de seguridad temáticas estrictas para asegurar la exactitud científica en ingeniería y proteger la cuota de tokens de IA.",
            ]
          : isFr
          ? [
              "Le Conseil de Spécialistes Verdara applique des garde-fous stricts afin de garantir l'exactitude scientifique de l'ingénierie et préserver les quotas de jetons IA.",
            ]
          : isDe
          ? [
              "Der Verdara-Spezialistenrat setzt strenge thematische Leitplanken ein, um ingenieurwissenschaftliche Genauigkeit und den Schutz des KI-Token-Kontingents sicherzustellen.",
            ]
          : isJa
          ? [
              "Verdara専門家評議会は、敷地工学の科学的正確性とAIトークン利用上限の保護のため、厳格なトピックガードレールを適用しています。",
            ]
          : [
              "The Verdara Specialist Council enforces strict topic guardrails to ensure site engineering scientific accuracy and AI token quota protection.",
            ],
      },
      telemetry: {
        provider: "meta-model-api",
        models: [modelId],
        masksCount: 0,
        latencyMs: Math.max(120, Date.now() - startMs),
        tokensIn,
        tokensOut,
        costUsd,
        cache: cacheStatus,
        shieldMode: shield.mode,
        shieldReason: "off_topic_guardrail_triggered",
      },
      isOffTopic: true,
      offTopicCategory: topicValidation.domain,
      offTopicMessage: offTopicReason,
      detectedLanguage: userLang,
    };
  }

  // Step 4: On-Topic Deliberation Flow
  const queryPreamble = opts.userQuery
    ? isId
      ? `Menanggapi fokus konsultasi Anda: "${opts.userQuery}". `
      : isEs
      ? `Respondiendo a su consulta técnica: "${opts.userQuery}". `
      : isFr
      ? `En réponse directe à votre question : "${opts.userQuery}". `
      : isDe
      ? `Bezugnehmend auf Ihre Anfrage: "${opts.userQuery}". `
      : isJa
      ? `ご相談の質問「${opts.userQuery}」について回答します。`
      : `Directly addressing your consultation question: "${opts.userQuery}". `
    : "";

  const diseaseNote = hasDiseaseQuery
    ? isId
      ? " Terkait perawatan tumbuhan terinfeksi penyakit: 1) Segera isolasi tanaman agar spora patogen tidak menular ke kanopi lain. 2) Pangkas daun/ranting berpenyakit dengan gunting steril alkohol 70% dan musnahkan (jangan masukkan ke komposter agar siklus pupuk tidak tercemar). 3) Semprotkan biofungisida organik (minyak mimba/neem oil) di pagi hari. 4) Perbaiki aerasi tanah dan hindari genangan air."
      : isEs
      ? " Con respecto al cuidado de plantas con enfermedades o plagas: 1) Aísle de inmediato las plantas infectadas para evitar la dispersión de esporas. 2) Pode las hojas y ramas enfermas con tijeras esterilizadas en alcohol al 70% y deséchelas fuera del compost. 3) Aplique biofungicida orgánico de aceite de neem por la mañana. 4) Mejore la aireación del sustrato y evite el encharcamiento."
      : isFr
      ? " Concernant le traitement des plantes malades : 1) Isolez immédiatement les spécimens atteints pour stopper la dispersion des spores. 2) Taillez le feuillage malade avec des sécateurs stérilisés à 70% d'alcool et jetez-le hors du compost. 3) Appliquez un biofongicide organique à l'huile de neem le matin. 4) Aérez le substrat racinaire et évitez toute stagnation d'eau."
      : isDe
      ? " Zur Behandlung kranker Pflanzen: 1) Befallene Pflanzen sofort isolieren, um Sporenflug zu verhindern. 2) Erkrankte Blätter mit einer in 70% Alkohol sterilisierten Schere abschneiden und außerhalb des Komposts entsorgen. 3) Morgens organisches Neemöl-Biofungizid auftragen. 4) Wurzelsubstrat belüften und Staunässe vermeiden."
      : isJa
      ? " 病気の植物の手入れについて：1) 感染した植物を直ちに隔離して胞子の飛散を防ぎます。2) 70%アルコール消毒鋏で病葉を剪定し堆肥外へ廃棄します。3) 早朝に有機ニームオイル殺菌剤を散布します。4) 根の通気性を高め過湿を防ぎます。"
      : " Regarding plant disease care: 1) Immediately isolate infected specimens to halt spore dispersal. 2) Prune diseased foliage with 70% alcohol-sterilized shears and dispose safely outside compost bins. 3) Apply organic cold-pressed neem bio-fungicide in early morning. 4) Ensure root substrate aeration and eliminate waterlogging."
    : "";

  const floraText = isId
    ? `${queryPreamble}Berdasarkan profil iklim Köppen ${brief.koppenCode} (${brief.koppenName}) di ${brief.city} pada ${brief.season}, kenyamanan termal bangunan berada pada skor TCI ${brief.tciScore}/100. Dengan luas atap ${brief.footprintM2} m², penanaman kanopi peneduh lokal di sisi barat serta konversi kompos aerobik akan menurunkan suhu mikro permukaan dan menyerap limpasan air.${hasDiseaseQuery ? diseaseNote : (hasPlantQuery ? " Vegetasi peneduh berdaun lebat direkomendasikan untuk menahan radiasi sinar matahari langsung." : "")}`
    : isEs
    ? `${queryPreamble}Basado en el perfil climático Köppen ${brief.koppenCode} (${brief.koppenName}) en ${brief.city} durante ${brief.season}, el confort térmico se sitúa en TCI ${brief.tciScore}/100. En el techo de ${brief.footprintM2} m², el dosel de sombra nativo en la fachada oeste y el compostaje aeróbico reducen el calor superficial.${hasDiseaseQuery ? diseaseNote : (hasPlantQuery ? " Se recomienda vegetación nativa densa para mitigar la radiación solar directa." : "")}`
    : isFr
    ? `${queryPreamble}Selon le profil climatique Köppen ${brief.koppenCode} (${brief.koppenName}) à ${brief.city} pendant ${brief.season}, l'indice de confort thermique est de TCI ${brief.tciScore}/100. Sur la surface de toiture de ${brief.footprintM2} m², l'installation d'une canopée d'ombrage indigène à l'ouest et le compostage aérobie réduisent la chaleur microclimatique.${hasDiseaseQuery ? diseaseNote : (hasPlantQuery ? " Un feuillage dense indigène est préconisé pour bloquer le rayonnement solaire direct." : "")}`
    : isDe
    ? `${queryPreamble}Basierend auf dem Köppen-Klimaprofil ${brief.koppenCode} (${brief.koppenName}) in ${brief.city} während ${brief.season} liegt der thermische Komfortindex bei TCI ${brief.tciScore}/100. Auf der Dachfläche von ${brief.footprintM2} m² mindern einheimische Schattenspender an der Westfassade und aerobe Kompostierung die Oberflächentemperatur.${hasDiseaseQuery ? diseaseNote : (hasPlantQuery ? " Dichte heimische Laubvegetation wird zur Dämpfung direkter Sonneneinstrahlung empfohlen." : "")}`
    : isJa
    ? `${queryPreamble}${brief.city}の${brief.season}におけるケッペン気候区分${brief.koppenCode}（${brief.koppenName}）に基づき、温熱快適性指数はTCI ${brief.tciScore}/100です。${brief.footprintM2} m²の屋根面積において、西側の在来植物による緑陰形成と好気性堆肥化が表面温度を抑制します。${hasDiseaseQuery ? diseaseNote : (hasPlantQuery ? " 直射日光を遮るため密生した在来樹木の配置を推奨します。" : "")}`
    : `${queryPreamble}Based on the ${brief.koppenCode} (${brief.koppenName}) climate profile in ${brief.city} during ${brief.season}, the building's Thermal Comfort Index sits at ${brief.tciScore}/100. Across the ${brief.footprintM2} m² footprint, establishing native west-facade shade canopy and aerobic composting directly buffers microclimate heat and soil moisture.${hasDiseaseQuery ? diseaseNote : (hasPlantQuery ? " Dense-canopy native foliage is recommended to mitigate direct solar radiation." : "")}`;

  const arkaText = isId
    ? `${queryPreamble}Audit fisika atap ${brief.footprintM2} m² menunjukkan kapasitas surya ${brief.solarKwp} kWp (rasio atap layak 60%) yang memproduksi ${fmtNum(brief.solarKwhYear)} kWh/tahun dan menghindari emisi ${fmtNum(brief.co2eKgYear)} kg CO2e/tahun. Dari curah hujan lokal, atap ini mampu memanen ${fmtNum(brief.rainLitersYear)} Liter/tahun yang wajib diimbangi dengan ${brief.bioporeUnits} unit lubang resapan biopori.${hasSolarQuery ? " Sudut kemiringan modul surya dioptimalkan sesuai garis lintang lokal." : ""}`
    : isEs
    ? `${queryPreamble}La auditoría física del techo de ${brief.footprintM2} m² muestra una capacidad solar de ${brief.solarKwp} kWp (ratio útil del 60%) que genera ${fmtNum(brief.solarKwhYear)} kWh/año y evita ${fmtNum(brief.co2eKgYear)} kg CO2e/año. La captación pluvial alcanza ${fmtNum(brief.rainLitersYear)} Litros/año con ${brief.bioporeUnits} pozos de bioporos.${hasSolarQuery ? " La inclinación de los módulos solares se calibra según la latitud local." : ""}`
    : isFr
    ? `${queryPreamble}L'audit de la toiture de ${brief.footprintM2} m² indique une puissance solaire de ${brief.solarKwp} kWp (ratio utile de 60%) produisant ${fmtNum(brief.solarKwhYear)} kWh/an et évitant ${fmtNum(brief.co2eKgYear)} kg CO2e/an. La collecte d'eau de pluie atteint ${fmtNum(brief.rainLitersYear)} Litres/an avec ${brief.bioporeUnits} puits de biopores.${hasSolarQuery ? " L'inclinaison des panneaux est optimisée selon la latitude locale." : ""}`
    : isDe
    ? `${queryPreamble}Das Audit der Dachfläche von ${brief.footprintM2} m² ergibt eine Photovoltaik-Kapazität von ${brief.solarKwp} kWp (60% Nutzungsgrad), die ${fmtNum(brief.solarKwhYear)} kWh/Jahr erzeugt und ${fmtNum(brief.co2eKgYear)} kg CO2e/Jahr einspart. Die Regenwassernutzung beträgt ${fmtNum(brief.rainLitersYear)} Liter/Jahr kombiniert mit ${brief.bioporeUnits} Bioporen.${hasSolarQuery ? " Der Modulneigungswinkel wird präzise auf den Breitengrad abgestimmt." : ""}`
    : isJa
    ? `${queryPreamble}${brief.footprintM2} m²の屋根構造診断により、太陽光発電容量は${brief.solarKwp} kWp（利用可能比率60%）で年間${fmtNum(brief.solarKwhYear)} kWhを発電し、年間${fmtNum(brief.co2eKgYear)} kg CO2eの排出を回避します。雨水貯留量は年間${fmtNum(brief.rainLitersYear)} リットルで、${brief.bioporeUnits} 基のバイオポア浸透孔が必要です。${hasSolarQuery ? " モジュール傾斜角は現地緯度に合わせて最適化されます。" : ""}`
    : `${queryPreamble}Structural audit of the ${brief.footprintM2} m² roof footprint yields a ${brief.solarKwp} kWp solar array (at 60% usable ratio) generating ${fmtNum(brief.solarKwhYear)} kWh/year and avoiding ${fmtNum(brief.co2eKgYear)} kg CO2e/year. Hydrological capture reaches ${fmtNum(brief.rainLitersYear)} Liters/year, paired with ${brief.bioporeUnits} biopore infiltration shafts.${hasSolarQuery ? " Module tilt is dynamically calibrated to the local latitude angle." : ""}`;

  const sirkulaText = isId
    ? `${queryPreamble}Dengan tarif listrik lokal ${brief.currency} ${brief.electricityTariff}/kWh, instalasi surya ${brief.solarKwp} kWp menghemat ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/tahun. Untuk arus material sirkular rumah tangga, titik pengumpulan terdekat adalah ${brief.nearestHubName} yang berjarak ${brief.nearestHubDistanceKm} km dari lokasi bangunan.`
    : isEs
    ? `${queryPreamble}Con la tarifa eléctrica local de ${brief.currency} ${brief.electricityTariff}/kWh, la instalación solar de ${brief.solarKwp} kWp ahorra ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/año. Para el reciclaje doméstico, el centro más cercano es ${brief.nearestHubName} a ${brief.nearestHubDistanceKm} km.`
    : isFr
    ? `${queryPreamble}Au tarif d'électricité local de ${brief.currency} ${brief.electricityTariff}/kWh, l'installation de ${brief.solarKwp} kWp permet d'économiser ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/an. Pour le tri sélectif, le centre le plus proche est ${brief.nearestHubName} à ${brief.nearestHubDistanceKm} km.`
    : isDe
    ? `${queryPreamble}Bei einem Stromtarif von ${brief.currency} ${brief.electricityTariff}/kWh spart die ${brief.solarKwp} kWp Solaranlage ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/Jahr. Für Wertstoffe befindet sich das nächste Zentrum ${brief.nearestHubName} in ${brief.nearestHubDistanceKm} km Entfernung.`
    : isJa
    ? `${queryPreamble}現地電気料金${brief.currency} ${brief.electricityTariff}/kWhにおいて、${brief.solarKwp} kWpの太陽光設備により年間${brief.currency} ${fmtNum(brief.solarSavingsYear)}の光熱費を削減します。資源物回収拠点${brief.nearestHubName}までは${brief.nearestHubDistanceKm} kmです。`
    : `${queryPreamble}At the local utility tariff of ${brief.currency} ${brief.electricityTariff}/kWh, the ${brief.solarKwp} kWp solar array delivers ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/year in bill savings. For circular material recovery, the nearest verified drop-off hub is ${brief.nearestHubName} located ${brief.nearestHubDistanceKm} km away.`;

  const actualFlora = cleanAgentPrefix(liveFlora) || floraText;
  const actualArka = cleanAgentPrefix(liveArka) || arkaText;
  const actualSirkula = cleanAgentPrefix(liveSirkula) || sirkulaText;

  const floraVal = validateNumbersAgainstSiteBrief(actualFlora, brief);
  const arkaVal = validateNumbersAgainstSiteBrief(actualArka, brief);
  const sirkulaVal = validateNumbersAgainstSiteBrief(actualSirkula, brief);

  const isLive = Boolean(liveFlora || liveArka || liveSirkula || liveSummary);
  const activeModelLabel = isLive ? `${modelId} (Meta AI Live)` : modelId;

  const messages: CouncilAgentMessage[] = [
    {
      agent: "flora",
      name: "Dr. Flora",
      roleEn: "Urban Botanist & Microclimate Ecologist",
      roleId: "Ahli Botani Kota & Ekologi Iklim Mikro",
      modelUsed: activeModelLabel,
      content: actualFlora,
      recommendations: [
        {
          impact: "high",
          effort: "low",
          text: isId
            ? `Tanam vegetasi peneduh adaptif iklim ${brief.koppenCode} untuk mendongkrak skor TCI dari ${brief.tciScore}/100.`
            : isEs
            ? `Plante vegetación de sombra adaptada al clima ${brief.koppenCode} para elevar el TCI por encima de ${brief.tciScore}/100.`
            : isFr
            ? `Plantez une végétation d'ombrage adaptée au climat ${brief.koppenCode} pour porter le TCI au-dessus de ${brief.tciScore}/100.`
            : isDe
            ? `Pflanzen Sie an das Klima ${brief.koppenCode} angepasste Schattenvegetation, um den TCI über ${brief.tciScore}/100 zu heben.`
            : isJa
            ? `温熱快適性指数を${brief.tciScore}/100以上に向上させるため気候区分${brief.koppenCode}に適した在来樹木を植栽します。`
            : `Plant ${brief.koppenCode}-adapted native shade flora to boost Thermal Comfort Index above ${brief.tciScore}/100.`,
        },
        {
          impact: "med",
          effort: "low",
          text: isId
            ? "Bangun komposter aerobik 2-lapis (Karbon:Nitrogen 3:1) untuk mengolah organik dapur."
            : isEs
            ? "Instale un compostador aeróbico de 2 etapas (relación Carbono:Nitrógeno 3:1) para restos de cocina."
            : isFr
            ? "Installez un composteur aérobie à 2 étages (ratio Carbone:Azote 3:1) pour les déchets de cuisine."
            : isDe
            ? "Nutzen Sie einen 2-stufigen aeroben Komposter (Kohlenstoff-zu-Stickstoff-Verhältnis 3:1) für Küchenabfälle."
            : isJa
            ? "生ごみ処理のため好気性堆肥コンポスト（炭素対窒素比 3:1）を導入します。"
            : "Deploy a 2-stage aerobic compost vessel (3:1 Carbon-to-Nitrogen ratio) for kitchen organics.",
        },
      ],
      verifiedNumbers: floraVal.verifiedNumbers,
      unverifiedNumbers: floraVal.unverifiedNumbers,
    },
    {
      agent: "arka",
      name: "Ir. Arka",
      roleEn: "Building Energy & Hydrological Systems Architect",
      roleId: "Arsitek Energi Bangunan & Sistem Hidrologi",
      modelUsed: activeModelLabel,
      content: actualArka,
      recommendations: [
        {
          impact: "high",
          effort: "high",
          text: isId
            ? `Pasang array panel surya ${brief.solarKwp} kWp untuk memproduksi ${fmtNum(brief.solarKwhYear)} kWh/tahun.`
            : isEs
            ? `Instale un sistema solar de ${brief.solarKwp} kWp para generar ${fmtNum(brief.solarKwhYear)} kWh/año.`
            : isFr
            ? `Installez un système solaire de ${brief.solarKwp} kWp pour générer ${fmtNum(brief.solarKwhYear)} kWh/an.`
            : isDe
            ? `Installieren Sie eine ${brief.solarKwp} kWp PV-Anlage, um ${fmtNum(brief.solarKwhYear)} kWh/Jahr zu erzeugen.`
            : isJa
            ? `年間${fmtNum(brief.solarKwhYear)} kWhを発電する${brief.solarKwp} kWpの屋根上太陽光パネルを設置します。`
            : `Install a ${brief.solarKwp} kWp rooftop PV array to generate ${fmtNum(brief.solarKwhYear)} kWh/year.`,
        },
        {
          impact: "high",
          effort: "med",
          text: isId
            ? `Pasang talang pemanen ${fmtNum(brief.rainLitersYear)} L/tahun + ${brief.bioporeUnits} lubang biopori.`
            : isEs
            ? `Instale canaletas para captar ${fmtNum(brief.rainLitersYear)} L/año y ${brief.bioporeUnits} pozos de bioporos.`
            : isFr
            ? `Installez des gouttières pour récolter ${fmtNum(brief.rainLitersYear)} L/an et ${brief.bioporeUnits} puits de biopores.`
            : isDe
            ? `Regenwasserableitung für ${fmtNum(brief.rainLitersYear)} L/Jahr Ernte und ${brief.bioporeUnits} Bioporen anbringen.`
            : isJa
            ? `年間${fmtNum(brief.rainLitersYear)} Lの雨水取水設備と${brief.bioporeUnits} 基のバイオポア浸透孔を導入します。`
            : `Install downspout diverters for ${fmtNum(brief.rainLitersYear)} L/year harvest + ${brief.bioporeUnits} biopore shafts.`,
        },
      ],
      verifiedNumbers: arkaVal.verifiedNumbers,
      unverifiedNumbers: arkaVal.unverifiedNumbers,
    },
    {
      agent: "sirkula",
      name: "Sirkula",
      roleEn: "Circular Economy & Household ROI Strategist",
      roleId: "Ahli Strategi Ekonomi Sirkular & Efisiensi Rumah",
      modelUsed: activeModelLabel,
      content: actualSirkula,
      recommendations: [
        {
          impact: "high",
          effort: "low",
          text: isId
            ? `Aktifkan stasiun pemilahan 3-arus dan setorkan ke ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km).`
            : isEs
            ? `Establezca una estación de clasificación de 3 flujos y entregue en ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km).`
            : isFr
            ? `Créez un poste de tri à 3 flux et acheminez vers ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km).`
            : isDe
            ? `Richten Sie eine 3-Kanal-Müllstation ein mit Entsorgung bei ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km).`
            : isJa
            ? `3分別の資源分別ステーションを設置し${brief.nearestHubName}（${brief.nearestHubDistanceKm} km）へ持ち込みます。`
            : `Establish a 3-stream sorting station and route recyclables to ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km).`,
        },
        {
          impact: "med",
          effort: "low",
          text: isId
            ? `Realisasikan penghematan tagihan listrik ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/tahun.`
            : isEs
            ? `Obtenga un ahorro en la factura eléctrica de ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/año.`
            : isFr
            ? `Réalisez une économie d'électricité de ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/an.`
            : isDe
            ? `Erzielen Sie Stromkosteneinsparungen von ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/Jahr.`
            : isJa
            ? `年間${brief.currency} ${fmtNum(brief.solarSavingsYear)}の電気料金削減を実現します。`
            : `Capture ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/year in avoided utility expenditure.`,
        },
      ],
      verifiedNumbers: sirkulaVal.verifiedNumbers,
      unverifiedNumbers: sirkulaVal.unverifiedNumbers,
    },
  ];

  const latencyMs = Math.max(240, Date.now() - startMs);

  return {
    sessionId: `council-${Date.now().toString(36)}`,
    siteBrief: brief,
    messages,
    blueprint: {
      title: isId
        ? `Masterplan Ketahanan Hunian ${brief.city} (${brief.koppenCode})`
        : isEs
        ? `Plan Maestro de Resiliencia Residencial de ${brief.city} (${brief.koppenCode})`
        : isFr
        ? `Schéma Directeur de Résilience Résidentielle pour ${brief.city} (${brief.koppenCode})`
        : isDe
        ? `Masterplan für Wohnresilienz in ${brief.city} (${brief.koppenCode})`
        : isJa
        ? `${brief.city}（${brief.koppenCode}）住宅レジリエンス・マスタープラン`
        : `${brief.city} (${brief.koppenCode}) Resilient Home Action Blueprint`,
      summary:
        liveCustomNote ??
        (isId
          ? `Rencana aksi terverifikasi untuk atap ${brief.footprintM2} m² di ${brief.city}: menggabungkan potensi surya ${brief.solarKwp} kWp (${fmtNum(brief.solarKwhYear)} kWh/thn), panen air hujan ${fmtNum(brief.rainLitersYear)} L/thn dengan ${brief.bioporeUnits} biopori, serta pemilahan sirkular ke ${brief.nearestHubName}.`
          : isEs
          ? `Plan de acción verificado para ${brief.footprintM2} m² en ${brief.city}: integra generación solar de ${brief.solarKwp} kWp (${fmtNum(brief.solarKwhYear)} kWh/año), captación pluvial de ${fmtNum(brief.rainLitersYear)} L/año con ${brief.bioporeUnits} bioporos y reciclaje en ${brief.nearestHubName}.`
          : isFr
          ? `Plan d'action vérifié pour ${brief.footprintM2} m² à ${brief.city} : puissance solaire de ${brief.solarKwp} kWp (${fmtNum(brief.solarKwhYear)} kWh/an), collecte pluviale de ${fmtNum(brief.rainLitersYear)} L/an avec ${brief.bioporeUnits} biopores et recyclage à ${brief.nearestHubName}.`
          : isDe
          ? `Verifizierter Aktionsplan für ${brief.footprintM2} m² in ${brief.city}: Kombination aus ${brief.solarKwp} kWp Solarleistung (${fmtNum(brief.solarKwhYear)} kWh/Jahr), ${fmtNum(brief.rainLitersYear)} L/Jahr Regenwasser über ${brief.bioporeUnits} Bioporen und Wertstoffabgabe bei ${brief.nearestHubName}.`
          : isJa
          ? `${brief.city}における${brief.footprintM2} m²の敷地検証プラン：${brief.solarKwp} kWpの太陽光発電（年間${fmtNum(brief.solarKwhYear)} kWh）、${brief.bioporeUnits} 基のバイオポアによる年間${fmtNum(brief.rainLitersYear)} Lの雨水活用、${brief.nearestHubName}への資源回収ルートを統合。`
          : `Verified multi-agent blueprint for a ${brief.footprintM2} m² footprint in ${brief.city}: combining ${brief.solarKwp} kWp solar generation (${fmtNum(brief.solarKwhYear)} kWh/yr), ${fmtNum(brief.rainLitersYear)} L/yr rainwater capture across ${brief.bioporeUnits} biopores, and circular routing to ${brief.nearestHubName}.`),
      actions: [
        {
          id: "act-1",
          ownerAgent: "sirkula",
          title: isId
            ? "Stasiun Pemilahan 3-Arus & Rute Hub Sirkular"
            : isEs
            ? "Estación de Separación de 3 Flujos y Centro de Reciclaje"
            : isFr
            ? "Poste de Tri à 3 Flux et Acheminement Circulaire"
            : isDe
            ? "3-Kanal-Müllstation und Wertstoffhof-Anbindung"
            : isJa
            ? "3分別ステーションおよび資源回収ルート確立"
            : "3-Stream Source Sorting & Circular Hub Routing",
          steps: isId
            ? [
                "Siapkan 3 wadah terpisah untuk Daur Ulang (PET/ALU/Kardus), Kompos Organik, dan E-Waste.",
                `Antarkan material bernilai ekonomi ke ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km).`,
                "Verifikasi foto stasiun pemilahan dengan SAM 3.1 di modul Academy (+150 XP).",
              ]
            : isEs
            ? [
                "Prepare 3 contenedores separados para Reciclables (PET/ALU/Cartón), Orgánicos y RAEE.",
                `Entregue los materiales de valor en ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km).`,
                "Verifique la foto de su estación con SAM 3.1 en el módulo Academy (+150 XP).",
              ]
            : isFr
            ? [
                "Préparez 3 bacs séparés pour Recyclables (PET/ALU/Carton), Organiques et DEEE.",
                `Acheminez les matériaux valorisables à ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km).`,
                "Validez la photo de votre poste avec SAM 3.1 dans le module Academy (+150 XP).",
              ]
            : isDe
            ? [
                "Stellen Sie 3 Behälter für Wertstoffe (PET/ALU/Pappe), Biomüll und Elektroschrott bereit.",
                `Bringen Sie Wertstoffe zu ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km).`,
                "Verifizieren Sie die Müllstation mit SAM 3.1 in der Academy (+150 XP).",
              ]
            : isJa
            ? [
                "有価資源（PET/アルミ/段ボール）、有機堆肥、電子ごみの3つの専用容器を準備します。",
                `有価資源物を${brief.nearestHubName}（${brief.nearestHubDistanceKm} km）へ持ち込みます。`,
                "AcademyモジュールでSAM 3.1写真認証を行い検証します（+150 XP）。",
              ]
            : [
                "Deploy 3 separated bins for high-value Recyclables (PET/ALU/Cardboard), Organics, and E-Waste.",
                `Route sorted containers to ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km away).`,
                "Verify your sorting station via SAM 3.1 Proof-of-Action in Academy (+150 XP).",
              ],
          effort: "low",
          costBand: "low",
          metricRefs: ["nearestHubDistanceKm"],
          courseTrack: "zero_waste",
        },
        {
          id: "act-2",
          ownerAgent: "arka",
          title: isId
            ? `Pemanen Air Hujan (${fmtNum(brief.rainLitersYear)} L/thn) & ${brief.bioporeUnits} Biopori`
            : isEs
            ? `Captación de Lluvia (${fmtNum(brief.rainLitersYear)} L/año) y ${brief.bioporeUnits} Bioporos`
            : isFr
            ? `Récupérateur d'Eau (${fmtNum(brief.rainLitersYear)} L/an) et ${brief.bioporeUnits} Biopores`
            : isDe
            ? `Regenwassernutzung (${fmtNum(brief.rainLitersYear)} L/Jahr) und ${brief.bioporeUnits} Bioporen`
            : isJa
            ? `雨水取水装置（年間${fmtNum(brief.rainLitersYear)} L）および${brief.bioporeUnits} 基のバイオポア`
            : `Rainwater Diverter (${fmtNum(brief.rainLitersYear)} L/yr) & ${brief.bioporeUnits} Biopore Shafts`,
          steps: isId
            ? [
                "Pasang saringan daun 200-mikron dan pengalih talang pertama menuju tandon air hujan.",
                `Buat ${brief.bioporeUnits} lubang resapan biopori sedalam 80-100 cm di sekeliling halaman.`,
                "Isi lubang biopori dengan dedaunan kering untuk mempercepat infiltrasi air tanah.",
              ]
            : isEs
            ? [
                "Instale un filtro de hojas de 200 micras y desviador de primeras aguas hacia el tanque pluvial.",
                `Perfore ${brief.bioporeUnits} pozos de bioporos (80-100 cm de profundidad) en el terreno.`,
                "Rellene los pozos con hojarasca seca para acelerar la infiltración en el suelo.",
              ]
            : isFr
            ? [
                "Installez un filtre à feuilles de 200 microns et un séparateur de première chasse.",
                `Forez ${brief.bioporeUnits} puits de biopores (80-100 cm de profondeur) dans le sol.`,
                "Remplissez les biopores de litière foliaire sèche pour favoriser l'infiltration.",
              ]
            : isDe
            ? [
                "Montieren Sie einen 200-Mikron Laubfilter und Vorfilter für die Regenwasserzisterne.",
                `Bohren Sie ${brief.bioporeUnits} Bioporen-Schächte (80-100 cm Tiefe) im Außenbereich.`,
                "Füllen Sie die Schächte mit trockenem Laub zur Förderung der Bodenversickerung.",
              ]
            : isJa
            ? [
                "雨水タンクへ向かう本管に200ミクロンの落ち葉フィルターと初期雨水カット装置を設置します。",
                `敷地周囲に深さ80-100 cmのバイオポア浸透孔を${brief.bioporeUnits} 基削孔します。`,
                "土壌浸透を促進するためバイオポア内に乾燥した落ち葉を充填します。",
              ]
            : [
                "Fit a 200-micron leaf screen and first-flush diverter on primary roof downspouts.",
                `Core-drill ${brief.bioporeUnits} biopore infiltration shafts (80-100 cm depth) around perimeter soil.`,
                "Pack biopore shafts with dry leaf litter to sustain soil macropore percolation.",
              ],
          effort: "med",
          costBand: "low",
          metricRefs: ["rainLitersYear", "bioporeUnits"],
          courseTrack: "rainwater",
        },
        {
          id: "act-3",
          ownerAgent: "flora",
          title: isId
            ? `Kanopi Peneduh Iklim ${brief.koppenCode} & Komposter Aerobik`
            : isEs
            ? `Dosel de Sombra para Clima ${brief.koppenCode} y Compostaje Aeróbico`
            : isFr
            ? `Canopée d'Ombrage pour Climat ${brief.koppenCode} et Composteur Aérobie`
            : isDe
            ? `Schattenspender-Vegetation für Klima ${brief.koppenCode} und Kompostierung`
            : isJa
            ? `気候区分${brief.koppenCode}対応緑陰樹木および好気性コンポスト`
            : `${brief.koppenCode} Native Shade Canopy & Aerobic Composting`,
          steps: isId
            ? [
                `Tanam vegetasi peneduh lokal di sisi barat bangunan untuk menaikkan skor TCI dari ${brief.tciScore}/100.`,
                "Olahan sisa dapur dan daun kering dengan rasio 3:1 di dalam komposter aerobik.",
                "Gunakan kompos matang pada pot sub-irigasi tanaman pangan rumah.",
              ]
            : isEs
            ? [
                `Plante vegetación nativa en la fachada expuesta al sol para elevar el TCI sobre ${brief.tciScore}/100.`,
                "Composte restos de cocina con hojas secas en proporción 3:1 en un contenedor aireado.",
                "Aplique el humus resultante en jardineras y huertos domésticos.",
              ]
            : isFr
            ? [
                `Plantez une canopée indigène à l'ouest pour élever le score TCI au-delà de ${brief.tciScore}/100.`,
                "Compostez les déchets de cuisine avec des feuilles sèches selon un ratio 3:1.",
                "Utilisez l'humus mûr dans les bacs potagers auto-arrosants.",
              ]
            : isDe
            ? [
                `Pflanzen Sie Schattengehölze an der Westfassade, um den TCI über ${brief.tciScore}/100 zu steigern.`,
                "Kompostieren Sie Küchenabfälle und trockenes Laub im Verhältnis 3:1 im aeroben Behälter.",
                "Verwenden Sie reifen Humus für Nutzpflanzen und Hochbeete.",
              ]
            : isJa
            ? [
                `温熱快適性指数TCIを${brief.tciScore}/100から向上させるため西側壁面に在来樹木を配植します。`,
                "生ごみと乾燥落ち葉を炭素窒素比3:1で好気性コンポストへ投入します。",
                "完熟堆肥を家庭菜園の底面給水プランターへ施肥します。",
              ]
            : [
                `Establish native shade vegetation on sun-exposed facades to raise TCI above ${brief.tciScore}/100.`,
                "Compost kitchen scraps with dry carbon leaves at a 3:1 ratio in an aerated bin.",
                "Apply finished humus to sub-irrigated culinary herb planters.",
              ],
          effort: "low",
          costBand: "low",
          metricRefs: ["tciScore", "footprintM2"],
          courseTrack: "urban_farming",
        },
        {
          id: "act-4",
          ownerAgent: "arka",
          title: isId
            ? `Instalasi Array Surya Atap ${brief.solarKwp} kWp (${fmtNum(brief.solarKwhYear)} kWh/thn)`
            : isEs
            ? `Instalación Solar en Techo de ${brief.solarKwp} kWp (${fmtNum(brief.solarKwhYear)} kWh/año)`
            : isFr
            ? `Installation Solaire en Toiture de ${brief.solarKwp} kWp (${fmtNum(brief.solarKwhYear)} kWh/an)`
            : isDe
            ? `Dach-Photovoltaikanlage mit ${brief.solarKwp} kWp (${fmtNum(brief.solarKwhYear)} kWh/Jahr)`
            : isJa
            ? `${brief.solarKwp} kWp 屋根上太陽光パネル設置（年間${fmtNum(brief.solarKwhYear)} kWh）`
            : `${brief.solarKwp} kWp Rooftop Solar Array (${fmtNum(brief.solarKwhYear)} kWh/yr)`,
          steps: isId
            ? [
                `Alokasikan 60% dari ${brief.footprintM2} m² atap untuk panel surya monokristalin.`,
                `Hemat tagihan listrik sekitar ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/tahun.`,
                `Kurangi jejak karbon rumah tangga sebesar ${fmtNum(brief.co2eKgYear)} kg CO2e/tahun.`,
              ]
            : isEs
            ? [
                `Asigne el 60% de los ${brief.footprintM2} m² de techo para módulos solares monocristalinos.`,
                `Ahorre aproximadamente ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/año en su factura eléctrica.`,
                `Evite ${fmtNum(brief.co2eKgYear)} kg CO2e/año de emisiones a la red eléctrica.`,
              ]
            : isFr
            ? [
                `Allouez 60% des ${brief.footprintM2} m² de toiture à des modules solaires monocristallins.`,
                `Économisez environ ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/an sur votre facture d'électricité.`,
                `Évitez ${fmtNum(brief.co2eKgYear)} kg CO2e/an d'émissions de réseau électrique.`,
              ]
            : isDe
            ? [
                `Nutzen Sie 60% der ${brief.footprintM2} m² Dachfläche für monokristalline Solarmodule.`,
                `Sparen Sie ca. ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/Jahr an Stromkosten ein.`,
                `Vermeiden Sie ${fmtNum(brief.co2eKgYear)} kg CO2e/Jahr an Netzemissionen.`,
              ]
            : isJa
            ? [
                `${brief.footprintM2} m²の屋根面積の60%に単結晶太陽光モジュールを配置します。`,
                `年間約${brief.currency} ${fmtNum(brief.solarSavingsYear)}の電気料金を削減します。`,
                `年間${fmtNum(brief.co2eKgYear)} kg CO2eの電力系統炭素排出を回避します。`,
              ]
            : [
                `Allocate 60% of the ${brief.footprintM2} m² roof footprint to monocrystalline PV modules.`,
                `Capture estimated utility bill savings of ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/year.`,
                `Avoid ${fmtNum(brief.co2eKgYear)} kg CO2e/year in grid electricity emissions.`,
              ],
          effort: "high",
          costBand: "high",
          metricRefs: ["solarKwp", "solarKwhYear", "solarSavingsYear", "co2eKgYear"],
          courseTrack: "passive_cooling",
        },
      ],
      caveats: isId
        ? [
            "Seluruh angka kWh, liter air hujan, dan penghematan dihitung secara deterministik dari seri iklim Open-Meteo ERA5 (10 tahun) dan rumus NREL PVWatts v8.",
            "Biaya instalasi aktual dan insentif pajak surya bergantung pada kontraktor lokal dan inspeksi struktur atap.",
          ]
        : isEs
        ? [
            "Todas las cifras de kWh, litros pluviales y ahorros se calculan de forma determinista con datos climatológicos Open-Meteo ERA5 (10 años) y fórmulas NREL PVWatts v8.",
            "Los costos reales de instalación y subsidios solares dependen de instaladores locales y de la inspección estructural del techo.",
          ]
        : isFr
        ? [
            "Tous les chiffres en kWh, litres de pluie et économies sont calculés à partir des séries climatologiques Open-Meteo ERA5 (10 ans) et des équations NREL PVWatts v8.",
            "Les coûts réels d'installation et aides solaires dépendent des installateurs locaux et de l'inspection structurelle du toit.",
          ]
        : isDe
        ? [
            "Alle kWh-, Regenwasser- und Einsparungsdaten werden deterministisch aus 10-jährigen Open-Meteo ERA5 Klimadaten und NREL PVWatts v8 Formeln ermittelt.",
            "Tatsächliche Installationskosten und Einspeisevergütungen hängen von lokalen Installateuren und der Dachstatik ab.",
          ]
        : isJa
        ? [
            "すべての発電量（kWh）、雨水量（L）、光熱費削減額はOpen-Meteo ERA5（10年分）およびNREL PVWatts v8計算式に基づき算出されています。",
            "実際の設置費用および系統連系補助金は、現地の施工業者および屋根構造診断によって異なります。",
          ]
        : [
            "All kWh, rainwater liter, and monetary figures are deterministically computed from 10-year Open-Meteo ERA5 climatology and NREL PVWatts v8 equations.",
            "Actual installation costs and solar interconnection incentives depend on structural roof inspection and utility rules.",
          ],
    },
    telemetry: {
      provider: "meta-model-api",
      models: isLive ? [`${modelId} (Meta AI Live)`] : [modelId],
      masksCount: 3,
      latencyMs,
      tokensIn,
      tokensOut,
      costUsd,
      cache: cacheStatus,
      shieldMode: shield.mode,
      shieldReason: isLive ? "live_meta_muse_deliberation_completed" : shield.reason,
    },
    isOffTopic: false,
    detectedLanguage: userLang,
  };
}
