import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { UserDBAccess } from "@/lib/Users";

// Tight frontend perimeter gateway schema
const earlyAccessSchema = z.object({
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().max(150).toLowerCase().trim(),
  phone: z
    .string()
    .min(7)
    .max(20)
    .regex(/^[+0-9\s-]+$/)
    .trim(),
  role: z.enum(["Painter", "Homeowner", "Designer"]),
});

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      return NextResponse.json(
        { error: "Empty registration transmission payload" },
        { status: 400 },
      );
    }

    const validationResult = earlyAccessSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failure anomaly",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    const { name, email, phone, role } = validationResult.data;

    // 1. Check for duplicates in your dedicated marketing leads table
    const isDuplicate = await UserDBAccess.findExistingLead(email, phone);
    if (isDuplicate) {
      return NextResponse.json(
        {
          error:
            "This email or phone network asset is already securely cataloged on our waitlist",
        },
        { status: 409 },
      );
    }

    // 2. Write straight to your standalone marketing table layout
    const newId = await UserDBAccess.registerEarlyAccessLead({
      name,
      email,
      phone,
      role,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Welcome to PaintIt Studio early access!",
        leadId: newId,
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error("Critical API routing controller context crash:", err);
    return NextResponse.json(
      {
        error:
          "An unexpected transaction error occurred securely inside our data framework",
      },
      { status: 500 },
    );
  }
}
