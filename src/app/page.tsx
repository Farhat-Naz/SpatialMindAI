export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>SpatialMind AI</h1>
      <p style={{ marginTop: "0.5rem", color: "#666" }}>
        Enterprise-grade AI-powered Web GIS platform
      </p>
    </main>
  );
}
