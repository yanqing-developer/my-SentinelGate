export function healthCheck(req, res) {
  return res.status(200).json({
    status: "ok",
    service: "sentinelgate-cloud-platform",
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString()
  });
}
