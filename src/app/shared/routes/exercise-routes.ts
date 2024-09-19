import { environment } from "../../../environments/environment";

export const EXERCISES_API_URL = environment.endpointUrl + 'exercises';
export const BASE = environment.base;

export const EXERCISES_ROUTES = {
  list: (userId: number) => `${EXERCISES_API_URL}?userId=${userId}`,
  createOrCheck: () => `${EXERCISES_API_URL}/check-and-create`,
  muscleGroups: () => `/muscle-groups`,
};
