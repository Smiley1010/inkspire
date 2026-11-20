
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

// GET: Retrieve comments for a published article.
export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const post = await prisma.post.findFirst({
      where: {
        slug,
        published: true,
      },
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
    console.error("GET comments error:", error);

    return NextResponse.json(
      { message: "Unable to load comments." },
      { status: 500 }
    );
  }
}

// POST: Save a new comment.
export async function POST(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please sign in to leave a comment." },
        { status: 401 }
      );
    }

    const { slug } = await params;
    const body = await request.json();
    const content = body.content?.trim();

    if (!content) {
      return NextResponse.json(
        { message: "Please write a comment first." },
        { status: 400 }
      );
    }

    if (content.length > 2000) {
      return NextResponse.json(
        { message: "Comments cannot exceed 2,000 characters." },
        { status: 400 }
      );
    }

    const post = await prisma.post.findFirst({
      where: {
        slug,
        published: true,
      },
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
        postId: post.id,
        userId: session.user.id,
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
      {
        message: "Your comment has been posted.",
        comment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST comment error:", error);

    return NextResponse.json(
      { message: "Unable to post your comment." },
      { status: 500 }
    );
  }
}
