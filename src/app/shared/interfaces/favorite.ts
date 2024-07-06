import { User } from './users';
import { Exercise } from './exercise';

export interface Favorite {
    id: number;
    isAvailable: boolean;
    user: User;
    exercise: Exercise;
}
