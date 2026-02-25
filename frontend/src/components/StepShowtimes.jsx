import { useState, useEffect, useMemo } from "react";
import { getShowtimes } from "../api/client";
import { formatPrice, findBestPrice, PLATFORMS } from "../utils/helpers";
import Skeleton from "./Skeleton";
import "./StepShowtimes.css";

const CHAIN_COLORS = {
    CGV: "#e71a0f",
    Lotte: "#e60012",
    BHD: "#8bc34a",
    Galaxy: "#ff9800",
};

export default function StepShowtimes({ movieId, date, onSelect }) {
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cinemaFilter, setCinemaFilter] = useState("all");
    const [seatFilter, setSeatFilter] = useState("all");

    useEffect(() => {
        setLoading(true);
        setCinemaFilter("all");
        setSeatFilter("all");
        getShowtimes(movieId, date)
            .then(setShowtimes)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [movieId, date]);

    // Extract unique cinemas and seat types for filters
    const cinemas = useMemo(() => {
        const map = new Map();
        showtimes.forEach((st) => {
            if (!map.has(st.cinemaId)) {
                map.set(st.cinemaId, {
                    id: st.cinemaId,
                    name: st.cinemaName,
                    chain: st.cinemaChain,
                });
            }
        });
        return Array.from(map.values());
    }, [showtimes]);

    const seatTypes = useMemo(() => {
        return [...new Set(showtimes.map((st) => st.seatType))];
    }, [showtimes]);

    // Apply filters
    const filtered = useMemo(() => {
        return showtimes.filter(
            (st) =>
                (cinemaFilter === "all" || st.cinemaId === cinemaFilter) &&
                (seatFilter === "all" || st.seatType === seatFilter)
        );
    }, [showtimes, cinemaFilter, seatFilter]);

    // Find global best price across ALL filtered showtimes for highlighting
    const globalBestPrice = useMemo(() => {
        let best = Infinity;
        filtered.forEach((st) => {
            Object.values(st.prices).forEach((p) => {
                if (p != null && p < best) best = p;
            });
        });
        return best === Infinity ? null : best;
    }, [filtered]);

    // Group by cinema
    const groupedByCinema = useMemo(() => {
        const groups = {};
        filtered.forEach((st) => {
            const key = st.cinemaId;
            if (!groups[key]) {
                groups[key] = {
                    cinemaId: st.cinemaId,
                    cinemaName: st.cinemaName,
                    cinemaChain: st.cinemaChain,
                    showtimes: [],
                };
            }
            groups[key].showtimes.push(st);
        });
        return Object.values(groups);
    }, [filtered]);

    if (loading) return <Skeleton count={4} type="card" />;

    return (
        <div className="step-showtimes-v2">
            {/* Filters */}
            <div className="st-filters">
                {/* Cinema filter */}
                <div className="filter-row">
                    <div className="filter-scroll">
                        <button
                            className={`filter-chip ${cinemaFilter === "all" ? "active" : ""}`}
                            onClick={() => setCinemaFilter("all")}
                        >
                            Tất cả rạp
                        </button>
                        {cinemas.map((c) => (
                            <button
                                key={c.id}
                                className={`filter-chip ${cinemaFilter === c.id ? "active" : ""}`}
                                onClick={() => setCinemaFilter(c.id)}
                            >
                                <span
                                    className="filter-dot"
                                    style={{ background: CHAIN_COLORS[c.chain] || "#666" }}
                                />
                                {c.chain}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Seat type filter */}
                {seatTypes.length > 1 && (
                    <div className="filter-row">
                        <div className="filter-scroll">
                            <button
                                className={`filter-chip filter-chip--sm ${seatFilter === "all" ? "active" : ""}`}
                                onClick={() => setSeatFilter("all")}
                            >
                                Tất cả ghế
                            </button>
                            {seatTypes.map((st) => (
                                <button
                                    key={st}
                                    className={`filter-chip filter-chip--sm ${seatFilter === st ? "active" : ""}`}
                                    onClick={() => setSeatFilter(st)}
                                >
                                    {st === "VIP" ? "💎 VIP" : "🪑 " + st}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="st-legend">
                <div className="legend-item">
                    <span className="legend-dot legend-dot--best" /> Giá tốt nhất
                </div>
                <div className="legend-platforms">
                    {Object.entries(PLATFORMS).map(([key, info]) => (
                        <span key={key} className="legend-platform" style={{ color: info.color }}>
                            ● {info.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* Showtime cards grouped by cinema */}
            {groupedByCinema.length === 0 ? (
                <div className="empty-state">Không có suất chiếu</div>
            ) : (
                <div className="cinema-groups">
                    {groupedByCinema.map((group) => (
                        <div key={group.cinemaId} className="cinema-group">
                            <div className="cinema-group-header">
                                <span
                                    className="cinema-badge"
                                    style={{ background: CHAIN_COLORS[group.cinemaChain] || "#666" }}
                                >
                                    {group.cinemaChain}
                                </span>
                                <span className="cinema-group-name">{group.cinemaName}</span>
                            </div>
                            <div className="showtime-cards">
                                {group.showtimes.map((st) => {
                                    const { bestPlatforms, bestPrice } = findBestPrice(st.prices);
                                    const isGlobalBest = bestPrice === globalBestPrice;

                                    return (
                                        <button
                                            key={st.id}
                                            className={`showtime-card ${isGlobalBest ? "showtime-card--best" : ""}`}
                                            onClick={() => onSelect(st)}
                                        >
                                            {isGlobalBest && (
                                                <div className="best-tag">🏆 Giá tốt nhất</div>
                                            )}
                                            <div className="st-card-top">
                                                <span className="st-time">{st.time}</span>
                                                <span className="st-format">{st.format}</span>
                                                <span className="st-seat">{st.seatType}</span>
                                            </div>
                                            <div className="st-prices">
                                                {Object.entries(PLATFORMS).map(([pKey, pInfo]) => {
                                                    const price = st.prices[pKey];
                                                    const isBest = bestPlatforms.includes(pKey);
                                                    return (
                                                        <div
                                                            key={pKey}
                                                            className={`st-price ${isBest ? "st-price--best" : ""} ${price == null ? "st-price--na" : ""}`}
                                                        >
                                                            <span className="st-price-platform" style={{ color: pInfo.color }}>
                                                                {pInfo.name}
                                                            </span>
                                                            <span className="st-price-value">
                                                                {price != null ? formatPrice(price) : "N/A"}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
