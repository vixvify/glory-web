export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface RegisterUser {
  name: string;
  email: string;
  password: string;
}

export interface LoginUser {
  email: string;
  password: string;
}
