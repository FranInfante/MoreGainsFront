import { Workout } from './workout';
import { Exercise } from './exercise';

export interface WorkoutExercise {
    id: number;
    workout: Workout;
    exerciseName: string;
    reps: number;
    sets: number;
    weight: number;
}
