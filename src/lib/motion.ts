// Every transition in N Space is ≤ 0.3s with an ease-out curve.
export const t = { duration: 0.26, ease: "easeOut" } as const;
export const tFast = { duration: 0.16, ease: "easeOut" } as const;
export const tMax = { duration: 0.3, ease: "easeOut" } as const;

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: t,
};
