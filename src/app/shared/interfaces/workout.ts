import { User } from "./users";
import { WorkoutExercise } from "./workoutexercise";

export interface Workout {
  id: number;
  users: User;
  date: string;
  name: string;
  description: string;
  isAvailable: boolean;
  workoutExercises: WorkoutExercise[];
}