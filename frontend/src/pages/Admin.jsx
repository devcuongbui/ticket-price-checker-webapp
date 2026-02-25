import { useState, useEffect } from "react";
import { adminGetUsers, adminUpdateUserRole } from "../api/client";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/login");
            return;
        }

        const fetchUsers = async () => {
            try {
                const data = await adminGetUsers();
                setUsers(data);
            } catch (err) {
                setError("Lỗi khi tải danh sách người dùng. " + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user, navigate]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await adminUpdateUserRole(userId, newRole);
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err) {
            setError("Lỗi khi cập nhật vai trò: " + err.message);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    }

    if (loading) return <div className="admin-container loading">Đang tải dữ liệu...</div>;

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h2>Quản Lý Tài Khoản</h2>
                <div className="admin-actions">
                    <span>Xin chào, Admin!</span>
                    <button onClick={handleLogout} className="sm-btn sm-btn--secondary">Đăng xuất</button>
                    <button onClick={() => navigate("/")} className="sm-btn sm-btn--primary">Trang chủ</button>
                </div>
            </div>

            {error && <div className="admin-error">{error}</div>}

            <div className="admin-card">
                <h3>Danh sách người dùng</h3>
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <span className={`role-badge role-${u.role}`}>{u.role}</span>
                                            {u.id !== user.id && ( // Prevent changing own role
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    style={{
                                                        background: "rgba(255,255,255,0.05)",
                                                        border: "1px solid var(--border)",
                                                        color: "var(--text-primary)",
                                                        padding: "4px",
                                                        borderRadius: "4px",
                                                        fontSize: "12px",
                                                        outline: "none"
                                                    }}
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{ textAlign: "center" }}>Không có người dùng nào.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
