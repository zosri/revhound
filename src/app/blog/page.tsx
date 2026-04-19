import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";

function getBlogPosts() {
  const dir = path.join(process.cwd(), "content/blog");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

  return files
    .map((filename) => {
      const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
      const { data } = matter(raw);
      return {
        slug: filename.replace(".md", ""),
        title: data.title,
        date: data.date,
        description: data.description,
        tag: data.tag,
        readTime: data.readTime,
      };
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f0d0a",
        color: "#e8e0d4",
        fontFamily: "'Source Serif 4', Georgia, serif",
        padding: "80px 24px",
      }}
    >
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        <Link
          href="/"
          style={{
            color: "#f0a830",
            textDecoration: "none",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "14px",
          }}
        >
          ← back to revhound
        </Link>

        <h1
          style={{
            fontSize: "36px",
            fontWeight: 700,
            marginTop: "32px",
            marginBottom: "48px",
            letterSpacing: "-1px",
          }}
        >
          Blog
        </h1>

        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <article
              style={{
                borderBottom: "1px solid rgba(240,168,48,0.15)",
                paddingBottom: "32px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  marginBottom: "8px",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "12px",
                  color: "#8a7e6b",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <span
                  style={{
                    background: "rgba(240,168,48,0.12)",
                    color: "#f0a830",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {post.tag}
                </span>
                <span>{post.readTime}</span>
                <span>{post.date}</span>
              </div>
              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  marginBottom: "8px",
                  lineHeight: 1.3,
                }}
              >
                {post.title}
              </h2>
              <p
                style={{
                  color: "#8a7e6b",
                  fontSize: "15px",
                  lineHeight: 1.5,
                }}
              >
                {post.description}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </main>
  );
}