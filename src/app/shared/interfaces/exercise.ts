import { MuscleGroup } from "./musclegroup";

export interface Exercise {
    id: number;
    name: string;
    description?: string;
    videoUrl?: string;
    muscleGroup?: MuscleGroup;
    isAvailable: boolean;
    userId?: number;  
}