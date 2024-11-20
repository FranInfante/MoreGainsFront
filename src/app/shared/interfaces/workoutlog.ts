export interface WorkoutLog {
    id: number;
    userId: number;
    workoutId: number;
    date: string;
    exercises: WorkoutLogExercise[];
    editing: boolean;
  }
  
  export interface WorkoutLogExercise {
    id: number;
  exerciseId: number;
  exerciseName: string;
  sets: SetDetails[];
  workoutLogId: number;
  notes?: string; 
  exerciseOrder: number;
}
  
  export interface SetDetails {
    set: number;
    reps: number;
    weight: number;
  }