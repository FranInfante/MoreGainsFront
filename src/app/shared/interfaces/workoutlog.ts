export interface WorkoutLog {
    id: number;
    userId: number;
    workoutId: number;
    notes: string;
    date: string;
    exercises: WorkoutLogExercise[];
    editing: boolean;
  }
  
  export interface WorkoutLogExercise {
    exerciseId: number;
    id: number;
    sets: SetDetails[];
  }
  
  export interface SetDetails {
    set: number;
    reps: number;
    weight: number;
  }