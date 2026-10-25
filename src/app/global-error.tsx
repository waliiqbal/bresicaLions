"use client";

// Last safety net: shown only if the whole page layout itself fails to render.
// It cannot use the site styles or fonts, so it is plain and self-contained.
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#062a17",
          color: "#f7f1e1",
          fontFamily: "Arial, Helvetica, sans-serif",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div>
          <h1 style={{ color: "#f3d27a", fontFamily: "Georgia, serif" }}>Brescia Lions</h1>
          <p>Something went wrong. Please try again in a moment.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 12,
              padding: "10px 22px",
              border: "1px solid #d4a73a",
              borderRadius: 999,
              background: "#d4a73a",
              color: "#062a17",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
