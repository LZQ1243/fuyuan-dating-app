import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  user_id: string;
  phone: string;
  nickname: string;
  avatar: string;
  gender: number;
  disability_type: string;
  certification_status: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (credentials: { phone: string, password: string }) => Promise<any>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      login: async (credentials: { phone: string, password: string }) => {
        try {
          const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
          });
          const data = await response.json();

          if (data.code === 200) {
            set({ token: data.data.token, user: data.data.user });
          }
          return data;
        } catch (error) {
          console.error('登录失败:', error);
          throw error;
        }
      },

      logout: () => {
        set({ token: null, user: null });
        localStorage.removeItem('token');
      }
    })
  )
);
