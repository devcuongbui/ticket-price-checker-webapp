import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

// --- MOCK DATA ---
const MOVIE_STATS = [
    { name: 'Đào, Phở và Piano', views: 12500 },
    { name: 'Mai', views: 8400 },
    { name: 'Kung Fu Panda 4', views: 5200 },
    { name: 'Dune: Hành Tinh Cát 2', views: 3100 },
    { name: 'Quỷ Tư Tế', views: 1500 }
];

const CINEMA_STATS = [
    { name: 'CGV Aeon Mall Hải Phòng', views: 15000 },
    { name: 'Lotte Cinema Hải Phòng', views: 8000 },
    { name: 'Galaxy Nguyễn Kim', views: 5200 },
    { name: 'BHD Star Hải Phòng', views: 2500 }
];

const PAYMENT_STATS = [
    { name: 'ZaloPay', value: 45 },
    { name: 'MoMo', value: 35 },
    { name: 'VNPay', value: 15 },
    { name: 'Visa/MasterCard', value: 5 }
];

const COLORS = ['#53d8fb', '#e94560', '#a855f7', '#facc15'];

export default function StatsDashboard() {
    return (
        <div className="stats-dashboard">
            <div className="stats-grid">
                {/* Biểu đồ số lượt xem theo Phim */}
                <div className="stats-card">
                    <h4>🔥 Phim đang hot (Lượt xem/đặt vé)</h4>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={MOVIE_STATS} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis type="number" stroke="var(--text-secondary)" />
                                <YAxis dataKey="name" type="category" width={120} stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: '#fff' }} />
                                <Bar dataKey="views" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Biểu đồ Rạp chiếu */}
                <div className="stats-card">
                    <h4>🍿 Rạp được chọn nhiều nhất</h4>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={CINEMA_STATS} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                                <YAxis stroke="var(--text-secondary)" />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: '#fff' }} />
                                <Bar dataKey="views" fill="#53d8fb" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Cổng thanh toán */}
                <div className="stats-card">
                    <h4>💳 Nền tảng thanh toán (%)</h4>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={PAYMENT_STATS}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {PAYMENT_STATS.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
