export const countdownTimer = (
  interval: number,
  countRemaining: number,
  onInterval: (count: number) => void,
  onEnd: () => Promise<void>
): NodeJS.Timer => {
  onInterval(countRemaining);
  countRemaining--;
  const intervalId = setInterval(async () => {
    if (countRemaining > 0) {
      onInterval(countRemaining);
      countRemaining--;
    } else {
      clearInterval(intervalId);
      await onEnd();
    }
  }, interval);

  return intervalId;
};
