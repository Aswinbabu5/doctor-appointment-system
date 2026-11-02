import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/services';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  registerPatient: (data: any) => Promise<User>;
  registerDoctor: (data: any) => Promise<User>;
  refreshUser: () => Promise<void>;
  isPatient: boolean;
  isDoctor: boolean;
  isAdmin: boolean;
  isDoctorApproved: boolean;
  isDoctorPending: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { error: toastError, success: toastSuccess } = useToast();

  const fetchCurrentUser = async () => {
    try {
      if (!localStorage.getItem('token')) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      const userData = await authApi.getMe();
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } 
    catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    } 
    finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const data = await authApi.login({ email, password });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toastSuccess(`Welcome back, ${data.user.username}!`);
      return data.user;
    } 
    catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      toastError(msg);
      throw err;
    }
  };

  const registerPatient = async (data: any): Promise<User> => {
    try {
      const resData = await authApi.registerPatient(data);
      setToken(resData.token);
      setUser(resData.user);
      localStorage.setItem('token', resData.token);
      localStorage.setItem('user', JSON.stringify(resData.user));
      toastSuccess('Registration successful! Welcome to DocCare Connect.');
      return resData.user;
    } 
    catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      toastError(msg);
      throw err;
    }
  };

  const registerDoctor = async (data: any): Promise<User> => {
    try {
      const resData = await authApi.registerDoctor(data);
      setToken(resData.token);
      setUser(resData.user);
      localStorage.setItem('token', resData.token);
      localStorage.setItem('user', JSON.stringify(resData.user));
      toastSuccess('Application submitted! Your profile is pending administrative verification.');
      return resData.user;
    } 
    catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Doctor registration failed.';
      toastError(msg);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const isPatient = user?.role === 'USER';
  const isDoctor = user?.role === 'DOCTOR';
  const isAdmin = user?.role === 'ADMIN';
  const isDoctorApproved = isDoctor && user?.doctorProfile?.approvalStatus === 'APPROVED';
  const isDoctorPending = isDoctor && user?.doctorProfile?.approvalStatus === 'PENDING';
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading: isLoading,
        isLoading,
        isAuthenticated,
        login,
        logout,
        registerPatient,
        registerDoctor,
        refreshUser,
        isPatient,
        isDoctor,
        isAdmin,
        isDoctorApproved,
        isDoctorPending
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
