import { useState, useEffect } from "react";
import { getCinemas } from "../api/client";
import { removeAccents } from "../utils/helpers";
import SearchBox from "./SearchBox";
import Skeleton from "./Skeleton";
import "./StepCinemas.css";

const CHAIN_COLORS = {
    CGV: "#e71a0f",
    Lotte: "#e60012",
    BHD: "#8bc34a",
    Galaxy: "#ff9800",
};

export default function StepCinemas({ movieId, date, onSelect }) {
    const [cinemas, setCinemas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterQuery, setFilterQuery] = useState("");

    useEffect(() => {
        setLoading(true);
        getCinemas(movieId, date)
            .then(setCinemas)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [movieId, date]);

    const filtered = filterQuery
        ? cinemas.filter((c) => removeAccents(c.name).includes(filterQuery))
        : cinemas;

    if (loading) return <Skeleton count={3} type="card" />;

    return (
        <div className="step-cinemas">
            <SearchBox placeholder="Tìm rạp..." onFilter={setFilterQuery} />
            {filtered.length === 0 ? (
                <div className="empty-state">Không tìm thấy rạp nào</div>
            ) : (
                <div className="cinema-list">
                    {filtered.map((cinema) => (
                        <button
                            key={cinema.id}
                            className="cinema-card"
                            onClick={() => onSelect(cinema)}
                        >
                            <div
                                className="cinema-chain-badge"
                                style={{ background: CHAIN_COLORS[cinema.chain] || "#666" }}
                            >
                                {cinema.chain}
                            </div>
                            <div className="cinema-info">
                                <h3 className="cinema-name">{cinema.name}</h3>
                                <span className="cinema-address">{cinema.address}</span>
                            </div>
                            <svg className="cinema-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
