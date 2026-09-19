import React from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ['#9f4f68', '#607244', '#c59a45', '#8f7fb8'];

export default function AdminCharts({ sideData, checkInData, isEn }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px', height: '260px' }}>
      <div className="admin-row" style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ textAlign: 'center', margin: '10px 0', color: 'var(--rose-deep)' }}>
          {isEn ? "Guest Distribution" : "Misafir Dağılımı"}
        </h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={sideData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} fill="#8884d8" label>
              {sideData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="admin-row" style={{ padding: '10px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ textAlign: 'center', margin: '10px 0', color: 'var(--rose-deep)' }}>
          {isEn ? "Check-in Status" : "Kapı Giriş Durumu"}
        </h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={checkInData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--rose-deep)' }} />
            <YAxis tick={{ fill: 'var(--rose-deep)' }} />
            <Tooltip />
            <Bar dataKey="value" fill="var(--rose-dark)" radius={[6,6,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}