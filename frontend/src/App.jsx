import { useState, useCallback } from "react";
import StepMovies from "./components/StepMovies";
import StepDates from "./components/StepDates";
import StepShowtimes from "./components/StepShowtimes";
import StepSeatMap from "./components/StepSeatMap";
import "./App.css";

const STEPS = [
  { key: "movie", label: "Phim", icon: "🎬" },
  { key: "date", label: "Ngày", icon: "📅" },
  { key: "showtime", label: "Suất", icon: "🕐" },
  { key: "result", label: "Ghế", icon: "💺" },
];

const INITIAL_SELECTIONS = {
  movie: null,
  date: null,
  showtime: null, // showtime now contains cinemaName, cinemaChain
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState(INITIAL_SELECTIONS);

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

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <span className="header-icon">🎬</span>
          <h1 className="header-title">Check Giá Vé</h1>
          <span className="header-city">Hải Phòng</span>
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
        {/* Step 3: So sánh giá */}
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
