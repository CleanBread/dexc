import https from 'https'
import axios from 'axios'


const restApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_REST_API_URL,
  httpsAgent: new https.Agent({ rejectUnauthorized: false, keepAlive: true }),
  withCredentials: true,
})

export default restApi
