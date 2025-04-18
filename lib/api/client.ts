import createFetchClient from 'openapi-fetch'
import { paths } from './schema'


// Use server URL for server-side calls if available, otherwise fallback to public URL
export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL

export const fetchClient = createFetchClient<paths>({
  baseUrl: API_BASE_URL,
})
