
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import sanitizeHtml from "sanitize-html";

function createSlug(title) {
  return (
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now().toString(36)
  );
}

const allowedTags = [
  ...sanitizeHtml.defaults.allowedTags,
  "img",
  "h1",
  "h2",
  "u",
  "s",
  "iframe",
];

const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: ["src", "alt", "width", "height"],
  a: ["href", "name", "target", "rel"],
  iframe: ["src", "width", "height", "allow", "allowfullscreen"],
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "true";

    if (mine) {
      const session = await auth();

      if (!session?.user?.id) {
        return NextResponse.json(
          { message: "Please sign in." },
          { status: 401 }
        );
      }

      const posts = await prisma.post.findMany({
        where: { userId: session.user.id },
        include: { category: true },
        orderBy: { updatedAt: "desc" },
      });

      return NextResponse.json({ posts });
    }

    const posts = await prisma.post.findMany({
      where: { published: true },
      include: {
        category: true,
        user: { select: { id: true, name: true, image: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Fetch posts error:", error);

    return NextResponse.json(
      { message: "Unable to retrieve articles." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "You must sign in to write an article." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const title = body.title?.trim();
    const description = body.description?.trim();
    const categoryName = body.category?.trim();
    const image = body.image?.trim() || null;
    const shouldPublish = body.published === true;

    if (!title || !description || !body.content || !categoryName) {
      return NextResponse.json(
        { message: "Please complete the title, description, content and category." },
        { status: 400 }
      );
    }

    if (title.length > 180 || description.length > 300) {
      return NextResponse.json(
        { message: "The title or description is too long." },
        { status: 400 }
      );
    }

    if (image && !/^https?:\/\/.+/i.test(image)) {
      return NextResponse.json(
        { message: "Please provide a valid cover image URL." },
        { status: 400 }
      );
    }

    const content = sanitizeHtml(body.content, {
      allowedTags,
      allowedAttributes,
      allowedSchemes: ["http", "https", "mailto"],
      allowProtocolRelative: false,
    });

    if (!content.trim()) {
      return NextResponse.json(
        { message: "Your article content is empty." },
        { status: 400 }
      );
    }

    const categorySlug = categoryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: {},
      create: {
        name: categoryName,
        slug: categorySlug,
      },
    });

    const post = await prisma.post.create({
      data: {
        title,
        slug: createSlug(title),
        description,
        content,
        image,
        published: shouldPublish,
        userId: session.user.id,
        categoryId: category.id,
      },
      include: { category: true },
    });

    return NextResponse.json(
      { message: shouldPublish ? "Article published." : "Draft saved.", post },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create post error:", error);

    return NextResponse.json(
      { message: "Unable to save your article." },
      { status: 500 }
    );
  }
}