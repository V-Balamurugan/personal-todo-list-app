export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous?: boolean;
}

export interface AuthState {
  user: AppUser | null;
  loading: boolean;
  isDemoMode: boolean;
  error: string | null;
}
