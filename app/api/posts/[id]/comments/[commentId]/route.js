
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please sign in." },
        { status: 401 }
      );
    }

    const { id: slug, commentId } = await params;

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

    const comment = await prisma.comment.findFirst({
      where: {
        id: commentId,
        postId: post.id,
      },
    });

    if (!comment) {
      return NextResponse.json(
        { message: "Comment not found." },
        { status: 404 }
      );
    }

    if (comment.userId !== session.user.id) {
      return NextResponse.json(
        { message: "You can only delete your own comments." },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { message: "Unable to delete this comment." },
      { status: 500 }
    );
  }
}
