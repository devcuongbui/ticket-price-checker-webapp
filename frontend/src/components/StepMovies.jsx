import { useState, useEffect } from "react";
import { getMovies } from "../api/client";
import { removeAccents } from "../utils/helpers";
import SearchBox from "./SearchBox";
import Skeleton from "./Skeleton";
import "./StepMovies.css";

export default function StepMovies({ onSelect }) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterQuery, setFilterQuery] = useState("");

    useEffect(() => {
        getMovies()
            .then(setMovies)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = filterQuery
        ? movies.filter((m) => removeAccents(m.title).includes(filterQuery))
        : movies;

    if (loading) return <Skeleton count={4} type="card" />;

    return (
        <div className="step-movies">
            <SearchBox placeholder="Tìm phim..." onFilter={setFilterQuery} />
            {filtered.length === 0 ? (
                <div className="empty-state">Không tìm thấy phim nào</div>
            ) : (
                <div className="movie-list">
                    {filtered.map((movie) => (
                        <button
                            key={movie.id}
                            className="movie-card"
                            onClick={() => onSelect(movie)}
                        >
                            <img
                                className="movie-poster"
                                src={movie.poster}
                                alt={movie.title}
                                loading="lazy"
                            />
                            <div className="movie-info">
                                <h3 className="movie-title">{movie.title}</h3>
                                <span className="movie-genre">{movie.genre}</span>
                                <div className="movie-meta">
                                    <span className="movie-duration">{movie.duration} phút</span>
                                    <span className="movie-rating">{movie.rating}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
