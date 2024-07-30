import { environment } from "../../../environments/environment";

export const USER_API_URL = environment.endpointUrl + 'users';

export const USER_ROUTES = {
    authenticate:() => `${USER_API_URL}/authenticate`,
    getinfo:() => `${USER_API_URL}/information`,
    list: () => `${USER_API_URL}`,
    get: (id: number) => `${USER_API_URL}/${id}`,
    create: () => `${USER_API_URL}`,
    update: (id: number) => `${USER_API_URL}/${id}`,
    delete: (id: number) => `${USER_API_URL}/${id}`,
    login: () => `${USER_API_URL}/login`
  };