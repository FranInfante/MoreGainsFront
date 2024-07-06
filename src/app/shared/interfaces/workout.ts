import { User } from "./users";

export interface Workout {
  id: number;
  users: User;
  date: string; 
  name: string;
  description: string;
  isAvailable: boolean;
}