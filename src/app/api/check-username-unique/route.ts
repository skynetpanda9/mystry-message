import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/dbConnect";
import { user } from "@/drizzle/schema";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";
import { eq, and } from "drizzle-orm";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  try {
    const db = await connectToDB();

    const { searchParams } = new URL(request.url);
    const queryParams = {
      username: searchParams.get("username"),
    };

    const result = UsernameQuerySchema.safeParse(queryParams);

    if (!result.success) {
      const usernameErrors = result.error.format().username?._errors || [];
      return NextResponse.json(
        {
          success: false,
          message:
            usernameErrors?.length > 0
              ? usernameErrors.join(", ")
              : "Invalid query parameters",
        },
        { status: 400 }
      );
    }

    const { username } = result.data;

    const existingVerifiedUsers = await db
      .select()
      .from(user)
      .where(and(eq(user.username, username), eq(user.isVerified, true)))
      .execute();

    if (existingVerifiedUsers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Username is unique",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error checking username",
      },
      { status: 500 }
    );
  }
}
