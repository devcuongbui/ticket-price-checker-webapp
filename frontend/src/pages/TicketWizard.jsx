import { useState, useCallback } from "react";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import StepMovies from "../components/StepMovies";
import StepDates from "../components/StepDates";
import StepShowtimes from "../components/StepShowtimes";
import StepSeatMap from "../components/StepSeatMap";
import "../App.css";

const STEPS = [
    { key: "movie", label: "Phim", icon: "🎬" },
    { key: "date", label: "Ngày", icon: "📅" },
    { key: "showtime", label: "Suất", icon: "🕐" },
    { key: "result", label: "Ghế", icon: "💺" },
];

const INITIAL_SELECTIONS = {
    movie: null,
    date: null,
    showtime: null,
};

export default function TicketWizard() {
    const [currentStep, setCurrentStep] = useState(0);
    const [selections, setSelections] = useState(INITIAL_SELECTIONS);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleSelect = useCallback(
        (stepKey, value) => {
            const stepIndex = STEPS.findIndex((s) => s.key === stepKey);
            const newSelections = { ...selections, [stepKey]: value };
            STEPS.forEach((s, i) => {
                if (i > stepIndex) newSelections[s.key] = null;
            });
            setSelections(newSelections);
            setCurrentStep(stepIndex + 1);
        },
        [selections]
    );

    const handleChangeStep = useCallback((stepIndex) => {
        setSelections((prev) => {
            const newSel = { ...prev };
            STEPS.forEach((s, i) => {
                if (i >= stepIndex) newSel[s.key] = null;
            });
            return newSel;
        });
        setCurrentStep(stepIndex);
    }, []);

    const handleReset = useCallback(() => {
        setSelections(INITIAL_SELECTIONS);
        setCurrentStep(0);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="app">
            {/* Header */}
            <header className="app-header">
                <div className="header-content">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="header-icon">🎬</span>
                        <h1 className="header-title">Săn vé rẻ</h1>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        {user?.role === "admin" && (
                            <button
                                onClick={() => navigate('/admin')}
                                style={{ background: 'none', border: 'none', color: '#53d8fb', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                            >
                                Admin
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' }}
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </header>

            {/* Progress bar */}
            <div className="progress-bar">
                {STEPS.map((step, i) => (
                    <div
                        key={step.key}
                        className={`progress-step ${i < currentStep ? "completed" : ""
                            } ${i === currentStep ? "active" : ""}`}
                    >
                        <div className="progress-dot">
                            {i < currentStep ? "✓" : step.icon}
                        </div>
                        <span className="progress-label">{step.label}</span>
                    </div>
                ))}
                <div
                    className="progress-line"
                    style={{
                        "--progress": `${(currentStep / (STEPS.length - 1)) * 100}%`,
                    }}
                />
            </div>

            {/* Breadcrumb */}
            {currentStep > 0 && currentStep < 3 && (
                <div className="breadcrumb">
                    {selections.movie && (
                        <button className="breadcrumb-tag" onClick={() => handleChangeStep(0)}>
                            🎬 {selections.movie.title}
                        </button>
                    )}
                    {selections.date && (
                        <button className="breadcrumb-tag" onClick={() => handleChangeStep(1)}>
                            📅 {selections.date}
                        </button>
                    )}
                </div>
            )}

            {/* Step content */}
            <main className="step-content">
                {/* Step 0: Chọn phim */}
                {currentStep === 0 && (
                    <>
                        <h2 className="step-title">Chọn phim</h2>
                        <StepMovies onSelect={(m) => handleSelect("movie", m)} />
                    </>
                )}
                {/* Step 1: Chọn ngày */}
                {currentStep === 1 && (
                    <>
                        <h2 className="step-title">Chọn ngày</h2>
                        <StepDates
                            movieId={selections.movie.id}
                            onSelect={(d) => handleSelect("date", d)}
                        />
                    </>
                )}
                {/* Step 2: Chọn suất chiếu (all rạp, filter, best price) */}
                {currentStep === 2 && (
                    <>
                        <h2 className="step-title">Chọn suất chiếu</h2>
                        <StepShowtimes
                            movieId={selections.movie.id}
                            date={selections.date}
                            onSelect={(st) => handleSelect("showtime", st)}
                        />
                    </>
                )}
                {/* Step 3: So sánh giá (Ghế) */}
                {currentStep === 3 && (
                    <StepSeatMap
                        selections={selections}
                        onReset={handleReset}
                        onChangeStep={handleChangeStep}
                    />
                )}
            </main>
        </div>
    );
}
