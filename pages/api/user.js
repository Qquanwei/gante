// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '500kb'
    }
  }
}
export default function handler(req, res) {
  res.status(200).json({ name: 'John Doe' })
}
