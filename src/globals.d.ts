export {};

declare global {

  type ParametersExceptFirst<F> =
  F extends (arg0: any, ...rest: infer R) => any ? R : never;

  type KeystrokeUsingOption = 'command down' | 'control down' | 'option down' | 'shift down' | ('command down' | 'control down' | 'option down' | 'shift down')[];

  function Application(...args: any[]): any;
  function delay(duration: number): void;
}
