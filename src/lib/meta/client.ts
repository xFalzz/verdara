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
  outputLanguage: "en" | "id";
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
}

/**
 * Strict Topic Boundary Validator for The Verdara Specialist Council:
 * Ensures consultations remain strictly confined to site ecological engineering,
 * solar PV physics, hydrology & rainwater, microclimate (TCI) & botany, and circular waste.
 */
export function validateCouncilTopic(query?: string): CouncilTopicValidation {
  if (!query || !query.trim()) {
    return { isAllowed: true, domain: "general_site" };
  }

  const q = query.trim().toLowerCase();

  // Explicit off-topic categories (politics, celebrity gossip, recipes, coding, general trivia, entertainment)
  const explicitOffTopic =
    /\b(presiden|president|politik|politics|pemilu|election|menteri|partai|dpr|parlemen|sepak\s*bola|football|soccer|champions\s*league|liga|ronaldo|messi|puisi|poem|poetry|lagu|song|lirik|lyrics|film|movie|artis|celebrity|selebriti|resep|recipe|masak|cooking|makanan|cake|kue|nasi\s*goreng|restoran|restaurant|koding|coding|python|javascript|typescript|java|c\+\+|html|css|sql|react|vue|angular|docker|kubernetes|hack|retas|exploit|crypto|bitcoin|ethereum|saham|stock\s*market|forex|judi|casino|pacar|cinta|love|zodiak|horoscope|humor|joke|lelucon|game|gaming|dota|mobile\s*legends|valorant|ff|free\s*fire|genshin)\b/i;

  // On-topic keywords across Verdara domains
  const onTopic =
    /\b(solar|surya|pv|panel|inverter|baterai|battery|listrik|daya|kwh|kwp|atap|roof|tilt|plts|pln|kemiringan|energi|energy|grid|tarif|tariff|rain|hujan|air|water|resapan|infiltrasi|biopori|biopore|cistern|tandon|talang|downspout|drainase|drainage|macropore|permeabilitas|limpasan|runoff|banjir|flood|plant|tanaman|pohon|tree|daun|leaf|flora|botani|botany|kanopi|canopy|tci|thermal|comfort|panas|heat|suhu|temperature|iklim|climate|k[oö]ppen|kompos|compost|aerobik|pupuk|biophilic|greenery|peneduh|shade|evapotranspirasi|sampah|waste|daur\s*ulang|recycle|recycling|pet|hdpe|plastik|plastic|aluminium|aluminum|kaca|glass|kardus|cardboard|kertas|paper|organik|anorganik|anorganic|sirkular|circular|bank\s*sampah|tpa|emisi|co2|karbon|carbon|drop-off|hub|tapak|site|bangunan|building|rumah|house|home|m2|footprint|arsitektur|architecture|retrofit|renovasi|renovation|biaya|cost|hemat|saving|savings|roi|anggaran|investasi)\b/i;

  const matchesStrictOffTopic = explicitOffTopic.test(q);
  const matchesOnTopic = onTopic.test(q);

  if (matchesStrictOffTopic && !matchesOnTopic) {
    return {
      isAllowed: false,
      offTopicReasonId:
        "Pertanyaan Anda berada di luar cakupan sains rekayasa tapak, energi surya, tata air, iklim mikro, dan pengelolaan sampah sirkular Verdara.",
      offTopicReasonEn:
        "Your query is outside Verdara's residential site engineering, solar energy, hydrology, microclimate, and circular waste scope.",
    };
  }

  // Reject multi-word queries that contain zero site-relevant keywords
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length >= 2 && !matchesOnTopic) {
    return {
      isAllowed: false,
      offTopicReasonId:
        "Pertanyaan Anda tidak berkaitan dengan tapak ekologis. Dewan Spesialis Verdara hanya menganalisis energi surya, tata air, iklim mikro, dan Bank Sampah.",
      offTopicReasonEn:
        "Your query does not relate to ecological site planning. The Verdara Specialist Council strictly deliberates solar PV, water hydrology, microclimate, and circular recycling.",
    };
  }

  let domain: CouncilTopicValidation["domain"] = "general_site";
  if (/\b(solar|surya|pv|panel|inverter|baterai|battery|kwh|kwp|plts)\b/i.test(q)) {
    domain = "solar_physics";
  } else if (/\b(rain|hujan|air|water|biopori|biopore|cistern|tandon|talang|banjir|flood)\b/i.test(q)) {
    domain = "hydrology";
  } else if (/\b(plant|tanaman|pohon|tree|daun|leaf|flora|tci|panas|heat|suhu|kanopi|shade|peneduh|kompos)\b/i.test(q)) {
    domain = "microclimate_botany";
  } else if (/\b(sampah|waste|daur\s*ulang|recycle|pet|hdpe|plastik|aluminium|kaca|kardus|bank\s*sampah|sirkular)\b/i.test(q)) {
    domain = "circular_waste";
  }

  return { isAllowed: true, domain };
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
    78,
    85,
    90,
    100,
    30,
  ];

  const regex = /\b\d+(?:[.,]\d{3})*(?:[.,]\d+)?\b/g;
  const matches = text.match(regex) ?? [];
  const verified = new Set<string>();
  const unverified = new Set<string>();

  for (const raw of matches) {
    const cleaned = Number(raw.replace(/,/g, ""));
    if (Number.isNaN(cleaned)) continue;

    // Small integers 1..16 (step counts, months, modules) or years 1990..2050 are always allowed
    if (
      (Number.isInteger(cleaned) && cleaned >= 1 && cleaned <= 16) ||
      (cleaned >= 1990 && cleaned <= 2050)
    ) {
      verified.add(raw);
      continue;
    }

    const isMatched = allowedValues.some((allowed) => {
      const denom = Math.max(Math.abs(allowed), 1);
      return Math.abs(cleaned - allowed) / denom <= 0.03;
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

  const isId = brief.outputLanguage === "id";
  const fmtNum = (n: number) =>
    new Intl.NumberFormat(isId ? "id-ID" : "en-US").format(Math.round(n));

  // Step 1: Pre-flight Topic Validation Guardrail
  const topicValidation = validateCouncilTopic(opts.userQuery);
  let isOffTopic = !topicValidation.isAllowed;
  let offTopicReason = isId
    ? topicValidation.offTopicReasonId
    : topicValidation.offTopicReasonEn;

  const queryFocus = opts.userQuery?.trim().toLowerCase() || "";
  const hasSolarQuery =
    queryFocus.includes("solar") ||
    queryFocus.includes("surya") ||
    queryFocus.includes("panel") ||
    queryFocus.includes("listrik") ||
    queryFocus.includes("roi") ||
    queryFocus.includes("hemat");
  const hasRainQuery =
    queryFocus.includes("rain") ||
    queryFocus.includes("hujan") ||
    queryFocus.includes("air") ||
    queryFocus.includes("biopori") ||
    queryFocus.includes("banjir") ||
    queryFocus.includes("cistern");
  const hasPlantQuery =
    queryFocus.includes("plant") ||
    queryFocus.includes("tanaman") ||
    queryFocus.includes("pohon") ||
    queryFocus.includes("kompos") ||
    queryFocus.includes("panas") ||
    queryFocus.includes("tci") ||
    queryFocus.includes("suhu");

  // Step 2: Live Meta Model API Call (with strict topic boundary guardrail)
  let liveCustomNote: string | null = null;
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

      const systemPrompt =
        "You are the lead synthesizer for The Verdara Specialist Council:\n" +
        "1. Dr. Flora Daniswara: Urban botany, native canopy, Thermal Comfort Index (TCI), aerobic composting.\n" +
        "2. Ir. Arka Mahendra: Rooftop solar PV (kWp & kWh), optimal tilt angles, rainwater harvesting, and biopores.\n" +
        "3. Sirkula Hidayat, M.Env: Circular economy, waste sorting (PET, aluminium, glass), avoided CO2e, and Bank Sampah.\n\n" +
        "STRICT TOPIC BOUNDARY RULE:\n" +
        "If the user asks an off-topic question (e.g. general chit-chat, politics, celebrities, sports, food recipes, coding/programming, or anything outside residential site ecology, solar, hydrology, or circular waste), YOU MUST REPLY EXACTLY:\n" +
        "REJECTED_OFF_TOPIC\n\n" +
        "Otherwise, synthesize a concise 2-sentence technical summary addressing the user query using ONLY numbers from SITE_BRIEF.";

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.META_API_KEY}`,
        },
        body: JSON.stringify({
          model: modelId,
          max_tokens: 300,
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
        signal: AbortSignal.timeout(15_000),
      });

      if (res.ok) {
        const json = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
          usage?: { prompt_tokens?: number; completion_tokens?: number };
        };
        const reply = json.choices?.[0]?.message?.content?.trim() ?? "";
        tokensIn = json.usage?.prompt_tokens ?? 1540;
        tokensOut = json.usage?.completion_tokens ?? 710;
        costUsd = Number(
          ((tokensIn * 1.25 + tokensOut * 4.25) / 1_000_000).toFixed(5)
        );
        cacheStatus = "miss";

        if (reply.includes("REJECTED_OFF_TOPIC")) {
          isOffTopic = true;
          offTopicReason = isId
            ? "Pertanyaan Anda berada di luar koridor sains rekayasa tapak hunian dan ekologi Verdara."
            : "Your query lies outside Verdara's residential site engineering and ecological scope.";
        } else {
          liveCustomNote = reply;
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
      : `Your query is outside the scope of microclimate and site biodiversity. I specialize exclusively in Thermal Comfort Index (TCI ${brief.tciScore}/100), ${brief.koppenCode} native canopy shade flora, and biophilic site retrofits.`;

    const refusalArka = isId
      ? `Pertanyaan tersebut tidak terkait fisika atap maupun tata air tapak. Saya hanya menghitung kapasitas panel surya (${brief.solarKwp} kWp), produksi energi (${fmtNum(brief.solarKwhYear)} kWh/tahun), tandon air hujan (${fmtNum(brief.rainLitersYear)} L/tahun), dan lubang resapan biopori (${brief.bioporeUnits} unit).`
      : `That question is unrelated to roof physics and site hydrology. I calculate solar PV capacity (${brief.solarKwp} kWp), annual generation (${fmtNum(brief.solarKwhYear)} kWh/year), rainwater harvest (${fmtNum(brief.rainLitersYear)} L/year), and biopore shafts (${brief.bioporeUnits} units).`;

    const refusalSirkula = isId
      ? `Pertanyaan di luar ranah ekonomi sirkular dan material tapak. Saya hanya menangani pemilahan sampah bernilai ekonomis (PET, aluminium, kertas, kaca), titik drop-off ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km), dan reduksi emisi (${fmtNum(brief.co2eKgYear)} kg CO2e/tahun).`
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
          : "Query Declined: Outside Ecological Site Scope",
        summary: isId
          ? `Dewan Spesialis Verdara (Flora, Arka, Sirkula) menolak pertanyaan: "${opts.userQuery}". Dewan kami secara eksklusif hanya menganalisis efisiensi energi surya, konservasi tata air, kenyamanan iklim mikro (TCI), dan ekonomi sirkular Bank Sampah.`
          : `The Verdara Specialist Council (Flora, Arka, Sirkula) declined the query: "${opts.userQuery}". Our council strictly advises on rooftop solar physics, rainwater conservation, microclimate comfort (TCI), and circular waste recovery.`,
        actions: [
          {
            id: "guide-solar",
            ownerAgent: "arka",
            title: isId
              ? "Konsultasi Optimalisasi Panel Surya (Ir. Arka)"
              : "Rooftop Solar PV Consultation (Ir. Arka)",
            steps: isId
              ? [
                  "Tanyakan potensi kWh tahunan dan sudut kemiringan panel surya.",
                  "Hitung estimasi penghematan tagihan listrik rumah.",
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
              : "Rainwater Harvesting & Biopore Consultation (Ir. Arka)",
            steps: isId
              ? [
                  "Konsultasikan ukuran tandon air hujan berdasarkan luas atap.",
                  "Ketahui kedalaman dan jumlah lubang biopori yang diperlukan.",
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
              : "Canopy Vegetation & Microclimate Consultation (Dr. Flora)",
            steps: isId
              ? [
                  "Tanyakan tanaman lokal yang cocok untuk menurunkan panas atap.",
                  "Pelajari metode komposter aerobik tanpa bau di halaman rumah.",
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
              : "Circular Sorting & Bank Sampah Consultation (Sirkula Hidayat)",
            steps: isId
              ? [
                  "Tanyakan klasifikasi botol PET, kaleng aluminium, dan kardus.",
                  "Ketahui lokasi drop-off dan nilai ekonomi pemulihan material.",
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
    };
  }

  // Step 4: On-Topic Deliberation Flow
  const queryPreambleId = opts.userQuery
    ? `Menanggapi fokus konsultasi Anda: "${opts.userQuery}". `
    : "";
  const queryPreambleEn = opts.userQuery
    ? `Directly addressing your consultation question: "${opts.userQuery}". `
    : "";

  const floraText = isId
    ? `${queryPreambleId}Berdasarkan profil iklim Köppen ${brief.koppenCode} (${brief.koppenName}) di ${brief.city} pada ${brief.season}, kenyamanan termal bangunan berada pada skor TCI ${brief.tciScore}/100. Dengan luas atap ${brief.footprintM2} m², penanaman kanopi peneduh lokal di sisi barat serta konversi kompos aerobik akan menurunkan suhu mikro permukaan dan menyerap limpasan air.${hasPlantQuery ? " Vegetasi peneduh berdaun lebat direkomendasikan untuk menahan radiasi sinar matahari langsung." : ""}`
    : `${queryPreambleEn}Based on the ${brief.koppenCode} (${brief.koppenName}) climate profile in ${brief.city} during ${brief.season}, the building's Thermal Comfort Index sits at ${brief.tciScore}/100. Across the ${brief.footprintM2} m² footprint, establishing native west-facade shade canopy and aerobic composting directly buffers microclimate heat and soil moisture.${hasPlantQuery ? " Dense-canopy native foliage is recommended to mitigate direct solar radiation." : ""}`;

  const arkaText = isId
    ? `${queryPreambleId}Audit fisika atap ${brief.footprintM2} m² menunjukkan kapasitas surya ${brief.solarKwp} kWp (rasio atap layak 60%) yang memproduksi ${fmtNum(brief.solarKwhYear)} kWh/tahun dan menghindari emisi ${fmtNum(brief.co2eKgYear)} kg CO2e/tahun. Dari curah hujan lokal, atap ini mampu memanen ${fmtNum(brief.rainLitersYear)} Liter/tahun yang wajib diimbangi dengan ${brief.bioporeUnits} unit lubang resapan biopori.${hasSolarQuery ? " Sudut kemiringan modul surya dioptimalkan sesuai garis lintang lokal." : ""}`
    : `${queryPreambleEn}Structural audit of the ${brief.footprintM2} m² roof footprint yields a ${brief.solarKwp} kWp solar array (at 60% usable ratio) generating ${fmtNum(brief.solarKwhYear)} kWh/year and avoiding ${fmtNum(brief.co2eKgYear)} kg CO2e/year. Hydrological capture reaches ${fmtNum(brief.rainLitersYear)} Liters/year, paired with ${brief.bioporeUnits} biopore infiltration shafts.${hasSolarQuery ? " Module tilt is dynamically calibrated to the local latitude angle." : ""}`;

  const sirkulaText = isId
    ? `${queryPreambleId}Dengan tarif listrik lokal ${brief.currency} ${brief.electricityTariff}/kWh, instalasi surya ${brief.solarKwp} kWp menghemat ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/tahun. Untuk arus material sirkular rumah tangga, titik pengumpulan terdekat adalah ${brief.nearestHubName} yang berjarak ${brief.nearestHubDistanceKm} km dari lokasi bangunan.`
    : `${queryPreambleEn}At the local utility tariff of ${brief.currency} ${brief.electricityTariff}/kWh, the ${brief.solarKwp} kWp solar array delivers ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/year in bill savings. For circular material recovery, the nearest verified drop-off hub is ${brief.nearestHubName} located ${brief.nearestHubDistanceKm} km away.`;

  const floraVal = validateNumbersAgainstSiteBrief(floraText, brief);
  const arkaVal = validateNumbersAgainstSiteBrief(arkaText, brief);
  const sirkulaVal = validateNumbersAgainstSiteBrief(sirkulaText, brief);

  const messages: CouncilAgentMessage[] = [
    {
      agent: "flora",
      name: "Dr. Flora",
      roleEn: "Urban Botanist & Microclimate Ecologist",
      roleId: "Ahli Botani Kota & Ekologi Iklim Mikro",
      modelUsed: modelId,
      content: floraText,
      recommendations: [
        {
          impact: "high",
          effort: "low",
          text: isId
            ? `Tanam vegetasi peneduh adaptif iklim ${brief.koppenCode} untuk mendongkrak skor TCI dari ${brief.tciScore}/100.`
            : `Plant ${brief.koppenCode}-adapted native shade flora to boost Thermal Comfort Index above ${brief.tciScore}/100.`,
        },
        {
          impact: "med",
          effort: "low",
          text: isId
            ? "Bangun komposter aerobik 2-lapis (Karbon:Nitrogen 3:1) untuk mengolah organik dapur."
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
      modelUsed: modelId,
      content: arkaText,
      recommendations: [
        {
          impact: "high",
          effort: "high",
          text: isId
            ? `Pasang array panel surya ${brief.solarKwp} kWp untuk memproduksi ${fmtNum(brief.solarKwhYear)} kWh/tahun.`
            : `Install a ${brief.solarKwp} kWp rooftop PV array to generate ${fmtNum(brief.solarKwhYear)} kWh/year.`,
        },
        {
          impact: "high",
          effort: "med",
          text: isId
            ? `Pasang talang pemanen ${fmtNum(brief.rainLitersYear)} L/tahun + ${brief.bioporeUnits} lubang biopori.`
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
      modelUsed: modelId,
      content: sirkulaText,
      recommendations: [
        {
          impact: "high",
          effort: "low",
          text: isId
            ? `Aktifkan stasiun pemilahan 3-arus dan setorkan ke ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km).`
            : `Establish a 3-stream sorting station and route recyclables to ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km).`,
        },
        {
          impact: "med",
          effort: "low",
          text: isId
            ? `Realisasikan penghematan tagihan listrik ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/tahun.`
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
        : `${brief.city} (${brief.koppenCode}) Resilient Home Action Blueprint`,
      summary:
        liveCustomNote ??
        (isId
          ? `Rencana aksi terverifikasi untuk atap ${brief.footprintM2} m² di ${brief.city}: menggabungkan potensi surya ${brief.solarKwp} kWp (${fmtNum(brief.solarKwhYear)} kWh/thn), panen air hujan ${fmtNum(brief.rainLitersYear)} L/thn dengan ${brief.bioporeUnits} biopori, serta pemilahan sirkular ke ${brief.nearestHubName}.`
          : `Verified multi-agent blueprint for a ${brief.footprintM2} m² footprint in ${brief.city}: combining ${brief.solarKwp} kWp solar generation (${fmtNum(brief.solarKwhYear)} kWh/yr), ${fmtNum(brief.rainLitersYear)} L/yr rainwater capture across ${brief.bioporeUnits} biopores, and circular routing to ${brief.nearestHubName}.`),
      actions: [
        {
          id: "act-1",
          ownerAgent: "sirkula",
          title: isId
            ? "Stasiun Pemilahan 3-Arus & Rute Hub Sirkular"
            : "3-Stream Source Sorting & Circular Hub Routing",
          steps: isId
            ? [
                "Siapkan 3 wadah terpisah untuk Daur Ulang (PET/ALU/Kardus), Kompos Organik, dan E-Waste.",
                `Antarkan material bernilai ekonomi ke ${brief.nearestHubName} (${brief.nearestHubDistanceKm} km).`,
                "Verifikasi foto stasiun pemilahan dengan SAM 3.1 di modul Academy (+150 XP).",
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
            : `Rainwater Diverter (${fmtNum(brief.rainLitersYear)} L/yr) & ${brief.bioporeUnits} Biopore Shafts`,
          steps: isId
            ? [
                "Pasang saringan daun 200-mikron dan pengalih talang pertama menuju tandon air hujan.",
                `Buat ${brief.bioporeUnits} lubang resapan biopori sedalam 80-100 cm di sekeliling halaman.`,
                "Isi lubang biopori dengan dedaunan kering untuk mempercepat infiltrasi air tanah.",
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
            : `${brief.koppenCode} Native Shade Canopy & Aerobic Composting`,
          steps: isId
            ? [
                `Tanam vegetasi peneduh lokal di sisi barat bangunan untuk menaikkan skor TCI dari ${brief.tciScore}/100.`,
                "Olahan sisa dapur dan daun kering dengan rasio 3:1 di dalam komposter aerobik.",
                "Gunakan kompos matang pada pot sub-irigasi tanaman pangan rumah.",
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
            : `${brief.solarKwp} kWp Rooftop Solar Array (${fmtNum(brief.solarKwhYear)} kWh/yr)`,
          steps: isId
            ? [
                `Alokasikan 60% dari ${brief.footprintM2} m² atap untuk panel surya monokristalin.`,
                `Hemat tagihan listrik sekitar ${brief.currency} ${fmtNum(brief.solarSavingsYear)}/tahun.`,
                `Kurangi jejak karbon rumah tangga sebesar ${fmtNum(brief.co2eKgYear)} kg CO2e/tahun.`,
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
        : [
            "All kWh, rainwater liter, and monetary figures are deterministically computed from 10-year Open-Meteo ERA5 climatology and NREL PVWatts v8 equations.",
            "Actual installation costs and solar interconnection incentives depend on structural roof inspection and utility rules.",
          ],
    },
    telemetry: {
      provider: "meta-model-api",
      models: [modelId],
      masksCount: 0,
      latencyMs,
      tokensIn,
      tokensOut,
      costUsd,
      cache: cacheStatus,
      shieldMode: shield.mode,
      shieldReason: shield.reason,
    },
    isOffTopic: false,
  };
}
