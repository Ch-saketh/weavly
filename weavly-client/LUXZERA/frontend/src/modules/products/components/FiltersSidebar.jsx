// src/components/FiltersSidebar.jsx
import { RotateCcw } from "lucide-react";

export default function FiltersSidebar({
  categories,
  activeCat,
  setActiveCat,
  categoryLabels,
  brands,
  activeBrand,
  setActiveBrand,
  sizes,
  activeSizes,
  toggleSize,
  priceSteps,
  priceMax,
  setPriceMax,
  sortBy,
  setSortBy,
  sortOptions,
  onReset,
  filterCount,
}) {
  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Reset button inside sidebar if filters active */}
      {filterCount > 0 && (
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-[0.22em] text-[#C97A5A] hover:text-[#2B2B2B] transition-colors pb-2 border-b border-[#E7E3DD]"
        >
          <RotateCcw size={10} /> Reset Filters
        </button>
      )}

      {/* Sort By section */}
      <FilterSection label="Sort By">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full bg-white border border-[#E7E3DD] rounded-xl px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#2B2B2B] outline-none cursor-pointer focus:border-[#5B6EF5] transition-colors appearance-none"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#2B2B2B]/40">
            <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </FilterSection>

      {/* Category Section */}
      <FilterSection label="Category">
        <div className="flex flex-col gap-0.5">
          {categories.map((cat) => (
            <FilterRow
              key={cat}
              label={categoryLabels[cat] ?? cat}
              active={activeCat === cat}
              onClick={() => setActiveCat(cat)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Brand Section */}
      <FilterSection label="Brand">
        <div className="flex flex-col gap-0.5">
          {brands.map((b) => (
            <FilterRow
              key={b}
              label={b}
              active={activeBrand === b}
              onClick={() => setActiveBrand(b)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Size Section */}
      <FilterSection label="Size">
        <div className="flex flex-wrap gap-1.5">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => toggleSize(s)}
              className={`w-9 h-9 rounded-lg text-[10px] font-extrabold border transition-all ${
                activeSizes.includes(s)
                  ? "bg-[#5B6EF5] text-[#FAF9F7] border-[#5B6EF5]"
                  : "border-[#E7E3DD] text-[#2B2B2B]/60 hover:border-[#2B2B2B]/40 hover:text-[#2B2B2B]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Section */}
      <FilterSection label="Max Price">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {priceSteps.map((p) => (
            <button
              key={p}
              onClick={() => setPriceMax(p)}
              className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold border transition-all ${
                priceMax === p
                  ? "bg-[#2B2B2B] text-[#FAF9F7] border-[#2B2B2B]"
                  : "border-[#E7E3DD] text-[#2B2B2B]/45 hover:border-[#2B2B2B]/30"
              }`}
            >
              ₹{p}
            </button>
          ))}
        </div>
        <div>
          <div className="flex justify-between text-[9px] font-bold text-[#2B2B2B]/30 mb-1">
            <span>₹200</span>
            <span className="text-[#5B6EF5] font-extrabold">₹{priceMax}</span>
          </div>
          <input
            type="range"
            min={200}
            max={5000}
            step={50}
            value={priceMax}
            onChange={(e) => setPriceMax(Number(e.target.value))}
            className="w-full accent-[#5B6EF5] h-[3px]"
          />
        </div>
      </FilterSection>
    </div>
  );
}

function FilterSection({ label, children }) {
  return (
    <div className="py-4 border-b border-[#E7E3DD] last:border-none">
      <p className="text-[8px] font-extrabold uppercase tracking-[0.44em] text-[#C6A15B] mb-3">
        {label}
      </p>
      {children}
    </div>
  );
}

function FilterRow({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left py-2 px-2 rounded-lg text-[11.5px] font-semibold transition-all flex items-center gap-2 ${
        active ? "text-[#2B2B2B] font-extrabold" : "text-[#2B2B2B]/45 hover:text-[#2B2B2B] hover:bg-[#F2EFEA]"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${active ? "bg-[#5B6EF5]" : "bg-transparent"}`} />
      {label}
    </button>
  );
}
