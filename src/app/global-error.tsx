"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <head>
        <title>页面暂时不可用 · 星语秘境 Astral Oracle</title>
      </head>
      <body
        style={{
          margin: 0,
          background: "#070812",
          color: "#f7f1e7",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <main
          style={{
            minHeight: "100svh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
            boxSizing: "border-box",
          }}
        >
          <section
            role="alert"
            aria-labelledby="global-error-title"
            style={{
              width: "100%",
              maxWidth: "480px",
              padding: "40px 28px",
              boxSizing: "border-box",
              textAlign: "center",
              border: "1px solid rgba(215, 180, 106, 0.22)",
              borderRadius: "16px",
              background: "#111323",
            }}
          >
            <p
              style={{
                margin: 0,
                color: "#d7b46a",
                fontSize: "12px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
              }}
            >
              Astral Oracle
            </p>
            <h1
              id="global-error-title"
              style={{ margin: "14px 0 0", fontSize: "28px" }}
            >
              星空暂时失去了回应
            </h1>
            <p
              style={{ margin: "16px 0 0", color: "#b9b4c8", lineHeight: 1.7 }}
            >
              页面遇到了一点意外。为保护你的信息,这里不会显示错误详情。
            </p>
            <button
              type="button"
              onClick={() => unstable_retry()}
              style={{
                marginTop: "28px",
                minHeight: "44px",
                padding: "0 24px",
                cursor: "pointer",
                border: 0,
                borderRadius: "8px",
                background: "#d7b46a",
                color: "#1c1608",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              再试一次
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
