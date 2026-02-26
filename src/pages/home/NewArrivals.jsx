import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useGetProductsQuery } from "../../app/services/authApi"; // adjust path
import "./NewArrivals.css";

function formatMoney(n, valute = "UZS") {
  const num = Number(n || 0);
  try {
    return new Intl.NumberFormat("uz-UZ", {
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

export default function NewArrivals() {
  const {
    data: productsRaw = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProductsQuery();

  const [expanded, setExpanded] = useState(false);
  const [q, setQ] = useState("");
  const [gender, setGender] = useState("all");

  const products = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (Array.isArray(productsRaw) ? productsRaw : []).filter((p) => {
      const matchSearch =
        !s ||
        (p.title || "").toLowerCase().includes(s) ||
        (p.brand || "").toLowerCase().includes(s);

      const matchGender = gender === "all" ? true : p.gender === gender;
      return matchSearch && matchGender;
    });
  }, [productsRaw, q, gender]);

  const total = products.length;

  // ✅ default 8, expanded max 25
  const visibleLimit = expanded ? 20 : 8;

  const visible = useMemo(() => {
    return products.slice(0, visibleLimit);
  }, [products, visibleLimit]);

  const shouldRenderSection = !isLoading && !isError && total > 0;

  // ✅ button logic:
  // - before expanded: show "See more" if total > 8
  // - after expanded: show "See all" if total > 25 (link to /products)
  const showSeeMore = !expanded && total > 8;
  const showSeeAll = expanded && total > 20;

  return (
    <div className="pp">
      {/* Hero */}
      <header className="pp-hero">
        <div className="pp-container pp-hero-inner">
          <div className="pp-hero-left">
            <h1 className="pp-title">Products</h1>
            <p className="pp-subtitle">
              Clean, modern catalogue — prices, discounts, ML sizes.
            </p>
          </div>

          <div className="pp-hero-right"></div>
        </div>
      </header>

      <main className="pp-container pp-main">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="pp-skeletonGrid" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="pp-skelCard">
                <div className="pp-skelImg" />
                <div className="pp-skelLine pp-skelLine1" />
                <div className="pp-skelLine pp-skelLine2" />
                <div className="pp-skelPills" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="pp-error">
            <div className="pp-errorTop">
              <h3>Failed to load products</h3>
              <button className="pp-btn" onClick={refetch}>
                Retry
              </button>
            </div>
            <pre className="pp-errorBox">
              {error?.data?.message || error?.error || "Something went wrong"}
            </pre>
          </div>
        )}

        {/* Filters */}
        {!isLoading && !isError && (
          <div className="pp-toolbar">
            <div className="pp-searchWrap">
              <input
                className="pp-input"
                placeholder="Search by title or brand…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {q && (
                <button
                  className="pp-clear"
                  onClick={() => setQ("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              className="pp-select"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="all">All genders</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
        )}

        {/* Product section */}
        {shouldRenderSection && (
          <section className="pp-section">
            <div className="pp-sectionHead">
              <div>
                <h2 className="pp-sectionTitle">Featured</h2>
                <p className="pp-muted">
                  Showing <b>{visible.length}</b> of <b>{total}</b>
                </p>
              </div>
            </div>

            <div className="pp-grid">
              {visible.map((p) => {
                const entry = getFirstPrice(p.prices);
                const discount = calcDiscountPercent(entry);
                const img = firstImage(p.images);

                const price = entry?.price ?? 0;
                const old = entry?.old_money ?? 0;

                // you had: const ml = entry?.ml_sizes ?? null;
                // left unchanged to match your current DB shape
                const ml = entry?.ml_sizes ?? null;

                const showOld =
                  Number(old) > 0 &&
                  Number(old) !== Number(price) &&
                  discount > 0;

                return (
                  <article key={p.id} className="pp-card">
                    <div className="pp-imgWrap">
                      <img
                        className="pp-img"
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
                        <span className="pp-discountBadge">
                          -{discount}%
                        </span>
                      )}
                    </div>

                    <div className="pp-cardBody">
                      <div className="pp-cardTop">
                        <div className="pp-meta">
                          <span className="pp-brand">{p.brand || "—"}</span>
                          <span className="pp-dot">•</span>
                          <span
                            className={`pp-gender ${
                              p.gender === "men"
                                ? "men"
                                : p.gender === "women"
                                ? "women"
                                : "unisex"
                            }`}
                          >
                            {genderLabel(p.gender)}
                          </span>
                        </div>

                        <h3 className="pp-cardTitle" title={p.title}>
                          {p.title || "Untitled product"}
                        </h3>
                      </div>

                      <div className="pp-priceRow">
                        <div className="pp-priceMain">
                          {formatMoney(price, p.valute)}
                        </div>
                        {showOld && (
                          <div className="pp-priceOld">
                            {formatMoney(old, p.valute)}
                          </div>
                        )}
                      </div>

                      <div className="pp-pills">
                        {ml ? (
                          <span className="pp-pill">{ml} ml</span>
                        ) : (
                          <span className="pp-pill pp-pill-muted">No ML</span>
                        )}
                        {p.release_date ? (
                          <span className="pp-pill">{p.release_date}</span>
                        ) : (
                          <span className="pp-pill pp-pill-muted">No date</span>
                        )}
                      </div>

                      {/* ✅ info: CSS will make it 1 line + ... */}
                      {p.info && (
                        <p className="pp-info" title={p.info}>
                          {p.info}
                        </p>
                      )}

                      <div className="pp-cardActions">
                        <button className="pp-btn pp-btn-ghost">
                          Add to cart
                        </button>
                        <button className="pp-btn">Details</button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* ✅ bottom buttons:
                - "See more" => expand to max 25
                - then "See all" link => /products (only if still more than 25)
            */}
            {(showSeeMore || showSeeAll) && (
              <div className="pp-showMoreWrap">
                {showSeeMore && (
                  <button
                    className="pp-btn pp-btn-primary"
                    onClick={() => setExpanded(true)}
                  >
                    See more
                  </button>
                )}

                {showSeeAll && (
                  <Link className="pp-btn pp-btn-primary" to="/products">
                    See all
                  </Link>
                )}
              </div>
            )}
          </section>
        )}

        {/* Empty state — filter returned nothing */}
        {!isLoading && !isError && productsRaw.length > 0 && total === 0 && (
          <div className="pp-empty">
            <h3>No matching products</h3>
            <p className="pp-muted">
              Try another search or change the gender filter.
            </p>
            <button
              className="pp-btn"
              onClick={() => {
                setQ("");
                setGender("all");
                setExpanded(false);
              }}
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Empty state — database is empty */}
        {!isLoading && !isError && productsRaw.length === 0 && (
          <div className="pp-empty">
            <h3>No products yet</h3>
            <p className="pp-muted">Soon...</p>
            <button className="pp-btn" onClick={refetch}>
              Refresh
            </button>
          </div>
        )}
      </main>
    </div>
  );
}