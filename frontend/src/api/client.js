const API_BASE = "http://localhost:8000";

async function fetchJSON(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getMovies() {
  return fetchJSON("/api/movies");
}

export async function getCinemas(movieId, date) {
  let url = `/api/cinemas?movieId=${encodeURIComponent(movieId)}`;
  if (date) url += `&date=${encodeURIComponent(date)}`;
  return fetchJSON(url);
}

export async function getDates(movieId, cinemaId) {
  let url = `/api/dates?movieId=${encodeURIComponent(movieId)}`;
  if (cinemaId) url += `&cinemaId=${encodeURIComponent(cinemaId)}`;
  return fetchJSON(url);
}

export async function getShowtimes(movieId, date, cinemaId) {
  let url = `/api/showtimes?movieId=${encodeURIComponent(movieId)}&date=${encodeURIComponent(date)}`;
  if (cinemaId) url += `&cinemaId=${encodeURIComponent(cinemaId)}`;
  return fetchJSON(url);
}

export async function getSeats(showtimeId) {
  return fetchJSON(`/api/seats?showtimeId=${encodeURIComponent(showtimeId)}`);
}
