"use client";

export default function DocsPage() {
  return (
    <div style={{ height: "100vh" }}>
      <iframe
        title="Swagger UI"
        src={`/swagger-ui/index.html`}
        style={{ width: "100%", height: "100%", border: 0 }}
      />
    </div>
  );
}