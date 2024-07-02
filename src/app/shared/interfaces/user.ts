import { PrivacySetting } from "./EnumPrivacySetting";

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  photoUrl?: string;
  bio?: string;
  fitnessGoals?: string;
  isTrainer: boolean;
  isAvailable: boolean;
  privacySetting: PrivacySetting;
}
