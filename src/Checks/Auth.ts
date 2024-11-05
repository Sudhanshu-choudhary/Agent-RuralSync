/* eslint-disable @typescript-eslint/no-explicit-any */
import { AUTH_BASE_URL, AGENT } from "../../constants";
import axiosInstance from "@/lib/axios";
import toast from "react-hot-toast";
import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  user: any | null;
  setAuth: (isLoggedIn: boolean, user: any | null) => void;
  initialise: () => Promise<boolean>;
  login: (loginData: any) => Promise<boolean>;
  register: (registerData: any) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  user: null,

  setAuth: (isLoggedIn: boolean, user: any | null) => {
    set({ isLoggedIn, user });
  },

  initialise: async () => {
    try {
      const res = await axiosInstance.get(AUTH_BASE_URL + "user-detail", {
        withCredentials: true, // Include credentials for cookies
      });

      if (!res.data) {
        set({ isLoggedIn: false, user: null });
        toast.error("Failed to fetch user details. Please log in again.");
        return false;
      }

      set({ isLoggedIn: true, user: res.data });
      return true;
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("An error occurred while loading user details.");
      return false;
    }
  },

  // The login function should authenticate the user
  login: async (loginData) => {
    try {
      const res = await axiosInstance.post(AUTH_BASE_URL + "login", {
        ...loginData,
        role: AGENT,
      }, {
        withCredentials: true, // Include credentials for cookies
      });

      if (!res.data) {
        toast.error("Login failed. Please check your credentials.");
        return false;
      }

      toast.success("Login Successful");

      get().setAuth(true, res.data.user); // Assuming res.data.user contains user info
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login");
      return false;
    }
  },

  // Function to handle user registration
  register: async (registerData) => {
    try {
      const res = await axiosInstance.post(AUTH_BASE_URL + "register", {
        ...registerData,
        role: AGENT,
      }, {
        withCredentials: true, // Include credentials for cookies
      });

      if (!res.data) {
        toast.error("Registration failed. Please try again.");
        return false;
      }

      toast.success("Registered Successfully");
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration");
      return false;
    }
  },

  // Function to log out
  logout: async () => {
    try {
      await axiosInstance.post(AUTH_BASE_URL + "logout", {}, {
        withCredentials: true, // Include credentials for cookies
      });
      set({ isLoggedIn: false, user: null });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout");
    }
  },
}));
