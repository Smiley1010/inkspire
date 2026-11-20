
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { id: slug } = await params;

    const post = await prisma.post.findFirst({
      where: { slug, published: true },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { message: "Article not found." },
        { status: 404 }
      );
    }

    const comments = await prisma.comment.findMany({
      where: { postId: post.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Load comments error:", error);
    return NextResponse.json(
      { message: "Unable to load comments." },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please sign in to leave a comment." },
        { status: 401 }
      );
    }

    const { id: slug } = await params;
    const body = await request.json();
    const content =
      typeof body.content === "string" ? body.content.trim() : "";

    if (!content || content.length > 3000) {
      return NextResponse.json(
        { message: "Your comment must be between 1 and 3,000 characters." },
        { status: 400 }
      );
    }

    const post = await prisma.post.findFirst({
      where: { slug, published: true },
      select: { id: true },
    });

    if (!post) {
      return NextResponse.json(
        { message: "Article not found." },
        { status: 404 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId: session.user.id,
        postId: post.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Your comment has been posted.", comment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { message: "Unable to post your comment." },
      { status: 500 }
    );
  }
}
