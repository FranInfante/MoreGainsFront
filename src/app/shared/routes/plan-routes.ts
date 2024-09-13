import { environment } from "../../../environments/environment";

export const PLAN_API_URL = environment.endpointUrl + 'plans';
export const BASE = environment.base;

export const PLAN_ROUTES = {
  list: () => `${PLAN_API_URL}`,
  create: () => `${PLAN_API_URL}`,
  update: (id: number) => `${PLAN_API_URL}/${id}`,
  delete: (id: number) => `${PLAN_API_URL}/${id}`,
  workouttoplan: (id: number) => `${PLAN_API_URL}/${id}/workouts`,
  byUser: (userId: number) => `${PLAN_API_URL}/user/${userId}`,
  exerciseInWorkout: (planId: number, workoutId: number, exerciseId: number) => 
    `${PLAN_API_URL}/${planId}/workout/${workoutId}/exercise/${exerciseId}`,
  addexerciseInWorkout: (planId: number, workoutId: number) => 
    `${PLAN_API_URL}/${planId}/workouts/${workoutId}/exercise`,
  createWorkoutinPlan: (planId: number) => 
    `${PLAN_API_URL}/${planId}/workouts`,
  reorderworkoutsinplan: (planId: number) => 
    `${PLAN_API_URL}/${planId}/workouts/reorder`,
  updateplanname: (planId: number) => 
    `${PLAN_API_URL}/${planId}/name`

};
