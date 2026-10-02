"use client";

export default function SentryExamplePage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Sentry Test</h1>
      <button
        onClick={() => {
          throw new Error("Sentry test error from button click");
        }}
      >
        Test Sentry Error
      </button>
    </div>
  );
}
