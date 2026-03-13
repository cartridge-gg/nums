export const Formatter = {
  time: (time: number) => {
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  },
  short(time: number) {
    const totalSeconds = Math.floor(time / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (days > 0) {
      return `${days.toString()}d`;
    } else if (hours > 0) {
      return `${hours.toString()}h`;
    } else if (minutes > 0) {
      return `${minutes.toString()}m`;
    } else {
      return `${seconds.toString()}s`;
    }
  },
  countdown: (time: number, full: boolean = false) => {
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (seconds > 0 || full) {
      return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
    } else if (minutes > 0) {
      return `${hours.toString().padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m`;
    } else {
      return `${hours.toString().padStart(2, "0")}h`;
    }
  },
};
