import { User } from "./users";
import { Workout } from "./workout";

export interface Plan {
  id: number;
  name: string;
  user: User;
  workouts: Workout[];
}