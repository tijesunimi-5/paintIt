import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { SurveySubmission } from "@/types/feedback";

export const dynamic = "force-dynamic";

// 1. Removed the unused 'req' parameter to pass the no-unused-vars check smoothly
export async function GET() {
  try {
    // 1. Gross metrics tracking
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM survey_responses;",
    );
    const totalResponses = parseInt(countResult.rows[0].count, 10);

    // 2. Demographic metrics breakdown
    const roleQuery = `
      SELECT role, COUNT(*) as count 
      FROM survey_responses 
      GROUP BY role;
    `;
    const roleResult = await pool.query(roleQuery);

    const byRole =
      totalResponses > 0
        ? roleResult.rows.map((row) => ({
            name: String(row.role).replace("_", " ").toUpperCase(),
            value: parseInt(row.count, 10),
          }))
        : [
            { name: "PAINTER", value: 0 },
            { name: "DESIGNER", value: 0 },
            { name: "HOMEOWNER", value: 0 },
            { name: "STUDENT RENTER", value: 0 },
          ];

    // 3. Extract JSONB internal elements
    const rawDataQuery =
      "SELECT id, role, responses, name, email, phone, early_access, created_at FROM survey_responses ORDER BY created_at DESC;";
    const rawDataResult = await pool.query(rawDataQuery);

    const featuresMap: Record<string, number> = {};
    const premiumPricingMap: Record<string, number> = {};

    rawDataResult.rows.forEach((row) => {
      // Cast the database row responses column cleanly as a key-value record object
      const resp = row.responses as Record<string, unknown> | null;
      if (!resp) return;

      // Extract array parameters from homeowner multi-select items (Question ID: ho_q8)
      const hoFeatures = resp.ho_q8;
      if (Array.isArray(hoFeatures)) {
        hoFeatures.forEach((f: unknown) => {
          if (typeof f === "string" && f) {
            featuresMap[f] = (featuresMap[f] || 0) + 1;
          }
        });
      }

      // Track Pricing values from painters (pa_q12) and designers (de_q12) fields inside JSONB
      const paPrice = resp.pa_q12;
      if (typeof paPrice === "string" && paPrice) {
        premiumPricingMap[paPrice] = (premiumPricingMap[paPrice] || 0) + 1;
      }

      const dePrice = resp.de_q12;
      if (typeof dePrice === "string" && dePrice) {
        premiumPricingMap[dePrice] = (premiumPricingMap[dePrice] || 0) + 1;
      }
    });

    // Handle structural fallback formatting rules for empty state tracking
    const mostRequestedFeatures =
      Object.keys(featuresMap).length > 0
        ? Object.entries(featuresMap)
            .map(([name, val]) => ({
              name,
              value: val,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6)
        : [{ name: "No Requests Yet", value: 0 }];

    const pricingPreferences =
      Object.keys(premiumPricingMap).length > 0
        ? Object.entries(premiumPricingMap).map(([name, value]) => ({
            name,
            value,
          }))
        : [
            { name: "Less than ₦5,000", value: 0 },
            { name: "₦5,000–₦10,000", value: 0 },
            { name: "₦10,000–₦20,000", value: 0 },
            { name: "₦20,000+", value: 0 },
          ];

    // Map rows cleanly to our established frontend type interface contract maps
    const rawResponses: SurveySubmission[] = rawDataResult.rows
      .map((row) => ({
        _id: String(row.id),
        role: row.role,
        responses: row.responses,
        contact: {
          name: row.name || "",
          email: row.email || "",
          phone: row.phone || "",
          earlyAccess: borderParsingBoolean(row.early_access),
        },
        createdAt: new Date(row.created_at).toISOString(),
      }))
      .slice(0, 100);

    return NextResponse.json({
      summary: {
        totalResponses,
        byRole,
        mostRequestedFeatures,
        pricingPreferences,
        willingnessToPay: pricingPreferences,
      },
      rawResponses,
    });
  } catch (err: unknown) {
    const errorLog =
      err instanceof Error ? err.message : "SQL query computation failure";
    console.error("Postgres analytics engine failure exception:", errorLog);

    return NextResponse.json(
      { error: "Failed to extract runtime aggregate vectors" },
      { status: 500 },
    );
  }
}

// 2. Changed 'any' to 'unknown' to safely comply with strict typescript lint profiles
function borderParsingBoolean(val: unknown): boolean {
  if (typeof val === "boolean") return val;
  if (val === "true" || val === 1) return true;
  return false;
}
