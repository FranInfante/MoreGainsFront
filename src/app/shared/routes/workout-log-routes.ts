import { environment } from '../../../environments/environment';

export const WORKOUT_LOGS_API_URL = environment.endpointUrl + 'workout-log';
export const WORKOUT_LOG_EXERCISES_API_URL =
  environment.endpointUrl + 'workout-log-exercises';

export const WORKOUT_LOG_ROUTES = {
  list: () => `${WORKOUT_LOGS_API_URL}`,
  create: () => `${WORKOUT_LOGS_API_URL}`,
  update: (id: number) => `${WORKOUT_LOGS_API_URL}/${id}`,
  delete: (id: number) => `${WORKOUT_LOGS_API_URL}/${id}`,
  byUser: (userId: number) => `${WORKOUT_LOGS_API_URL}/user/${userId}`,
  getById: (id: number) => `${WORKOUT_LOGS_API_URL}/${id}`,
  exercisesByWorkoutLogId: (workoutLogId: number) =>
    `${WORKOUT_LOG_EXERCISES_API_URL}/${workoutLogId}`,
  createExercise: () => `${WORKOUT_LOG_EXERCISES_API_URL}`,
  updateExercise: (exerciseId: number) =>
    `${WORKOUT_LOG_EXERCISES_API_URL}/${exerciseId}`,
  deleteExercise: (exerciseId: number) =>
    `${WORKOUT_LOG_EXERCISES_API_URL}/${exerciseId}`,
  exerciseById: (exerciseId: number) =>
    `${WORKOUT_LOGS_API_URL}/exercise/${exerciseId}`,
  deleteSet: (workoutLogId: number, exerciseId: number, setNumber: number) =>
    `${WORKOUT_LOG_EXERCISES_API_URL}/workout-log/${workoutLogId}/exercise/${exerciseId}/set/${setNumber}`
};
