import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGetProductsQuery } from "../../app/services/authApi";
import "./Products.css";
import Header from "../home/Header";

function formatMoney(n, valute = "USD") {
  const num = Number(n || 0);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: valute,
      maximumFractionDigits: valute === "UZS" ? 0 : 2,
    }).format(num);
  } catch {
    return `${num.toLocaleString()} ${valute}`;
  }
}

function firstImage(images) {
  if (Array.isArray(images) && images.length) return images[0];
  return "https://via.placeholder.com/600x600?text=No+Image";
}

function getFirstPrice(prices) {
  if (!Array.isArray(prices) || prices.length === 0) return null;
  return prices[0];
}

function calcDiscountPercent(entry) {
  const d = Number(entry?.discount ?? 0);
  if (!Number.isFinite(d) || d <= 0) return 0;
  return Math.min(100, Math.max(0, d));
}

function genderLabel(g) {
  if (g === "men") return "Men";
  if (g === "women") return "Women";
  if (g === "unisex") return "Unisex";
  return g || "—";
}

export default function Products() {
  const {
    data: productsRaw = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProductsQuery();

  const [q, setQ] = useState("");
  const [gender, setGender] = useState("all");
  const [selectedMl, setSelectedMl] = useState([]);
  const [sliderMin, setSliderMin] = useState(null);
  const [sliderMax, setSliderMax] = useState(null);

  // Derive dynamic options — scan EVERY price entry of EVERY product
  const { minPrice, maxPrice, mlOptions } = useMemo(() => {
    const arr = Array.isArray(productsRaw) ? productsRaw : [];
    let min = Infinity;
    let max = -Infinity;
    const mlSet = new Set();

    arr.forEach((p) => {
      const prices = Array.isArray(p.prices) ? p.prices : [];
      prices.forEach((entry) => {
        const price = Number(entry.price ?? 0);
        if (price < min) min = price;
        if (price > max) max = price;
        if (entry.ml_sizes != null) mlSet.add(Number(entry.ml_sizes));
      });
    });

    return {
      minPrice: isFinite(min) ? min : 0,
      maxPrice: isFinite(max) ? max : 1000,
      mlOptions: Array.from(mlSet).sort((a, b) => a - b),
    };
  }, [productsRaw]);

  const activeMin = sliderMin ?? minPrice;
  const activeMax = sliderMax ?? maxPrice;

  const toggleMl = (ml) =>
    setSelectedMl((prev) =>
      prev.includes(ml) ? prev.filter((x) => x !== ml) : [...prev, ml],
    );

  const resetFilters = () => {
    setQ("");
    setGender("all");
    setSliderMin(null);
    setSliderMax(null);
    setSelectedMl([]);
  };

  const products = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (Array.isArray(productsRaw) ? productsRaw : []).filter((p) => {
      const matchSearch =
        !s ||
        (p.title || "").toLowerCase().includes(s) ||
        (p.brand || "").toLowerCase().includes(s);

      const matchGender = gender === "all" || p.gender === gender;

      const prices = Array.isArray(p.prices) ? p.prices : [];

      // Price: match if ANY price entry falls within range
      const matchPrice =
        prices.length === 0 ||
        prices.some((entry) => {
          const price = Number(entry.price ?? 0);
          return price >= activeMin && price <= activeMax;
        });

      // ML: match if ANY price entry has a selected ml size
      const matchMl =
        selectedMl.length === 0 ||
        prices.some(
          (entry) =>
            entry.ml_sizes != null &&
            selectedMl.includes(Number(entry.ml_sizes)),
        );

      return matchSearch && matchGender && matchPrice && matchMl;
    });
  }, [productsRaw, q, gender, activeMin, activeMax, selectedMl]);

  const activeFilterCount = [
    gender !== "all",
    sliderMin !== null || sliderMax !== null,
    selectedMl.length > 0,
  ].filter(Boolean).length;

  const pctMin =
    maxPrice > minPrice
      ? ((activeMin - minPrice) / (maxPrice - minPrice)) * 100
      : 0;
  const pctMax =
    maxPrice > minPrice
      ? ((activeMax - minPrice) / (maxPrice - minPrice)) * 100
      : 100;

  return (
    <div className="prd-root">
      <Header/>
      <div className="prd-layout">
        {/* ── Sidebar ── */}
        <aside className="prd-sidebar">
          <div className="prd-sidebarHeader">
            <span className="prd-sidebarTitle">Filters</span>
            {activeFilterCount > 0 && (
              <button className="prd-resetBtn" onClick={resetFilters}>
                Clear all
              </button>
            )}
          </div>

          {/* Gender */}
          <div className="prd-filterBlock">
            <p className="prd-filterLabel">Gender</p>
            <div className="prd-genderList">
              {["all", "men", "women", "unisex"].map((g) => (
                <button
                  key={g}
                  className={`prd-genderItem ${gender === g ? "active" : ""}`}
                  onClick={() => setGender(g)}
                >
                  <span className="prd-radio" />
                  {g === "all" ? "All" : genderLabel(g)}
                </button>
              ))}
            </div>
          </div>

          {/* Price range slider */}
          {!isLoading && maxPrice > minPrice && (
            <div className="prd-filterBlock">
              <div className="prd-filterLabelRow">
                <p className="prd-filterLabel">Price</p>
              </div>
              <div className="prd-priceValues">
                <span>${activeMin}</span>
                <span>${activeMax}</span>
              </div>
              <div className="prd-rangeWrap">
                <div className="prd-rangeTrack">
                  <div
                    className="prd-rangeTrackFill"
                    style={{ left: `${pctMin}%`, right: `${100 - pctMax}%` }}
                  />
                </div>
                <input
                  type="range"
                  className="prd-range"
                  min={minPrice}
                  max={maxPrice}
                  step={1}
                  value={activeMin}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val <= activeMax) setSliderMin(val);
                  }}
                />
                <input
                  type="range"
                  className="prd-range"
                  min={minPrice}
                  max={maxPrice}
                  step={1}
                  value={activeMax}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= activeMin) setSliderMax(val);
                  }}
                />
              </div>
            </div>
          )}

          {/* ML size — dynamic from products */}
          {mlOptions.length > 0 && (
            <div className="prd-filterBlock">
              <p className="prd-filterLabel">Size</p>
              <div className="prd-mlGrid">
                {mlOptions.map((ml) => (
                  <button
                    key={ml}
                    className={`prd-mlBtn ${selectedMl.includes(ml) ? "active" : ""}`}
                    onClick={() => toggleMl(ml)}
                  >
                    {ml} ml
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="prd-sidebarFooter">
            {products.length} result{products.length !== 1 ? "s" : ""}
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="prd-main">
          {/* Back to home + Search + count */}
          <div className="prd-topbar">
            <Link className="prd-backBtn" to="/">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M19 12H5M5 12l7-7M5 12l7 7" />
              </svg>
              Home
            </Link>
            <div className="prd-searchWrap">
              <svg
                className="prd-searchIcon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="prd-searchInput"
                placeholder="Search by title or brand…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {q && (
                <button className="prd-searchClear" onClick={() => setQ("")}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <span className="prd-countLabel">
              {isLoading ? "Loading…" : `${products.length} products`}
            </span>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="prd-grid">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="prd-skelCard">
                  <div className="prd-skelImg" />
                  <div className="prd-skelBody">
                    <div className="prd-skelLine" style={{ width: "55%" }} />
                    <div className="prd-skelLine" style={{ width: "75%" }} />
                    <div className="prd-skelLine" style={{ width: "40%" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="prd-empty">
              <h3>Failed to load products</h3>
              <p>{error?.data?.message || "Something went wrong"}</p>
              <button className="prd-btn" onClick={refetch}>
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && products.length === 0 && (
            <div className="prd-empty">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ccc"
                strokeWidth="1.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search.</p>
              <button className="prd-btn" onClick={resetFilters}>
                Reset filters
              </button>
            </div>
          )}

          {/* Product Grid */}
          {!isLoading && !isError && products.length > 0 && (
            <div className="prd-grid">
              {products.map((p) => {
                const entry = getFirstPrice(p.prices);
                const discount = calcDiscountPercent(entry);
                const img = firstImage(p.images);
                const price = entry?.price ?? 0;
                const old = entry?.old_money ?? 0;
                const ml = entry?.ml_sizes ?? null;
                const showOld =
                  Number(old) > 0 &&
                  Number(old) !== Number(price) &&
                  discount > 0;

                return (
                  <article key={p.id} className="prd-card">
                    <div className="prd-imgWrap">
                      <img
                        className="prd-img"
                        src={img}
                        alt={p.title || "Product"}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/600x600?text=No+Image";
                        }}
                      />
                      {discount > 0 && (
                        <span className="prd-discountBadge">−{discount}%</span>
                      )}
                    </div>

                    <div className="prd-cardBody">
                      <div className="prd-cardTop">
                        <div className="prd-meta">
                          <span className="prd-brand">{p.brand || "—"}</span>
                          <span className="prd-dot">•</span>
                          <span
                            className={`prd-gender ${p.gender === "men" ? "men" : p.gender === "women" ? "women" : "unisex"}`}
                          >
                            {genderLabel(p.gender)}
                          </span>
                        </div>
                        <h3 className="prd-cardTitle" title={p.title}>
                          {p.title || "Untitled product"}
                        </h3>
                      </div>

                      <div className="prd-priceRow">
                        <span className="prd-priceMain">
                          {formatMoney(price, p.valute)}
                        </span>
                        {showOld && (
                          <span className="prd-priceOld">
                            {formatMoney(old, p.valute)}
                          </span>
                        )}
                      </div>

                      <div className="prd-pills">
                        {ml != null ? (
                          <span className="prd-pill">{ml} ml</span>
                        ) : (
                          <span className="prd-pill prd-pill-muted">No ML</span>
                        )}
                        {p.release_date ? (
                          <span className="prd-pill">{p.release_date}</span>
                        ) : (
                          <span className="prd-pill prd-pill-muted">
                            No date
                          </span>
                        )}
                      </div>

                      {p.info && (
                        <p className="prd-info" title={p.info}>
                          {p.info}
                        </p>
                      )}

                      <div className="prd-cardActions">
                        <button className="prd-btn prd-btn-ghost">
                          Add to cart
                        </button>
                        <Link className="prd-btn" to={`/details/${p.id}`}>
                          Details
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
