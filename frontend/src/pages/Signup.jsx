import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerApi, loginApi, setTokens, getMe } from "../api/client";
import { useAuth } from "../AuthContext";
import "./Auth.css";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login, user } = useAuth();

    useEffect(() => {
        if (user) {
            if (user.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/");
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await registerApi(email, password);

            // Auto login after successful signup
            const { access_token, refresh_token } = await loginApi(email, password);
            setTokens(access_token, refresh_token);

            const user = await getMe();
            login(user);

            // Redirect to home page
            navigate("/");
        } catch (err) {
            setError(err.message || "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Đăng Ký</h2>
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
                            placeholder="Tạo mật khẩu..."
                        />
                    </div>
                    <button type="submit" disabled={loading} className="auth-btn">
                        {loading ? "Đang xử lý..." : "Đăng ký"}
                    </button>
                </form>
                <p className="auth-footer">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}
