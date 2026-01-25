"use client";

export default function PaginationBar({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="d-flex justify-content-center mt-4">
      <div className="btn-group">
        <button
          className="btn btn-outline-dark"
          disabled={!canPrev}
          onClick={() => onPage(page - 1)}
        >
          Prev
        </button>

        {start > 1 && (
          <>
            <button className="btn btn-outline-dark" onClick={() => onPage(1)}>
              1
            </button>
            <button className="btn btn-outline-dark" disabled>
              ...
            </button>
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            className={`btn ${p === page ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => onPage(p)}
          >
            {p}
          </button>
        ))}

        {end < totalPages && (
          <>
            <button className="btn btn-outline-dark" disabled>
              ...
            </button>
            <button
              className="btn btn-outline-dark"
              onClick={() => onPage(totalPages)}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          className="btn btn-outline-dark"
          disabled={!canNext}
          onClick={() => onPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
