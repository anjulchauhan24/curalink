import { create } from 'zustand';
import { User, PatientProfile, ResearcherProfile } from '@/types';

interface AuthState {
  user: User | null;
  patientProfile: PatientProfile | null;
  researcherProfile: ResearcherProfile | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setPatientProfile: (profile: PatientProfile | null) => void;
  setResearcherProfile: (profile: ResearcherProfile | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  patientProfile: null,
  researcherProfile: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setPatientProfile: (profile) => set({ patientProfile: profile }),
  setResearcherProfile: (profile) => set({ researcherProfile: profile }),
  logout: () => {
    localStorage.removeItem('authToken');
    set({ 
      user: null, 
      patientProfile: null, 
      researcherProfile: null, 
      isAuthenticated: false 
    });
  },
}));