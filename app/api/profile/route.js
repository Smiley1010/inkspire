
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please sign in." },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Account not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { message: "Unable to load your profile." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please sign in." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const name = body.name?.trim();
    const image = body.image?.trim() || null;

    if (!name || name.length > 80) {
      return NextResponse.json(
        { message: "Your name must contain between 1 and 80 characters." },
        { status: 400 }
      );
    }

    if (
      image &&
      (!/^https?:\/\/.+/i.test(image) || image.length > 2000)
    ) {
      return NextResponse.json(
        { message: "Please provide a valid profile image URL." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, image },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Your profile has been updated.",
      user,
    });
  } catch (error) {
    console.error("Profile PATCH error:", error);
    return NextResponse.json(
      { message: "Unable to update your profile." },
      { status: 500 }
    );
  }
}
