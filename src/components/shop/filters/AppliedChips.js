"use client";

export default function AppliedChips({ chips = [], onRemoveAll, onRemoveOne }) {
  if (!chips.length) return null;

  return (
    <div className="mb-3">
      <div className="d-flex align-items-center justify-content-between">
        <div className="fw-bold">Applied Filters</div>
        <button className="btn btn-sm btn-outline-danger" onClick={onRemoveAll}>
          Reset
        </button>
      </div>

      <div className="d-flex flex-wrap gap-2 mt-2">
        {chips.map((c, i) => (
          <button
            key={i}
            className="btn btn-sm btn-light border rounded-pill"
            onClick={() => onRemoveOne(c)}
            title="Remove"
          >
            {c.label} ✕
          </button>
        ))}
      </div>
    </div>
  );
}
