import { user } from "@/drizzle/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let db: any = null;

export const connectToDB = async () => {
  if (!db) {
    const client = postgres(process.env.DATABASE_URL as string, {
      ssl: "require",
    });
    db = drizzle(client, { schema: { user }, logger: true });
    console.log("Database connected successfully");
  }
  return db;
};
