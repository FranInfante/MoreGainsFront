import { environment } from "../../../environments/environment";

export const EXERCISES_API_URL = environment.endpointUrl + 'exercises';
export const BASE = environment.base;

export const EXERCISES_ROUTES = {
  list: () => `${EXERCISES_API_URL}`
};
