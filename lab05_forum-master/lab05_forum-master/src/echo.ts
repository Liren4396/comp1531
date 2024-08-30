/**
 * This file contains the logic of the route `/echo/echo`
 * @module echo
 */

export function echo(message: string) {
  if (message === 'echo') {
    return { error: "cannot echo 'echo'!" };
  }
  //console.log("message:", message);
  return {
    message,
  };
}
