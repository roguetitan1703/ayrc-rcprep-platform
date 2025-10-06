export const REASON_CODES = {
  MISREAD: {
    label: 'Misread / Skimmed',
    description: 'Rushed reading or skipped a key qualifier in the question or passage',
  },
  INFERENCE_GAP: {
    label: 'Inference Gap',
    description: 'Could not bridge an implicit logical step required by the question',
  },
  VOCAB_AMBIGUITY: {
    label: 'Vocabulary Confusion',
    description: 'Misunderstood a key word or phrase meaning',
  },
  TRAP_ANSWER: {
    label: 'Attractive Distractor',
    description: 'Picked a plausible but unsupported answer choice',
  },
  RUSH_TIMING: {
    label: 'Time Pressure',
    description: 'Decision driven by running out of time',
  },
  ATTENTION_SLIP: {
    label: 'Attention Lapse',
    description: 'Lost focus or got distracted during this question',
  },
  CALCULATION_ERROR: {
    label: 'Logic/Calculation Error',
    description: 'Made an error in reasoning through the answer',
  },
}
