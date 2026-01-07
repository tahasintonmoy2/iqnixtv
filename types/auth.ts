export interface User {
  id: string;
  email: string;
  image: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
  role?: "USER" | "ADMIN";
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
