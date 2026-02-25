import { useState, useEffect } from "react";
import { adminGetUsers, adminUpdateUserRole, adminCreateUser, adminUpdateUser, adminDeleteUser } from "../api/client";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import StatsDashboard from "../components/StatsDashboard";

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("stats"); // 'users' or 'stats'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({ email: "", password: "", role: "user" });
    const [submitting, setSubmitting] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

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

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/login");
            return;
        }
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

    const handleDelete = async (userId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;
        try {
            await adminDeleteUser(userId);
            setUsers(users.filter(u => u.id !== userId));
        } catch (err) {
            setError("Lỗi khi xóa người dùng: " + err.message);
        }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({ email: "", password: "", role: "user" });
        setIsModalOpen(true);
    };

    const openEditModal = (u) => {
        setEditingUser(u);
        setFormData({ email: u.email, password: "", role: u.role });
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            if (editingUser) {
                await adminUpdateUser(editingUser.id, formData);
            } else {
                await adminCreateUser(formData);
            }
            await fetchUsers();
            setIsModalOpen(false);
        } catch (err) {
            setError("Lỗi lưu người dùng: " + err.message);
        } finally {
            setSubmitting(false);
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

            <div className="admin-tabs">
                <button
                    className={`admin-tab ${activeTab === 'stats' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stats')}
                >
                    Thống Kê Dữ Liệu
                </button>
                <button
                    className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    Quản Lý Người Dùng
                </button>
            </div>

            {activeTab === 'users' ? (
                <div className="admin-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                        <h3 style={{ margin: 0 }}>Danh sách người dùng</h3>
                        <button className="auth-btn" style={{ margin: 0, padding: "8px 16px", whiteSpace: "nowrap" }} onClick={openCreateModal}>+ Thêm tài khoản</button>
                    </div>
                    <div className="table-responsive">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Email</th>
                                    <th>Vai trò</th>
                                    <th>Thao tác</th>
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
                                        <td>
                                            {u.id !== user.id && (
                                                <div style={{ display: "flex", gap: "8px" }}>
                                                    <button onClick={() => openEditModal(u)} className="admin-action-btn edit">Sửa</button>
                                                    <button onClick={() => handleDelete(u.id)} className="admin-action-btn delete">Xóa</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center" }}>Không có người dùng nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <StatsDashboard />
            )}

            {isModalOpen && (
                <div className="admin-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="admin-modal" onClick={e => e.stopPropagation()}>
                        <h3>{editingUser ? "Sửa tài khoản" : "Tạo tài khoản mới"}</h3>
                        <form onSubmit={handleModalSubmit} className="auth-form" style={{ marginTop: "16px" }}>
                            <div className="auth-field">
                                <label>Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="auth-field">
                                <label>Mật khẩu {editingUser && "(Để trống nếu không muốn đổi)"}</label>
                                <input
                                    type="password"
                                    required={!editingUser}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                            <div className="auth-field">
                                <label>Vai trò</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    style={{
                                        padding: "12px 16px",
                                        borderRadius: "10px",
                                        border: "1.5px solid var(--border)",
                                        color: "var(--text-primary)",
                                        outline: "none"
                                    }}
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="auth-btn" style={{ flex: 1, background: "var(--surface)", border: "1px solid var(--border)" }}>Hủy</button>
                                <button type="submit" disabled={submitting} className="auth-btn" style={{ flex: 1 }}>{submitting ? "Đang xử lý..." : "Lưu"}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
