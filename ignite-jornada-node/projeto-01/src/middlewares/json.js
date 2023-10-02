export async function json(req, res) {
  const buffersData = []

  for await (const chunk of req) {
    buffersData.push(chunk)
  }

  try {
    req.body = JSON.parse(Buffer.concat(buffersData).toString())
  } catch {
    req.body = null
  }

  res.setHeader('Content-type', 'appication/json')
}