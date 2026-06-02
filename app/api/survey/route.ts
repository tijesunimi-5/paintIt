import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { role, responses, contact } = body;

    if (!role || !responses) {
      return NextResponse.json(
        { error: "Missing mandatory payload variables" },
        { status: 400 },
      );
    }

    // Safely extract optional fields with robust defaults
    const name = contact?.name || null;
    const email = contact?.email || null;
    const phone = contact?.phone || null;
    const earlyAccess = contact?.earlyAccess || false;

    // Direct Parameterized SQL Injection Safe Query
    const query = `
      INSERT INTO survey_responses (role, responses, name, email, phone, early_access)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `;

    const values = [
      role,
      JSON.stringify(responses), // Postgres handles stringified objects natively into JSONB columns
      name,
      email,
      phone,
      earlyAccess,
    ];

    const result = await pool.query(query, values);
    const newId = result.rows[0].id;

    return NextResponse.json({ success: true, id: newId }, { status: 201 });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "SQL execution anomaly";
    console.error("Postgres pipeline submission crash:", errorMessage);

    return NextResponse.json(
      { error: "Internal server deployment error pipeline exception" },
      { status: 500 },
    );
  }
}
