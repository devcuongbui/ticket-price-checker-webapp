import { findBestPrice, formatDate, formatPrice, PLATFORMS } from "../utils/helpers";
import PriceCard from "./PriceCard";
import "./StepResult.css";

export default function StepResult({ selections, onReset, onChangeStep }) {
    const { movie, date, showtime } = selections;
    const { bestPlatforms } = findBestPrice(showtime.prices);

    const platforms = Object.keys(PLATFORMS);
    const availablePrices = platforms
        .map((p) => showtime.prices[p])
        .filter((v) => v != null);
    const allSamePrice =
        availablePrices.length > 1 &&
        availablePrices.every((v) => v === availablePrices[0]);

    const dateInfo = formatDate(date);

    return (
        <div className="step-result">
            {/* Selection summary */}
            <div className="result-summary">
                <div className="summary-row">
                    <span className="summary-label">Phim</span>
                    <span className="summary-value">{movie.title}</span>
                    <button className="change-btn" onClick={() => onChangeStep(0)}>Đổi</button>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Ngày</span>
                    <span className="summary-value">{dateInfo.full}</span>
                    <button className="change-btn" onClick={() => onChangeStep(1)}>Đổi</button>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Rạp</span>
                    <span className="summary-value">{showtime.cinemaName}</span>
                    <button className="change-btn" onClick={() => onChangeStep(2)}>Đổi</button>
                </div>
                <div className="summary-row">
                    <span className="summary-label">Suất</span>
                    <span className="summary-value">
                        {showtime.time} • {showtime.format} • {showtime.seatType}
                    </span>
                    <button className="change-btn" onClick={() => onChangeStep(2)}>Đổi</button>
                </div>
            </div>

            {/* Price comparison */}
            <h3 className="result-heading">So sánh giá vé</h3>
            <div className="price-cards">
                {platforms.map((platform) => (
                    <PriceCard
                        key={platform}
                        platform={platform}
                        price={showtime.prices[platform]}
                        isBest={bestPlatforms.includes(platform)}
                        allSamePrice={allSamePrice}
                    />
                ))}
            </div>

            {/* Reset button */}
            <button className="reset-btn" onClick={onReset}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <path d="M1 4v6h6" />
                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                </svg>
                Tra cứu lại
            </button>
        </div>
    );
}
