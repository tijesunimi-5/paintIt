import { pool } from "@/lib/db";

export interface CreateEarlyAccessLeadDTO {
  name: string;
  email: string;
  phone: string;
  role: "Painter" | "Homeowner" | "Designer";
}

export class UserDBAccess {
  /**
   * Secure Verification: Search the dedicated marketing table for existing registration flags
   */
  static async findExistingLead(
    email: string,
    phone: string,
  ): Promise<boolean> {
    const startTime = Date.now();

    try {
      const checkQuery =
        "SELECT id FROM early_access_leads WHERE email = $1 OR phone = $2 LIMIT 1;";
      const result = await pool.query(checkQuery, [email, phone]);

      console.log(
        `[LEAD METRIC] Duplicate validation lookup executed in ${Date.now() - startTime}ms`,
      );
      return result.rows.length > 0;
    } catch (err) {
      console.error(
        "[DB ERROR] Error inside findExistingLead transaction thread:",
        err,
      );
      throw err;
    }
  }

  /**
   * Storage Operation: Append clean marketing profiles directly to the isolated early access table
   */
  static async registerEarlyAccessLead(
    dto: CreateEarlyAccessLeadDTO,
  ): Promise<number> {
    const startTime = Date.now();

    const insertQuery = `
      INSERT INTO early_access_leads (name, email, phone, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id;
    `;

    const values = [dto.name, dto.email, dto.phone, dto.role];

    try {
      const result = await pool.query(insertQuery, values);

      console.log(
        `[DB SUCCESS] Lead safely registered to waitlist table. ID: ${result.rows[0].id}. Write took: ${Date.now() - startTime}ms`,
      );
      return result.rows[0].id;
    } catch (err) {
      console.error(
        "[DB ERROR] Operational insert failed inside registerEarlyAccessLead:",
        err,
      );
      throw err;
    }
  }
}
