/** A failed service call; controllers turn it into a response with serviceFailure(). */
export interface Failure {
  ok: false;
  code: string;
  message: string;
}

export const fail = (code: string, message: string): Failure => ({
  ok: false,
  code,
  message,
});
