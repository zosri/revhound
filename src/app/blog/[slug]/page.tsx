"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

export default function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [post, setPost] = useState<{ data: any; content: string } | null>(null);

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((r) => r.json())
      .then(setPost);
  }, [slug]);

  if (!post) return null;
  const { data, content } = post;

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
      <article style={{ maxWidth: "720px", margin: "0 auto" }}>
        <Link
          href="/blog"
          style={{
            color: "#f0a830",
            textDecoration: "none",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "14px",
          }}
        >
          {"<- all posts"}
        </Link>

        <div
          style={{
            marginTop: "32px",
            marginBottom: "12px",
            display: "flex",
            gap: "12px",
            alignItems: "center",
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
            {data.tag}
          </span>
          <span>{data.readTime}</span>
          <span>{data.date}</span>
        </div>

        <h1
          style={{
            fontSize: "36px",
            fontWeight: 700,
            marginBottom: "48px",
            letterSpacing: "-1px",
            lineHeight: 1.2,
          }}
        >
          {data.title}
        </h1>

        <div
          style={{
            fontSize: "17px",
            lineHeight: 1.8,
            color: "#d4cdbf",
          }}
        >
          <ReactMarkdown
            components={{
              h2: ({ children }) => (
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: 600,
                    marginTop: "48px",
                    marginBottom: "16px",
                    color: "#e8e0d4",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {children}
                </h2>
              ),
              p: ({ children }) => (
                <p style={{ marginBottom: "20px" }}>{children}</p>
              ),
              strong: ({ children }) => (
                <strong style={{ color: "#f0a830", fontWeight: 600 }}>
                  {children}
                </strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  style={{ color: "#f0a830", textDecoration: "underline" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              li: ({ children }) => (
                <li style={{ marginBottom: "8px", paddingLeft: "4px" }}>
                  {children}
                </li>
              ),
              ul: ({ children }) => (
                <ul
                  style={{
                    marginBottom: "20px",
                    paddingLeft: "24px",
                    listStyleType: "disc",
                  }}
                >
                  {children}
                </ul>
              ),
              hr: () => (
                <hr
                  style={{
                    border: "none",
                    borderTop: "1px solid rgba(240,168,48,0.15)",
                    margin: "48px 0",
                  }}
                />
              ),
              em: ({ children }) => (
                <em style={{ color: "#8a7e6b", fontStyle: "italic" }}>
                  {children}
                </em>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        <div style={{ marginTop: "64px", textAlign: "center" }}>
          <Link
            href="/blog"
            style={{
              color: "#f0a830",
              textDecoration: "none",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "14px",
            }}
          >
            {"<- all posts"}
          </Link>
        </div>
      </article>
    </main>
  );
}
