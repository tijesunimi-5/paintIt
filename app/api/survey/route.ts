import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import SurveyResponse from "@/lib/models/SurveyResponse";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { role, responses, contact } = body;

    if (!role || !responses) {
      return NextResponse.json(
        { error: "Missing mandatory payload variables" },
        { status: 400 },
      );
    }

    const savedRecord = await SurveyResponse.create({
      role,
      responses,
      contact,
    });

    return NextResponse.json(
      { success: true, id: savedRecord._id as string },
      { status: 201 },
    );
  } catch (err: unknown) {
    // Safely type-guard the error parameter instead of letting it default to or use "any"
    const errorMessage =
      err instanceof Error ? err.message : "Unknown runtime exception";

    console.error("API submission collection failure:", errorMessage);

    return NextResponse.json(
      { error: "Internal server deployment error pipeline exception" },
      { status: 500 },
    );
  }
}
