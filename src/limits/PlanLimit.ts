export const PlanLimit = {
  plannedAt: {
    minDate: new Date(1900, 0, 1),
  },
  sets: {
    count: {
      min: 1,
    },
    weight: {
      min: 1,
    },
    times: {
      min: 1,
    },
    distances: {
      min: 1,
    },
  },
};
