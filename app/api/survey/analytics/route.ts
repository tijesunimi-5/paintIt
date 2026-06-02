import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import SurveyResponse from "@/lib/models/SurveyResponse";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const totalResponses = await SurveyResponse.countDocuments();

    // 1. Roll-up role demographics counters
    const roleStats = await SurveyResponse.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const byRole = roleStats.map((item) => ({
      name: item._id.replace("_", " ").toUpperCase(),
      value: item.count,
    }));

    // 2. Extrapolate Multi-Select feature metrics configurations
    const rawSubmissions = await SurveyResponse.find({}, "responses");
    const featuresMap: Record<string, number> = {};
    const premiumPricingMap: Record<string, number> = {};

    rawSubmissions.forEach((doc) => {
      const resp = doc.responses;
      if (!resp) return;

      // Scan homeowner feature requests
      const hoFeatures = resp.get("ho_q8");
      if (Array.isArray(hoFeatures)) {
        hoFeatures.forEach((f: string) => {
          featuresMap[f] = (featuresMap[f] || 0) + 1;
        });
      }

      // Track Pricing values from painters and designers
      const paPrice = resp.get("pa_q12");
      if (paPrice)
        premiumPricingMap[paPrice] = (premiumPricingMap[paPrice] || 0) + 1;
      const dePrice = resp.get("de_q12");
      if (dePrice)
        premiumPricingMap[dePrice] = (premiumPricingMap[dePrice] || 0) + 1;
    });

    const mostRequestedFeatures = Object.entries(featuresMap)
      .map(([name, val]) => ({
        name,
        value: val,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const pricingPreferences = Object.entries(premiumPricingMap).map(
      ([name, value]) => ({
        name,
        value,
      }),
    );

    const rawResponses = await SurveyResponse.find()
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json({
      summary: {
        totalResponses,
        byRole,
        mostRequestedFeatures,
        pricingPreferences,
        willingnessToPay: pricingPreferences, // Derived cross-metric mapping references
      },
      rawResponses,
    });
  } catch (err) {
    console.error("Analytics extraction module crashed:", err);
    return NextResponse.json(
      { error: "Failed to extract runtime aggregate vectors" },
      { status: 500 },
    );
  }
}
