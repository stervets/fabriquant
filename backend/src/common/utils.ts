import { randomBytes } from 'crypto';

export function genId(size: number = 32){
  return randomBytes(size).toString('hex');
}

export const timeout = (delay: number = 0) => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}