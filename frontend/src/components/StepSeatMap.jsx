import { useState, useEffect, useMemo } from "react";
import { getSeats } from "../api/client";
import { formatDate, formatPrice, findBestPrice, PLATFORMS } from "../utils/helpers";
import Skeleton from "./Skeleton";
import "./StepSeatMap.css";

export default function StepSeatMap({ selections, onReset, onChangeStep }) {
    const { movie, date, showtime } = selections;
    const [seatData, setSeatData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getSeats(showtime.id)
            .then(setSeatData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [showtime.id]);

    const dateInfo = formatDate(date);
    const { bestPlatforms, bestPrice } = findBestPrice(showtime.prices);
    const platforms = Object.keys(PLATFORMS);

    // Availability percentage
    const availPercent = seatData
        ? Math.round((seatData.summary.available / seatData.summary.total) * 100)
        : 0;

    const availClass =
        availPercent > 50 ? "avail-good" : availPercent > 20 ? "avail-medium" : "avail-low";

    if (loading) {
        return (
            <div className="step-seatmap">
                <Skeleton count={1} type="card" />
                <div className="seatmap-skeleton">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="skeleton-row" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="step-seatmap">
            {/* Selection summary header */}
            <div className="sm-summary">
                <div className="sm-summary-top">
                    <div className="sm-movie-info">
                        <h3 className="sm-movie-title">{movie.title}</h3>
                        <div className="sm-tags">
                            <span className="sm-tag">{showtime.format}</span>
                            <span className="sm-tag">{showtime.seatType}</span>
                        </div>
                    </div>
                </div>
                <div className="sm-details">
                    <div className="sm-detail">
                        <span className="sm-detail-icon">🏢</span>
                        <span>{showtime.cinemaName}</span>
                    </div>
                    <div className="sm-detail">
                        <span className="sm-detail-icon">📅</span>
                        <span>{dateInfo.full}</span>
                    </div>
                    <div className="sm-detail">
                        <span className="sm-detail-icon">🕐</span>
                        <span>{showtime.time}</span>
                    </div>
                </div>
            </div>

            {/* Price comparison mini */}
            <div className="sm-price-row">
                {platforms.map((pKey) => {
                    const pInfo = PLATFORMS[pKey];
                    const price = showtime.prices[pKey];
                    const isBest = bestPlatforms.includes(pKey);
                    return (
                        <div
                            key={pKey}
                            className={`sm-price-chip ${isBest ? "sm-price-chip--best" : ""} ${price == null ? "sm-price-chip--na" : ""}`}
                        >
                            <span className="sm-price-name" style={{ color: pInfo.color }}>
                                {pInfo.name}
                            </span>
                            <span className="sm-price-val">
                                {price != null ? formatPrice(price) : "N/A"}
                            </span>
                            {isBest && price != null && (
                                <span className="sm-best-badge">Tốt nhất</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Availability bar */}
            <div className="sm-avail-section">
                <div className="sm-avail-header">
                    <span className="sm-avail-title">Tình trạng ghế</span>
                    <span className={`sm-avail-pct ${availClass}`}>
                        {seatData.summary.available}/{seatData.summary.total} ghế trống
                    </span>
                </div>
                <div className="sm-avail-bar">
                    <div
                        className={`sm-avail-fill ${availClass}`}
                        style={{ width: `${availPercent}%` }}
                    />
                </div>
            </div>

            {/* Screen */}
            <div className="sm-screen-container">
                <div className="sm-screen" />
                <span className="sm-screen-label">MÀN HÌNH</span>
            </div>

            {/* Seat map */}
            <div className="sm-map-scroll">
                <div className="sm-map">
                    {seatData.rows.map((row) => (
                        <div key={row.label} className="sm-row">
                            <span className="sm-row-label">{row.label}</span>
                            <div className="sm-seats">
                                {row.seats.map((seat, idx) => {
                                    // Insert aisle gaps
                                    const colIndex = row.seats
                                        .slice(0, idx)
                                        .reduce((sum, s) => sum + s.colspan, 0);
                                    const showAisle = seatData.aisleAfter.includes(colIndex);

                                    return (
                                        <div
                                            key={seat.id}
                                            className="sm-seat-wrapper"
                                            style={{
                                                marginLeft: showAisle ? "12px" : undefined,
                                            }}
                                        >
                                            <div
                                                className={`sm-seat sm-seat--${seat.type} sm-seat--${seat.status} ${seat.colspan === 2 ? "sm-seat--double" : ""}`}
                                                title={`${seat.label} — ${seat.type} — ${seat.status === "available" ? "Trống" : "Đã đặt"}`}
                                            >
                                                {seat.status === "booked" && (
                                                    <span className="sm-seat-x">×</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <span className="sm-row-label">{row.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="sm-legend">
                <div className="sm-legend-item">
                    <div className="sm-legend-box sm-legend--regular" />
                    <span>Thường</span>
                </div>
                <div className="sm-legend-item">
                    <div className="sm-legend-box sm-legend--vip" />
                    <span>VIP</span>
                </div>
                <div className="sm-legend-item">
                    <div className="sm-legend-box sm-legend--couple" />
                    <span>Đôi</span>
                </div>
                <div className="sm-legend-item">
                    <div className="sm-legend-box sm-legend--booked" />
                    <span>Đã đặt</span>
                </div>
                <div className="sm-legend-item">
                    <div className="sm-legend-box sm-legend--available" />
                    <span>Trống</span>
                </div>
            </div>

            {/* Action buttons */}
            <div className="sm-actions">
                <button className="sm-btn sm-btn--secondary" onClick={() => onChangeStep(2)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Đổi suất chiếu
                </button>
                <button className="sm-btn sm-btn--primary" onClick={onReset}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <path d="M1 4v6h6" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                    Tra cứu lại
                </button>
            </div>
        </div>
    );
}
