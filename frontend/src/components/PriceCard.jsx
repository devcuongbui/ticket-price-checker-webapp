import { formatPrice, PLATFORMS } from "../utils/helpers";
import "./PriceCard.css";

export default function PriceCard({ platform, price, isBest, allSamePrice }) {
    const info = PLATFORMS[platform];
    const hasPrice = price != null;

    return (
        <div
            className={`price-card ${isBest ? "price-card--best" : ""} ${!hasPrice ? "price-card--unavailable" : ""}`}
            style={{ "--platform-color": info.color }}
        >
            {isBest && (
                <div className="best-badge">
                    {allSamePrice ? "🏷️ Đồng giá" : "🏆 Giá tốt nhất"}
                </div>
            )}
            <div className="price-card-header">
                <div className="platform-logo" style={{ background: info.color }}>
                    {info.name.charAt(0)}
                </div>
                <span className="platform-name">{info.name}</span>
            </div>
            <div className="price-value">
                {hasPrice ? formatPrice(price) : "Không có dữ liệu"}
            </div>
        </div>
    );
}
