import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/dbConnect";
import { db } from "@/drizzle/db";
import { user } from "@/drizzle/schema";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { eq, and } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    await connectToDB();
    const { username, email, password } = await request.json();

    const existingVerifiedUserByUsername = await db!
      .select()
      .from(user)
      .where(and(eq(user.username, username), eq(user.isVerified, true)))
      .execute();

    if (existingVerifiedUserByUsername.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await db!
      .select()
      .from(user)
      .where(eq(user.email, email))
      .execute();

    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail.length > 0) {
      const userByEmail = existingUserByEmail[0];
      if (userByEmail.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: "User already exists with this email",
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db!
          .update(user)
          .set({
            password: hashedPassword,
            verifyCode,
            verifyCodeExpiry: new Date(Date.now() + 3600000),
          })
          .where(eq(user.email, email))
          .execute();
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      await db!
        .insert(user)
        .values({
          username,
          email,
          password: hashedPassword,
          verifyCode,
          verifyCodeExpiry: expiryDate,
          isVerified: false,
          isAcceptingMessages: true,
        })
        .execute();
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      return NextResponse.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully. Please verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error registering user",
      },
      { status: 500 }
    );
  }
}
