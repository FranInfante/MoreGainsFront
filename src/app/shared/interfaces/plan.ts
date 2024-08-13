import { Workout } from "./workout";

export interface Plan {
  id: number;
  name: string;
  userId: number; 
  workouts: Workout[];
}