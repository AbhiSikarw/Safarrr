import { NextResponse } from "next/server";

/*
  This is a SIMPLE, deterministic version.
  Later you can plug real APIs or AI here.
*/

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location");

  if (!location) {
    return NextResponse.json(
      { error: "Location is required" },
      { status: 400 }
    );
  }

  /* ---------------- MOCK LOGIC (REPLACE LATER) ---------------- */

  // Terrain inference (basic keyword-based)
  let terrain_type = "urban";
  if (/mountain|trek|himalaya|valley/i.test(location)) {
    terrain_type = "mountain";
  } else if (/desert/i.test(location)) {
    terrain_type = "desert";
  } else if (/beach|coast/i.test(location)) {
    terrain_type = "coastal";
  }

  const terrain_risk_score =
    terrain_type === "mountain" ? 70 : terrain_type === "desert" ? 60 : 30;

  const terrain_risk_level =
    terrain_risk_score > 65 ? "high" : terrain_risk_score > 40 ? "medium" : "low";

  // Weather (mocked, deterministic)
  const weather_condition = "Clear";
  const weather_risk_score = terrain_type === "mountain" ? 60 : 25;
  const weather_risk_level =
    weather_risk_score > 55 ? "medium" : "low";

  // Overall safety
  const safety_score = Math.max(
    0,
    100 - terrain_risk_score - weather_risk_score
  );

  const safety_level =
    safety_score > 70 ? "SAFE" : safety_score > 40 ? "MODERATE" : "RISKY";

  return NextResponse.json({
    weather_condition,
    weather_risk_score,
    weather_risk_level,

    terrain_type,
    terrain_risk_score,
    terrain_risk_level,

    safety_score,
    safety_level,

    calculated_at: new Date().toISOString(),
  });
}
