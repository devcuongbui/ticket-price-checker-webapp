import { useState } from "react";
import { removeAccents } from "../utils/helpers";
import "./SearchBox.css";

export default function SearchBox({ placeholder, onFilter }) {
    const [query, setQuery] = useState("");

    function handleChange(e) {
        const val = e.target.value;
        setQuery(val);
        onFilter(removeAccents(val.trim()));
    }

    function handleClear() {
        setQuery("");
        onFilter("");
    }

    return (
        <div className="search-box">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
                type="text"
                className="search-input"
                placeholder={placeholder}
                value={query}
                onChange={handleChange}
            />
            {query && (
                <button className="search-clear" onClick={handleClear} aria-label="Xóa">
                    ✕
                </button>
            )}
        </div>
    );
}
