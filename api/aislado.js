export default function handler(req, res) {
  res.status(200).json({ status: 'ok', msg: 'aislado ES module' });
}
