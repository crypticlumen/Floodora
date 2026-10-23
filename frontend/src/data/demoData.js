import { calculateRisk } from '../utils/riskScore.js';

const roads = [
  'Main Road', 'Market Road', 'Station Road', 'Park Street', 'River View Road',
  'Civil Lines', 'College Road', 'Lake Avenue', 'Temple Street', 'Ring Road',
  'Garden Road', 'Bus Stand Road', 'Nehru Marg', 'Shanti Path', 'Canal Road',
  'Industrial Road',
];

export function makeInitialDrains() {
  return Array.from({ length: 128 }, (_, index) => {
    const idNum = index + 1;
    const waterLevel = idNum === 14 ? 90 : idNum <= 8 ? 72 + ((idNum * 7) % 25) : 18 + ((idNum * 17) % 57);
    const flowRate = idNum === 14 ? 12 : Math.max(4, 35 - Math.floor(waterLevel / 4) + ((idNum * 3) % 12));
    const rainfall = idNum === 14 ? 28 : ((idNum * 7) % 32);
    const normalFlow = 35;
    const lat = 28.6139 + (Math.sin(idNum * 2.13) * 0.045);
    const lng = 77.2090 + (Math.cos(idNum * 1.71) * 0.055);
    const drain = {
      id: `D-${String(idNum).padStart(3, '0')}`,
      location: idNum === 14 ? 'Main Road' : roads[index % roads.length],
      area: ['Central Zone', 'North Zone', 'Market District', 'Riverside'][index % 4],
      waterLevel,
      flowRate,
      rainfall,
      normalFlow,
      riseRate: idNum % 9 === 0 ? 2.4 : ((idNum % 5) * 0.3),
      blockageStatus: idNum === 14 || idNum === 3 ? 'Suspected' : idNum % 13 === 0 ? 'Possible' : 'Clear',
      lat, lng,
      lastUpdated: new Date(Date.now() - (idNum % 12) * 60000).toISOString(),
      history: Array.from({ length: 8 }, (_, j) => ({
        time: `${String((new Date().getHours() + j - 7 + 24) % 24).padStart(2, '0')}:00`,
        waterLevel: Math.max(5, Math.min(100, waterLevel - (7 - j) * (idNum % 4 === 0 ? 2 : 1) + ((j % 3) - 1))),
      })),
    };
    return { ...drain, ...calculateRisk(drain) };
  });
}

export const initialRainfallData = Array.from({ length: 8 }, (_, i) => ({
  time: `${String((new Date().getHours() + i - 7 + 24) % 24).padStart(2, '0')}:00`,
  rainfall: [4, 7, 5, 12, 18, 11, 24, 16][i],
  waterLevel: [34, 36, 39, 43, 48, 52, 57, 55][i],
}));

export function makeInitialAlerts(drains) {
  const templates = [
    { drainIndex: 13, severity: 'High', reason: 'High water level and reduced flow', title: 'High water level detected' },
    { drainIndex: 2, severity: 'High', reason: 'Water level above warning threshold', title: 'Drain needs urgent inspection' },
    { drainIndex: 8, severity: 'Medium', reason: 'Rapidly rising water level', title: 'Rising water level' },
    { drainIndex: 20, severity: 'Medium', reason: 'Reduced flow; possible blockage', title: 'Flow reduction detected' },
    { drainIndex: 3, severity: 'Medium', reason: 'Possible blockage indicator', title: 'Inspection recommended' },
    { drainIndex: 0, severity: 'Low', reason: 'Routine monitoring reminder', title: 'Routine inspection reminder' },
  ];
  return templates.map((item, i) => {
    const drain = drains[item.drainIndex];
    return {
      id: `ALT-${String(i + 1).padStart(3, '0')}`,
      drainId: drain.id,
      location: drain.location,
      area: drain.area,
      severity: item.severity,
      reason: item.reason,
      title: item.title,
      action: item.severity === 'High' ? 'Prioritize an on-site inspection.' : 'Monitor readings and schedule inspection if needed.',
      status: i === 5 ? 'Acknowledged' : 'Active',
      createdAt: new Date(Date.now() - i * 17 * 60000).toISOString(),
    };
  });
}

export const initialWorkers = ['Aarav Sharma', 'Priya Singh', 'Mohammed Khan', 'Ananya Verma', 'Field Team A'];
export function makeInitialTasks(drains) {
  return [
    { id: 'TASK-001', drainId: 'D-014', location: 'Main Road', title: 'Inspect possible blockage', description: 'Inspect drain and check for debris or obstruction.', priority: 'High', assignedWorker: 'Aarav Sharma', status: 'Pending', createdAt: new Date().toISOString(), dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10), resolutionNote: '' },
    { id: 'TASK-002', drainId: drains[2].id, location: drains[2].location, title: 'Check flow reduction', description: 'Check inlet and flow path; report findings.', priority: 'High', assignedWorker: 'Priya Singh', status: 'In Progress', createdAt: new Date().toISOString(), dueDate: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10), resolutionNote: '' },
    { id: 'TASK-003', drainId: drains[8].id, location: drains[8].location, title: 'Routine inspection', description: 'Routine visual inspection and sensor check.', priority: 'Medium', assignedWorker: 'Field Team A', status: 'Pending', createdAt: new Date().toISOString(), dueDate: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10), resolutionNote: '' },
  ];
}
