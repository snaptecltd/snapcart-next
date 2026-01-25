"use client";

export default function ProductSkeletonGrid() {
  const items = Array.from({ length: 12 });

  return (
    <div className="row g-3">
      {items.map((_, i) => (
        <div key={i} className="col-6 col-md-4 col-lg-3">
          <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="bg-light" style={{ height: 200 }} />
            <div className="card-body">
              <div className="bg-light rounded" style={{ height: 14, width: "90%" }} />
              <div className="bg-light rounded mt-2" style={{ height: 14, width: "60%" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
