"use client";

export default function CategoryFilterSidebar({
  categoryFacets = [],
  selected = { category_slug: null, sub_category_slug: null, sub_sub_category_slug: null },
  onToggle,
}) {
  return (
    <div className="border rounded-3 p-3 bg-white">
      <h6 className="fw-bold mb-3">Categories</h6>

      {categoryFacets.length === 0 ? (
        <div className="text-muted small">No categories found</div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {categoryFacets.map((cat) => {
            const catChecked = selected.category_slug === cat.slug;

            return (
              <div key={cat.id} className="border-bottom pb-2">
                {/* Category */}
                <label className="d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!catChecked}
                    onChange={() =>
                      onToggle({
                        level: "category",
                        slug: cat.slug,
                        checked: !catChecked,
                      })
                    }
                  />
                  <span className="fw-semibold">{cat.name}</span>
                  <span className="ms-auto small text-muted">({cat.count})</span>
                </label>

                {/* Sub categories */}
                {cat.children?.length > 0 && (
                  <div className="ms-4 mt-2 d-flex flex-column gap-2">
                    {cat.children.map((sub) => {
                      const subChecked = selected.sub_category_slug === sub.slug;

                      return (
                        <div key={sub.id}>
                          <label className="d-flex align-items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!subChecked}
                              onChange={() =>
                                onToggle({
                                  level: "sub",
                                  parentSlug: cat.slug,
                                  slug: sub.slug,
                                  checked: !subChecked,
                                })
                              }
                            />
                            <span>{sub.name}</span>
                            <span className="ms-auto small text-muted">({sub.count})</span>
                          </label>

                          {/* Sub-sub categories */}
                          {sub.children?.length > 0 && (
                            <div className="ms-4 mt-2 d-flex flex-column gap-2">
                              {sub.children.map((ss) => {
                                const ssChecked = selected.sub_sub_category_slug === ss.slug;

                                return (
                                  <label key={ss.id} className="d-flex align-items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={!!ssChecked}
                                      onChange={() =>
                                        onToggle({
                                          level: "subsub",
                                          grandParentSlug: cat.slug,
                                          parentSlug: sub.slug,
                                          slug: ss.slug,
                                          checked: !ssChecked,
                                        })
                                      }
                                    />
                                    <span className="small">{ss.name}</span>
                                    <span className="ms-auto small text-muted">({ss.count})</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}