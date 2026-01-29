export default function SectionTitle({
  first = "",
  highlight = "",
  align = "start", // start | center | end
  className = "",
}) {
  return (
    <h2
      className={`fw-bold mb-4 text-${align} ${className}`}
      style={{ fontSize: "clamp(25px, 4vw, 36px)" }}
    >
      {first}{" "}
      <span
        style={{
          background: "linear-gradient(90deg, #ff6a00, #8a2be2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {highlight}
      </span>
    </h2>
  );
}
