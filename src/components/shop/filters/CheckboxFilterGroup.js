"use client";

export default function CheckboxFilterGroup({
  title,
  options = [],
  selected = [],
  onToggle,
}) {
  if (!options?.length) return null;

  return (
    <div className="border rounded-4 p-3 bg-white mt-3">
      <div className="fw-bold mb-2">{title}</div>

      <div className="d-flex flex-column gap-2" style={{ maxHeight: 260, overflow: "auto" }}>
        {options.map((opt) => {
          const checked = selected.includes(String(opt.value));
          return (
            <label key={opt.value} className="d-flex align-items-center gap-2">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(String(opt.value))}
              />
              <span className="small">{opt.label}</span>
              {typeof opt.count === "number" && (
                <span className="ms-auto small text-muted">{opt.count}</span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
