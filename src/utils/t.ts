import { dictionary } from '../config/dictionary';

export function t(term: keyof typeof dictionary) {
  return dictionary[term];
}
