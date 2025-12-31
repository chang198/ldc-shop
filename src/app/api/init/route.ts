import { db } from "@/lib/db";
import { migrate } from "drizzle-orm/vercel-postgres/migrator";
import { NextResponse } from "next/server";
import path from "path";

export async function GET() {
    try {
        // This will run migrations from the /drizzle folder (relative to project root in deployment?)
        // Note: In Vercel, we need to ensure the migration files are included in the build output.
        // They usually are if they are in the project root or src. 
        // We configured output to "./lib/db/migrations" in drizzle.config.ts.
        // Let's verify where they are.

        // Changing standard to 'src/lib/db/migrations' matches config? 
        // Wait, let's adjust config to be standard 'drizzle' folder in root for simplicity?
        // No, let's stick to config but point correctly.

        // Attempt migration
        // For Vercel Postgres, we use the specific migrator
        await migrate(db, { migrationsFolder: path.join(process.cwd(), "lib/db/migrations") });

        return NextResponse.json({ success: true, message: "Database initialized successfully" });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
