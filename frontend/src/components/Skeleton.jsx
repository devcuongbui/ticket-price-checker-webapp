import "./Skeleton.css";

export default function Skeleton({ count = 3, type = "card" }) {
    return (
        <div className="skeleton-list">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`skeleton skeleton-${type}`}>
                    {type === "card" && (
                        <>
                            <div className="skeleton-img shimmer" />
                            <div className="skeleton-text-group">
                                <div className="skeleton-text shimmer" style={{ width: "80%" }} />
                                <div className="skeleton-text shimmer" style={{ width: "50%" }} />
                            </div>
                        </>
                    )}
                    {type === "chip" && <div className="skeleton-chip shimmer" />}
                    {type === "button" && <div className="skeleton-button shimmer" />}
                </div>
            ))}
        </div>
    );
}
