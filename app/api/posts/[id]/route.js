
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import sanitizeHtml from "sanitize-html";

const cleanContent = (value) =>
  sanitizeHtml(value || "", {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "h1",
      "h2",
      "u",
      "s",
      "iframe",
    ],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height"],
      a: ["href", "name", "target", "rel"],
      iframe: ["src", "width", "height", "allow", "allowfullscreen"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
  });

const hasText = (html) =>
  html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;

async function getOwnedPost(id, userId) {
  return prisma.post.findFirst({
    where: { id, userId },
    include: { category: true },
  });
}

// GET: Retrieve one post belonging to the signed-in user.
export async function GET(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please sign in to continue." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const post = await getOwnedPost(id, session.user.id);

    if (!post) {
      return NextResponse.json(
        { message: "Article not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("GET /api/posts/[id] error:", error);
    return NextResponse.json(
      { message: "Unable to load this article." },
      { status: 500 }
    );
  }
}

// PATCH: Update an existing post.
export async function PATCH(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please sign in to continue." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existing = await getOwnedPost(id, session.user.id);

    if (!existing) {
      return NextResponse.json(
        { message: "Article not found." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const title = body.title?.trim();
    const description = body.description?.trim();
    const categoryName = body.categoryName?.trim() || body.category?.name?.trim();
    const content = cleanContent(body.content);
    const image = body.image?.trim() || null;

    if (!title || !description || !categoryName || !hasText(content)) {
      return NextResponse.json(
        { message: "Please complete all required article fields." },
        { status: 400 }
      );
    }

    if (
      image &&
      !/^https?:\/\/.+/i.test(image)
    ) {
      return NextResponse.json(
        { message: "Please provide a valid image URL." },
        { status: 400 }
      );
    }

    const categorySlug = categoryName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: { name: categoryName },
      create: {
        name: categoryName,
        slug: categorySlug,
      },
    });

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        description,
        content,
        image,
        categoryId: category.id,
        ...(typeof body.published === "boolean"
          ? { published: body.published }
          : {}),
      },
      include: { category: true },
    });

    return NextResponse.json({
      message: "Article updated successfully.",
      post: updatedPost,
    });
  } catch (error) {
    console.error("PATCH /api/posts/[id] error:", error);
    return NextResponse.json(
      { message: "Unable to update this article." },
      { status: 500 }
    );
  }
}

// DELETE: Delete an existing post.
export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Please sign in to continue." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const existing = await getOwnedPost(id, session.user.id);

    if (!existing) {
      return NextResponse.json(
        { message: "Article not found." },
        { status: 404 }
      );
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({
      message: "Article deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE /api/posts/[id] error:", error);
    return NextResponse.json(
      { message: "Unable to delete this article." },
      { status: 500 }
    );
  }
}
