export type EduVerseRole = 'student' | 'teacher';

const ROLE_KEY = 'eduverse-login-role';

export function getEduVerseRole(): EduVerseRole {
  if (typeof window === 'undefined') return 'student';
  return window.localStorage.getItem(ROLE_KEY) === 'teacher' ? 'teacher' : 'student';
}

export function setEduVerseRole(role: EduVerseRole) {
  window.localStorage.setItem(ROLE_KEY, role);
}

export function clearEduVerseRole() {
  window.localStorage.removeItem(ROLE_KEY);
}