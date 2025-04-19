import createFetchClient from 'openapi-fetch';
import { paths } from './schema';
import { getUserToken } from '../auth';


export const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const fetchClient = createFetchClient<paths>({
  baseUrl: API_BASE_URL
});

fetchClient.use({
  onRequest: async ({ request, options }) => {
    request.headers.set('Authorization', `Bearer ${await getUserToken()}`);
    return request;
  }
})