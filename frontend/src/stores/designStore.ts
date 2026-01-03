import { create } from 'zustand';
import type { Design, BoxTemplate } from '../types/design.types';

interface DesignState {
  // Current design being worked on
  currentDesign: Design | null;

  // Selected box template
  selectedBox: BoxTemplate | null;

  // List of all designs
  designs: Design[];

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentDesign: (design: Design | null) => void;
  setSelectedBox: (box: BoxTemplate | null) => void;
  setDesigns: (designs: Design[]) => void;
  addDesign: (design: Design) => void;
  updateDesign: (id: string, updates: Partial<Design>) => void;
  removeDesign: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  currentDesign: null,
  selectedBox: null,
  designs: [],
  isLoading: false,
  error: null,
};

export const useDesignStore = create<DesignState>((set) => ({
  ...initialState,

  setCurrentDesign: (design) =>
    set({ currentDesign: design }),

  setSelectedBox: (box) =>
    set({ selectedBox: box }),

  setDesigns: (designs) =>
    set({ designs }),

  addDesign: (design) =>
    set((state) => ({
      designs: [design, ...state.designs]
    })),

  updateDesign: (id, updates) =>
    set((state) => ({
      designs: state.designs.map((design) =>
        design.id === id ? { ...design, ...updates } : design
      ),
      currentDesign:
        state.currentDesign?.id === id
          ? { ...state.currentDesign, ...updates }
          : state.currentDesign,
    })),

  removeDesign: (id) =>
    set((state) => ({
      designs: state.designs.filter((design) => design.id !== id),
      currentDesign:
        state.currentDesign?.id === id ? null : state.currentDesign,
    })),

  setLoading: (isLoading) =>
    set({ isLoading }),

  setError: (error) =>
    set({ error }),

  reset: () =>
    set(initialState),
}));
