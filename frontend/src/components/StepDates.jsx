import { useState, useEffect } from "react";
import { getDates } from "../api/client";
import { formatDate } from "../utils/helpers";
import Skeleton from "./Skeleton";
import "./StepDates.css";

export default function StepDates({ movieId, onSelect }) {
    const [dates, setDates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getDates(movieId)
            .then(setDates)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [movieId]);

    if (loading) return <Skeleton count={5} type="chip" />;

    return (
        <div className="step-dates">
            {dates.length === 0 ? (
                <div className="empty-state">Không có ngày chiếu</div>
            ) : (
                <div className="date-scroll">
                    {dates.map((dateStr) => {
                        const { dayOfWeek, display } = formatDate(dateStr);
                        const isToday =
                            dateStr === new Date().toISOString().split("T")[0];
                        return (
                            <button
                                key={dateStr}
                                className={`date-chip ${isToday ? "date-today" : ""}`}
                                onClick={() => onSelect(dateStr)}
                            >
                                <span className="date-dow">{isToday ? "Hôm nay" : dayOfWeek}</span>
                                <span className="date-display">{display}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
