import { environment } from "../../../environments/environment";

export const USER_API_URL = environment.endpointUrl + 'users';
export const PLAN_API_URL = environment.endpointUrl + 'plans';

export const BASE = environment.base;

export const USER_ROUTES = {
    authenticate:() => `${USER_API_URL}/authenticate`,
    getinfo:() => `${USER_API_URL}/information`,
    list: () => `${USER_API_URL}`,
    get: (id: number) => `${USER_API_URL}/${id}`,
    create: () => `${USER_API_URL}`,
    update: (id: number) => `${USER_API_URL}/${id}`,
    delete: (id: number) => `${USER_API_URL}/${id}`,
    login: () => `${USER_API_URL}/login`,
    uploadProfilePicture: () => `${USER_API_URL}/upload-profile-picture`
  };
