import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, AreaChart, Area, CartesianGrid, XAxis, YAxis, BarChart, Bar } from 'recharts';

const COLORS = { Low: '#18a879', Medium: '#e8a11b', High: '#dc3545' };
export function RiskChart({ drains }) {
  const data = ['Low', 'Medium', 'High'].map((name) => ({ name, value: drains.filter((d) => d.risk === name).length }));
  return <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={57} outerRadius={82} paddingAngle={4}>{data.map((item) => <Cell key={item.name} fill={COLORS[item.name]} />)}</Pie><Tooltip /><Legend verticalAlign="bottom" /></PieChart></ResponsiveContainer></div>;
}
export function WaterTrend({ data }) {
  return <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><defs><linearGradient id="waterFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1685d1" stopOpacity={0.28} /><stop offset="100%" stopColor="#1685d1" stopOpacity={0.02} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e8edf3" /><XAxis dataKey="time" tick={{ fontSize: 11 }} /><YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} /><Tooltip /><Area type="monotone" dataKey="waterLevel" name="Water level" stroke="#1685d1" fill="url(#waterFill)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div>;
}
export function MaintenanceChart({ tasks }) {
  const data = ['Pending', 'In Progress', 'Completed'].map((status) => ({ status, count: tasks.filter((task) => task.status === status).length }));
  return <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#e8edf3" /><XAxis dataKey="status" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="count" name="Tasks" fill="#1685d1" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}
