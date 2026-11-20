
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please sign in." },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (
      typeof newPassword !== "string" ||
      newPassword.length < 8 ||
      newPassword.length > 128
    ) {
      return NextResponse.json(
        { message: "Your new password must be between 8 and 128 characters." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Account not found." },
        { status: 404 }
      );
    }

    if (user.passwordHash) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: "Enter your current password." },
          { status: 400 }
        );
      }

      const valid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

      if (!valid) {
        return NextResponse.json(
          { message: "Your current password is incorrect." },
          { status: 400 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      message: "Your password has been changed successfully.",
    });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json(
      { message: "Unable to change your password." },
      { status: 500 }
    );
  }
}
