import { describe, it, expect } from "vitest";
import {
  validateCouncilTopic,
  validateNumbersAgainstSiteBrief,
  executeVerdaraCouncil,
  detectQueryLanguage,
  type SiteBrief,
} from "../src/lib/meta/client";

describe("Verdara Council Topic Guardrail & Deterministic Validator", () => {
  const dummyBrief: SiteBrief = {
    city: "Menlo Park",
    countryCode: "US-CA",
    koppenCode: "Csb",
    koppenName: "Warm-summer Mediterranean climate",
    season: "Dry Season",
    footprintM2: 240,
    solarKwp: 28.8,
    solarKwhYear: 43866,
    solarSavingsYear: 14037,
    currency: "USD",
    co2eKgYear: 9212,
    rainLitersYear: 89597,
    bioporeUnits: 17,
    tciScore: 78,
    electricityTariff: 0.32,
    nearestHubName: "Recology Shoreway Environmental Center",
    nearestHubDistanceKm: 2.4,
    outputLanguage: "id",
  };

  it("permits standard site deliberations when query is empty or undefined", () => {
    expect(validateCouncilTopic(undefined).isAllowed).toBe(true);
    expect(validateCouncilTopic("").isAllowed).toBe(true);
    expect(validateCouncilTopic("   ").isAllowed).toBe(true);
  });

  it("permits legitimate on-topic site engineering inquiries", () => {
    const solarCheck = validateCouncilTopic("Bagaimana cara meningkatkan efisiensi solar panel di atap?");
    expect(solarCheck.isAllowed).toBe(true);
    expect(solarCheck.domain).toBe("solar_physics");

    const rainCheck = validateCouncilTopic("Berapa kapasitas tandon air hujan dan lubang biopori yang ideal?");
    expect(rainCheck.isAllowed).toBe(true);
    expect(rainCheck.domain).toBe("hydrology");

    const plantCheck = validateCouncilTopic("Tanaman apa yang cocok untuk peneduh dan menurunkan panas TCI?");
    expect(plantCheck.isAllowed).toBe(true);
    expect(plantCheck.domain).toBe("microclimate_botany");

    const plantDiseaseCheck = validateCouncilTopic("Bagaimana cara merawat tumbuhan yang sudah terkena penyakit langka?");
    expect(plantDiseaseCheck.isAllowed).toBe(true);
    expect(plantDiseaseCheck.domain).toBe("microclimate_botany");

    const sustainabilityCheck = validateCouncilTopic("Bagaimana prinsip sustainability dan daur ulang untuk hunian?");
    expect(sustainabilityCheck.isAllowed).toBe(true);
    expect(sustainabilityCheck.domain).toBe("circular_waste");

    const wasteCheck = validateCouncilTopic("Bagaimana memilah sampah plastik PET untuk Bank Sampah terdekat?");
    expect(wasteCheck.isAllowed).toBe(true);
    expect(wasteCheck.domain).toBe("circular_waste");
  });

  it("deliberates plant care and rare disease queries through Dr. Flora", async () => {
    const result = await executeVerdaraCouncil(dummyBrief, {
      userId: "test-resident",
      ipHash: "127.0.0.1",
      isJudge: true,
      userQuery: "Bagaimana cara merawat tumbuhan yang sudah terkena penyakit langka",
    });

    expect(result.isOffTopic).toBe(false);
    expect(result.messages).toHaveLength(3);
    expect(result.messages[0].content).toContain("perawatan tumbuhan");
    expect(result.messages[0].content).toContain("isolasi");
    expect(result.messages[0].content).toContain("biofungisida");
  });

  it("strictly rejects off-topic queries outside site ecology and physics", () => {
    const politics = validateCouncilTopic("Siapa presiden Indonesia saat ini?");
    expect(politics.isAllowed).toBe(false);

    const coding = validateCouncilTopic("Buatkan kode python untuk sorting array");
    expect(coding.isAllowed).toBe(false);

    const recipe = validateCouncilTopic("Bagaimana resep membuat kue bolu yang enak?");
    expect(recipe.isAllowed).toBe(false);

    const football = validateCouncilTopic("Siapa pemenang piala dunia sepak bola?");
    expect(football.isAllowed).toBe(false);

    const generalTrivia = validateCouncilTopic("Berapa jarak dari bumi ke bulan?");
    expect(generalTrivia.isAllowed).toBe(false);
  });

  it("synthesizes explicit off-topic refusal messages from all three specialists", async () => {
    const result = await executeVerdaraCouncil(dummyBrief, {
      userId: "test-resident",
      ipHash: "127.0.0.1",
      isJudge: true,
      userQuery: "Siapa presiden Indonesia yang menjabat?",
    });

    expect(result.isOffTopic).toBe(true);
    expect(result.blueprint.title).toContain("Topik Ditolak");
    expect(result.messages).toHaveLength(3);

    // Dr. Flora refusal
    expect(result.messages[0].content).toContain("di luar cakupan iklim mikro");
    expect(result.messages[0].verifiedNumbers).toHaveLength(0);

    // Ir. Arka refusal
    expect(result.messages[1].content).toContain("tidak terkait fisika atap");
    expect(result.messages[1].verifiedNumbers).toHaveLength(0);

    // Sirkula refusal
    expect(result.messages[2].content).toContain("di luar ranah ekonomi sirkular");
    expect(result.messages[2].verifiedNumbers).toHaveLength(0);
  });

  it("validates numeric consistency against SiteBrief numbers", () => {
    const validText = "Atap seluas 240 m2 menghasilkan 28.8 kWp dan memanen 89597 Liter air hujan.";
    const check = validateNumbersAgainstSiteBrief(validText, dummyBrief);
    expect(check.verifiedNumbers).toContain("240");
    expect(check.verifiedNumbers).toContain("28.8");
    expect(check.verifiedNumbers).toContain("89597");
    expect(check.unverifiedNumbers).toHaveLength(0);

    const hallucinatedText = "Atap seluas 9999 m2 menghasilkan 888 kWp.";
    const checkHallucination = validateNumbersAgainstSiteBrief(hallucinatedText, dummyBrief);
    expect(checkHallucination.unverifiedNumbers).toContain("9999");
    expect(checkHallucination.unverifiedNumbers).toContain("888");
  });

  it("detects user query languages accurately across Indonesian, Spanish, French, German, Japanese, and English", () => {
    expect(detectQueryLanguage("Bagaimana cara merawat tanaman yang sakit?")).toBe("id");
    expect(detectQueryLanguage("¿Cómo cuidar las plantas con hongos?")).toBe("es");
    expect(detectQueryLanguage("Comment soigner les plantes malades avec des champignons ?")).toBe("fr");
    expect(detectQueryLanguage("Wie pflege ich kranke Pflanzen mit Pilzen?")).toBe("de");
    expect(detectQueryLanguage("病気の植物をどのように手入れすればよいですか？")).toBe("ja");
    expect(detectQueryLanguage("How to calculate rooftop solar photovoltaic generation?")).toBe("en");
  });

  it("permits and classifies non-English queries accurately in the topic guardrail", () => {
    const esQuery = validateCouncilTopic("¿Cómo cuidar las plantas con hongos y hojas amarillas?");
    expect(esQuery.isAllowed).toBe(true);
    expect(esQuery.domain).toBe("microclimate_botany");
    expect(esQuery.detectedLanguage).toBe("es");

    const frQuery = validateCouncilTopic("Comment calculer la puissance des panneaux solaires et l'eau de pluie ?");
    expect(frQuery.isAllowed).toBe(true);
    expect(frQuery.domain).toBe("solar_physics");
    expect(frQuery.detectedLanguage).toBe("fr");

    const deQuery = validateCouncilTopic("Wie pflege ich kranke Pflanzen mit Pilzen auf dem Dach?");
    expect(deQuery.isAllowed).toBe(true);
    expect(deQuery.domain).toBe("microclimate_botany");
    expect(deQuery.detectedLanguage).toBe("de");

    const jaQuery = validateCouncilTopic("屋根の太陽光発電容量と雨水タンクについて教えてください");
    expect(jaQuery.isAllowed).toBe(true);
    expect(jaQuery.domain).toBe("solar_physics");
    expect(jaQuery.detectedLanguage).toBe("ja");
  });

  it("synthesizes council deliberations in Spanish when queried in Spanish", async () => {
    const result = await executeVerdaraCouncil(dummyBrief, {
      userId: "test-spanish",
      ipHash: "127.0.0.1",
      isJudge: true,
      userQuery: "¿Cómo cuidar las plantas con hongos y hojas amarillas?",
    });

    expect(result.isOffTopic).toBe(false);
    expect(result.messages).toHaveLength(3);
    // Dr. Flora answers in Spanish
    expect(result.messages[0].content).toContain("perfil climático");
    expect(result.messages[0].content).toContain("plantas");
    expect(result.messages[0].content).toContain("biofungicida");
    expect(result.messages[0].unverifiedNumbers).toHaveLength(0);

    // Ir. Arka answers in Spanish
    expect(result.messages[1].content).toContain("auditoría");
    expect(result.messages[1].content).toContain("solar");
    expect(result.messages[1].unverifiedNumbers).toHaveLength(0);

    // Sirkula answers in Spanish
    expect(result.messages[2].content).toContain("tarifa");
    expect(result.messages[2].unverifiedNumbers).toHaveLength(0);

    // Blueprint in Spanish
    expect(result.blueprint.title).toContain("Resiliencia");
  });

  it("synthesizes council deliberations in French when queried in French", async () => {
    const result = await executeVerdaraCouncil(dummyBrief, {
      userId: "test-french",
      ipHash: "127.0.0.1",
      isJudge: true,
      userQuery: "Comment soigner les plantes malades avec des champignons ?",
    });

    expect(result.isOffTopic).toBe(false);
    expect(result.messages).toHaveLength(3);
    // Dr. Flora answers in French
    expect(result.messages[0].content).toContain("profil climatique");
    expect(result.messages[0].content).toContain("plantes");
    expect(result.messages[0].unverifiedNumbers).toHaveLength(0);

    // Ir. Arka answers in French
    expect(result.messages[1].content).toContain("toiture");
    expect(result.messages[1].unverifiedNumbers).toHaveLength(0);

    // Blueprint in French
    expect(result.blueprint.title).toContain("Résilience");
  });

  it("synthesizes council deliberations in German when queried in German", async () => {
    const result = await executeVerdaraCouncil(dummyBrief, {
      userId: "test-german",
      ipHash: "127.0.0.1",
      isJudge: true,
      userQuery: "Wie pflege ich kranke Pflanzen mit Pilzen auf dem Dach?",
    });

    expect(result.isOffTopic).toBe(false);
    expect(result.messages).toHaveLength(3);
    expect(result.messages[0].content).toContain("Klimaprofil");
    expect(result.messages[0].content).toContain("Pflanzen");
    expect(result.messages[0].unverifiedNumbers).toHaveLength(0);
    expect(result.blueprint.title).toContain("Wohnresilienz");
  });

  it("synthesizes council deliberations in Japanese when queried in Japanese", async () => {
    const result = await executeVerdaraCouncil(dummyBrief, {
      userId: "test-japanese",
      ipHash: "127.0.0.1",
      isJudge: true,
      userQuery: "病気の植物をどのように手入れすればよいですか？",
    });

    expect(result.isOffTopic).toBe(false);
    expect(result.messages).toHaveLength(3);
    expect(result.messages[0].content).toContain("温熱快適性指数");
    expect(result.messages[0].unverifiedNumbers).toHaveLength(0);
    expect(result.blueprint.title).toContain("レジリエンス");
  });

  it("strictly rejects off-topic queries in non-English languages with localized refusals", async () => {
    const esOffTopic = await executeVerdaraCouncil(dummyBrief, {
      userId: "test-spanish",
      ipHash: "127.0.0.1",
      isJudge: true,
      userQuery: "¿Quién es el presidente de España?",
    });
    expect(esOffTopic.isOffTopic).toBe(true);
    expect(esOffTopic.blueprint.title).toContain("Consulta Rechazada");
    expect(esOffTopic.messages[0].content).toContain("fuera del alcance del microclima");

    const frOffTopic = await executeVerdaraCouncil(dummyBrief, {
      userId: "test-french",
      ipHash: "127.0.0.1",
      isJudge: true,
      userQuery: "Qui est le président de la France ?",
    });
    expect(frOffTopic.isOffTopic).toBe(true);
    expect(frOffTopic.blueprint.title).toContain("Demande Refusée");
    expect(frOffTopic.messages[0].content).toContain("sort du cadre du microclimat");

    const deOffTopic = await executeVerdaraCouncil(dummyBrief, {
      userId: "test-german",
      ipHash: "127.0.0.1",
      isJudge: true,
      userQuery: "Wer ist der Bundeskanzler von Deutschland?",
    });
    expect(deOffTopic.isOffTopic).toBe(true);
    expect(deOffTopic.blueprint.title).toContain("Thema Abgelehnt");
    expect(deOffTopic.messages[0].content).toContain("außerhalb des Mikroklimas");

    const jaOffTopic = await executeVerdaraCouncil(dummyBrief, {
      userId: "test-japanese",
      ipHash: "127.0.0.1",
      isJudge: true,
      userQuery: "日本の総理大臣は誰ですか？",
    });
    expect(jaOffTopic.isOffTopic).toBe(true);
    expect(jaOffTopic.blueprint.title).toContain("トピック却下");
    expect(jaOffTopic.messages[0].content).toContain("敷地の微気候および生物多様性の対象外");
  });
});
