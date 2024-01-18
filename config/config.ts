/* SERVER */
export const API_ROUTE = '/api/v1';
export const COOKIE_EXPIRES = 1000 * 60 * (60 * 24) * 1; // (Seconds) * (Hours) * (Days)

/* USER */
export const nameMaxLength = 50;
export const usernameMinLength = 5;
export const usernameMaxLength = 10;
export const userTokenExpiration = 1000 * 60 * 10;
export type userTokenTypeOptions = 'passwordReset' | 'verification';
export type userTokenModeOptions = 'link' | 'short';
export const userTokenMode = 'short';
export const userEditableFields = ['name', 'username'];

/* IMAGES */
export const profilePictureSize = 500;
