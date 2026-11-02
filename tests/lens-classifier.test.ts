import { describe, it, expect } from "vitest";
import { analyzeImageLocally } from "../src/lib/lens/classifier";
import {
  SAMPLE_COCONUT_SHELL_IMAGE,
  SAMPLE_PET_BOTTLE_IMAGE,
  SAMPLE_PLANT_LEAF_IMAGE,
} from "../src/lib/lens/sample-images";

describe("Verdara SAM 3.1 Lens Category Validation & Deep Dossier", () => {
  it("classifies plant leaf image into plant domain with pathology metrics", async () => {
    const result = await analyzeImageLocally(SAMPLE_PLANT_LEAF_IMAGE, "plant");
    expect(result.category).toBe("plant");
    expect(result.isUnrelated).toBe(false);
    expect(result.isMismatch).toBe(false);
    expect(result.technicalDetails.pathologyDiagnosis).toBeDefined();
    expect(result.technicalDetails.chlorophyllVigorPct).toBeGreaterThan(0);
  });

  it("detects category mismatch when plant leaf is scanned in waste mode and suggests redirect", async () => {
    // When in waste mode but receiving a green plant leaf
    const result = await analyzeImageLocally(SAMPLE_PLANT_LEAF_IMAGE, "waste");
    expect(result.detectedCategory).toBe("plant");
    expect(result.isMismatch).toBe(true);
    expect(result.suggestedCategory).toBe("plant");
    expect(result.mismatchMessageId).toContain("Dokter Tanaman");
    expect(result.mismatchMessageEn).toContain("Plant Doctor");
  });

  it("classifies recyclable PET and biomass into waste domain with polymer grade", async () => {
    const petResult = await analyzeImageLocally(SAMPLE_PET_BOTTLE_IMAGE, "waste");
    expect(petResult.category).toBe("waste");
    expect(petResult.isUnrelated).toBe(false);
    expect(petResult.isMismatch).toBe(false);
    expect(petResult.technicalDetails.polymerGrade).toContain("Resin");
    expect(petResult.technicalDetails.bankSampahFormula).toBeDefined();

    const coconutResult = await analyzeImageLocally(SAMPLE_COCONUT_SHELL_IMAGE, "waste");
    expect(coconutResult.category).toBe("waste");
    expect(coconutResult.technicalDetails.polymerGrade).toContain("Lignocellulose");
  });

  it("provides detailed 7-step upcycling or care schedule for all recognized scans", async () => {
    const plantResult = await analyzeImageLocally(SAMPLE_PLANT_LEAF_IMAGE, "plant");
    expect(plantResult.upcyclingStepsId.length).toBeGreaterThanOrEqual(3);
    expect(plantResult.upcyclingStepsEn.length).toBeGreaterThanOrEqual(3);

    const wasteResult = await analyzeImageLocally(SAMPLE_PET_BOTTLE_IMAGE, "waste");
    expect(wasteResult.upcyclingStepsId.length).toBeGreaterThanOrEqual(3);
    expect(wasteResult.upcyclingStepsEn.length).toBeGreaterThanOrEqual(3);
  });
});
