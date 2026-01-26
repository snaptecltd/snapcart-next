"use client";

import AppliedChips from "./AppliedChips";
import PriceRangeFilter from "./PriceRangeFilter";
import CheckboxFilterGroup from "./CheckboxFilterGroup";
import CategoryFilterSidebar from "./CategoryFilterSidebar";

export default function FilterSidebar({
  meta,
  state,
  onSetPrice,
  onToggleBrand,
  onToggleColor,
  onToggleAttr,
  onReset,
  onRemoveChip,
}) {
  // meta structure (recommended):
  // meta = {
  //   brands: [{value:"5", label:"Honor", count:10}],
  //   colors: [{value:"000000", label:"Black", count:4}],
  //   attributes: [
  //     { key:"ram", title:"RAM", options:[{value:"8GB", label:"8GB", count:3}] }
  //   ],
  //   price: {min:0, max:100000}
  // }

  const chips = [];

  if (state?.min_price || state?.max_price) {
    chips.push({
      type: "price",
      label: `Price: ${state.min_price || 0} - ${state.max_price || "∞"}`,
    });
  }

  (state?.brands || []).forEach((b) => chips.push({ type: "brand", value: b, label: `Brand: ${b}` }));
  (state?.colors || []).forEach((c) => chips.push({ type: "color", value: c, label: `Color: ${c}` }));

  Object.entries(state?.attrs || {}).forEach(([key, values]) => {
    values.forEach((v) => chips.push({ type: "attr", key, value: v, label: `${key}: ${v}` }));
  });

  // Better label mapping (brand id -> name, etc.)
  const brandLabelMap = new Map((meta?.brands || []).map((x) => [String(x.value), x.label]));
  const colorLabelMap = new Map((meta?.colors || []).map((x) => [String(x.value), x.label]));

  const chipsPretty = chips.map((c) => {
    if (c.type === "brand") return { ...c, label: `Brand: ${brandLabelMap.get(c.value) || c.value}`, };
    if (c.type === "color") return { ...c, label: `Color: ${colorLabelMap.get(c.value) || c.value}`, };
    return c;
  });

  return (
    <div className="sticky-top" style={{ top: 12 }}>
      <AppliedChips
        chips={chipsPretty}
        onRemoveAll={onReset}
        onRemoveOne={onRemoveChip}
      />

      <PriceRangeFilter
        value={{ min_price: state?.min_price, max_price: state?.max_price }}
        onChange={onSetPrice}
      />
      {/* <CheckboxFilterGroup
        title="Brands"
        options={meta?.brands || []}
        selected={state?.brands || []}
        onToggle={onToggleBrand}
      /> */}

      <CheckboxFilterGroup
        title="Colors"
        options={meta?.colors || []}
        selected={state?.colors || []}
        onToggle={onToggleColor}
      />

      {(meta?.attributes || []).map((grp) => (
        <CheckboxFilterGroup
          key={grp.key}
          title={grp.title}
          options={grp.options}
          selected={state?.attrs?.[grp.key] || []}
          onToggle={(v) => onToggleAttr(grp.key, v)}
        />
      ))}
    </div>
  );
}
