import { User } from "./users";

export interface ClientTrainer {
  id: number;
  trainer: User;
  client: User;
}