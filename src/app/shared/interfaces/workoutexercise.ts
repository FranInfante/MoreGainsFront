import { Workout } from './workout';

export interface WorkoutExercise {
    id?: number;
    exerciseName: string;
    reps: number;
    sets: number;
    weight: number;
}
