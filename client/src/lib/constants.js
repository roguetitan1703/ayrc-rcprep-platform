// Centralized client constants
export const QUESTION_COUNT = 4
export const TEST_DURATION_SECONDS = 8 * 60 // TODO: confirm spec / externalize via env if needed
export const LOCAL_PROGRESS_KEY = (rcId, mode = 'test') => `arc_progress_${rcId}_${mode}`
