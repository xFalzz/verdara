import { describe, it, expect } from "vitest";
import {
  validateCouncilTopic,
  validateNumbersAgainstSiteBrief,
  executeVerdaraCouncil,
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
});
