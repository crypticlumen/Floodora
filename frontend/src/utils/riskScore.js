export function calculateRisk(drain) {
  const water = Number(drain.waterLevel ?? 0);
  const rainfall = Number(drain.rainfall ?? 0);
  const flow = Number(drain.flowRate ?? 0);
  const baseline = Number(drain.normalFlow ?? 30);
  const rise = Number(drain.riseRate ?? 0);
  const flowReduction = baseline > 0 ? Math.max(0, (baseline - flow) / baseline) : 0;
  const score = Math.min(100, Math.round(
    water * 0.52 +
    Math.min(rainfall / 40, 1) * 15 +
    flowReduction * 18 +
    Math.min(rise / 4, 1) * 15
  ));
  const risk = score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low';
  const reasons = [];
  if (water >= 80) reasons.push('Water level has exceeded the configured 80% warning threshold.');
  else if (water >= 60) reasons.push('Water level is elevated and needs observation.');
  if (flowReduction >= 0.35) reasons.push('Flow is notably below its illustrative normal rate; a blockage is possible.');
  if (rainfall >= 20) reasons.push('Heavy rainfall may increase overflow risk.');
  if (rise >= 2) reasons.push('Water level is rising rapidly.');
  if (!reasons.length) reasons.push('Current simulated readings are within the lower-risk range.');
  const action = risk === 'High'
    ? 'Prioritize an on-site inspection. Check for debris or blockage and arrange drain clearing if an obstruction is confirmed.'
    : risk === 'Medium'
      ? 'Schedule a priority inspection and monitor water level and flow for further changes.'
      : 'Continue routine monitoring and include the drain in its regular inspection cycle.';
  return { risk, riskScore: score, reasons, action };
}
