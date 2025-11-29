import { randomBytes } from 'crypto';
import dayjs from "dayjs";

export function genId(size: number = 32){
  return randomBytes(size).toString('hex');
}

export const timeout = (delay: number = 0) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

export const formatTime = (time: number) => {
    return dayjs(time * 1000).format("DD.MM.YYYY HH:mm");
}

export const formatDate = (time: number) => {
    return dayjs(time * 1000).format("DD.MM.YYYY");
}