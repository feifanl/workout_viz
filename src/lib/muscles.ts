export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Core'
  | 'Forearms'
  | 'Cardio'
  | 'Other';

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core',
  'Forearms', 'Cardio', 'Other',
];

/**
 * Static map of common Hevy exercise titles → muscle group, alphabetized.
 * Unmapped (e.g. custom) exercises fall through to 'Other' — expected tech
 * debt, no fuzzy matching by design.
 */
export const EXERCISE_MUSCLE: Record<string, MuscleGroup> = {
  'Ab Wheel': 'Core',
  'Arnold Press (Dumbbell)': 'Shoulders',
  'Bench Press (Barbell)': 'Chest',
  'Bench Press (Dumbbell)': 'Chest',
  'Bench Press (Smith Machine)': 'Chest',
  'Bent Over Row (Barbell)': 'Back',
  'Bent Over Row (Dumbbell)': 'Back',
  'Bicep Curl (Barbell)': 'Biceps',
  'Bicep Curl (Cable)': 'Biceps',
  'Bicep Curl (Dumbbell)': 'Biceps',
  'Bicycle Crunch': 'Core',
  'Bulgarian Split Squat': 'Quads',
  'Cable Crossover': 'Chest',
  'Cable Crunch': 'Core',
  'Cable Curl': 'Biceps',
  'Cable Fly (Cable)': 'Chest',
  'Calf Press (Machine)': 'Calves',
  'Calf Raise (Dumbbell)': 'Calves',
  'Chest Fly (Dumbbell)': 'Chest',
  'Chest Fly (Machine)': 'Chest',
  'Chest Press (Machine)': 'Chest',
  'Chin Up': 'Back',
  'Close Grip Bench Press (Barbell)': 'Triceps',
  'Concentration Curl (Dumbbell)': 'Biceps',
  'Crunch': 'Core',
  'Cycling': 'Cardio',
  'Dead Bug': 'Core',
  'Deadlift (Barbell)': 'Back',
  'Decline Bench Press (Barbell)': 'Chest',
  'Decline Crunch': 'Core',
  'Dip': 'Triceps',
  'Dumbbell Row': 'Back',
  'Elliptical': 'Cardio',
  'EZ Bar Curl': 'Biceps',
  'Face Pull (Cable)': 'Shoulders',
  'Farmers Walk': 'Forearms',
  'Front Raise (Dumbbell)': 'Shoulders',
  'Front Squat (Barbell)': 'Quads',
  'Glute Bridge': 'Glutes',
  'Glute Kickback (Machine)': 'Glutes',
  'Goblet Squat (Dumbbell)': 'Quads',
  'Good Morning (Barbell)': 'Hamstrings',
  'Hack Squat (Machine)': 'Quads',
  'Hammer Curl (Dumbbell)': 'Biceps',
  'Hanging Leg Raise': 'Core',
  'Hip Abduction (Machine)': 'Glutes',
  'Hip Thrust (Barbell)': 'Glutes',
  'Hip Thrust (Machine)': 'Glutes',
  'Incline Bench Press (Barbell)': 'Chest',
  'Incline Bench Press (Dumbbell)': 'Chest',
  'Incline Dumbbell Curl': 'Biceps',
  'Jump Rope': 'Cardio',
  'Kickback (Dumbbell)': 'Triceps',
  'Lat Pulldown (Cable)': 'Back',
  'Lat Pulldown (Machine)': 'Back',
  'Lateral Raise (Cable)': 'Shoulders',
  'Lateral Raise (Dumbbell)': 'Shoulders',
  'Lateral Raise (Machine)': 'Shoulders',
  'Leg Curl (Machine)': 'Hamstrings',
  'Leg Extension (Machine)': 'Quads',
  'Leg Press (Machine)': 'Quads',
  'Leg Raise': 'Core',
  'Lunge (Barbell)': 'Quads',
  'Lunge (Dumbbell)': 'Quads',
  'Lying Leg Curl (Machine)': 'Hamstrings',
  'Machine Row': 'Back',
  'Military Press (Barbell)': 'Shoulders',
  'Mountain Climber': 'Core',
  'Nordic Curl': 'Hamstrings',
  'Overhead Press (Barbell)': 'Shoulders',
  'Overhead Press (Dumbbell)': 'Shoulders',
  'Overhead Triceps Extension (Dumbbell)': 'Triceps',
  'Pec Deck (Machine)': 'Chest',
  'Plank': 'Core',
  'Preacher Curl (Barbell)': 'Biceps',
  'Preacher Curl (Machine)': 'Biceps',
  'Pull Up': 'Back',
  'Pullover (Dumbbell)': 'Back',
  'Push Up': 'Chest',
  'Rack Pull': 'Back',
  'Rear Delt Fly (Dumbbell)': 'Shoulders',
  'Reverse Fly (Machine)': 'Shoulders',
  'Reverse Wrist Curl (Barbell)': 'Forearms',
  'Romanian Deadlift (Barbell)': 'Hamstrings',
  'Romanian Deadlift (Dumbbell)': 'Hamstrings',
  'Rowing (Machine)': 'Cardio',
  'Running': 'Cardio',
  'Russian Twist': 'Core',
  'Seated Cable Row': 'Back',
  'Seated Calf Raise (Machine)': 'Calves',
  'Seated Leg Curl (Machine)': 'Hamstrings',
  'Seated Row (Cable)': 'Back',
  'Seated Row (Machine)': 'Back',
  'Shoulder Press (Dumbbell)': 'Shoulders',
  'Shoulder Press (Machine)': 'Shoulders',
  'Shrug (Barbell)': 'Shoulders',
  'Shrug (Dumbbell)': 'Shoulders',
  'Side Plank': 'Core',
  'Sit Up': 'Core',
  'Skullcrusher (Barbell)': 'Triceps',
  'Squat (Barbell)': 'Quads',
  'Squat (Smith Machine)': 'Quads',
  'Stair Climber': 'Cardio',
  'Standing Calf Raise (Machine)': 'Calves',
  'Step Up': 'Quads',
  'Stiff Leg Deadlift (Barbell)': 'Hamstrings',
  'Straight Arm Pulldown (Cable)': 'Back',
  'Swimming': 'Cardio',
  'T Bar Row': 'Back',
  'Treadmill': 'Cardio',
  'Tricep Rope Pushdown': 'Triceps',
  'Triceps Dip': 'Triceps',
  'Triceps Extension (Cable)': 'Triceps',
  'Triceps Extension (Dumbbell)': 'Triceps',
  'Triceps Pushdown (Cable)': 'Triceps',
  'Upright Row (Barbell)': 'Shoulders',
  'Walking': 'Cardio',
  'Walking Lunge': 'Quads',
  'Wrist Curl (Barbell)': 'Forearms',
  'Wrist Curl (Dumbbell)': 'Forearms',
};

// Case-insensitive lookup, built once from the map above.
const LOOKUP: Record<string, MuscleGroup> = Object.fromEntries(
  Object.entries(EXERCISE_MUSCLE).map(([k, v]) => [k.trim().toLowerCase(), v]),
);

export function muscleFor(exercise: string): MuscleGroup {
  return LOOKUP[exercise.trim().toLowerCase()] ?? 'Other';
}
