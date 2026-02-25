import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginApi, setTokens, getMe } from "../api/client";
import { useAuth } from "../AuthContext";
import "./Auth.css";

export default function Login() {
    const [email, setEmail] = useState(() => localStorage.getItem("lastEmail") || "");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { access_token, refresh_token } = await loginApi(email, password);
            setTokens(access_token, refresh_token);

            const user = await getMe();
            login(user);

            if (user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        } catch (err) {
            setError(err.message || "Đăng nhập thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Đăng Nhập</h2>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-field">
                        <label>Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhập email..."
                        />
                    </div>
                    <div className="auth-field">
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Nhập mật khẩu..."
                        />
                    </div>
                    <button type="submit" disabled={loading} className="auth-btn">
                        {loading ? "Đang xử lý..." : "Đăng nhập"}
                    </button>
                </form>
                <p className="auth-footer">
                    Chưa có tài khoản? <Link to="/signup">Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
}
