/** One balloon of a screen's tour. Its copy lives at `<namespace>:tour.<tourId>.<stepId>.{title,body}`. */
export interface TourStep {
  id: string
  /** `data-tour` value of the element to highlight; omitted for a centered step (the intro). */
  target?: string
}

/** The guided tour of one screen, started by the header's "?" button. */
export interface TourDefinition {
  id: string
  /** react-router pattern of the screen, e.g. `/finance/months/:monthlySummaryId`. */
  path: string
  /** i18next namespace of the module that owns the copy. */
  namespace: string
  steps: TourStep[]
}

/** A box in viewport pixels, as `getBoundingClientRect` gives it. */
export interface TourRect {
  top: number
  left: number
  width: number
  height: number
}

export interface TourSize {
  width: number
  height: number
}
