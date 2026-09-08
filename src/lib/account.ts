/*
  Constants and types for pausing and deleting an account.

  These live here rather than beside the actions because a "use server" file
  may only export async functions. Exporting a plain const from one does not
  merely fail for that const — Next rejects the entire module, and every
  action in it disappears with the unhelpful message "the module has no
  exports at all".
*/

/** How long a deleted account can still be brought back. */
export const GRACE_DAYS = 30;

export interface AccountState {
  error?: string;
  success?: string;
}
