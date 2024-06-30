import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL as string);
export let db: PostgresJsDatabase<typeof schema> | null = null;

export const connectToDB = async (): Promise<void> => {
  try {
    if (!db) {
      db = drizzle(client, { schema, logger: true });
      console.log("Database connected successfully");
    }
  } catch (error) {
    console.error("Database connection failed:", error);
    db = null;
  }
};

await connectToDB();
