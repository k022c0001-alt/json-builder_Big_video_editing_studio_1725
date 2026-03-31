// ============================================================
// shared/store/project.store.ts
// Zustand + immer store for the Big Video Editing Studio project
// ============================================================

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type {
  Project,
  ProjectMetadata,
  ProjectSettings,
  Track,
  TimelineClip,
  CaptionClip,
} from "../types/project.types";

// ── Default empty project ─────────────────────────────────────────────────

const DEFAULT_PROJECT: Project = {
  schemaVersion: "1.0.0",
  name: "untitled-project",
  version: "0.1.0",
  projectMetadata: {
    title: "Untitled Project",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  settings: {
    width: 1920,
    height: 1080,
    fps: 30,
  },
  resources: {
    styles: {},
  },
  timeline: {
    tracks: [],
  },
};

// ── State shape ───────────────────────────────────────────────────────────

interface ProjectState {
  project: Project;
}

// ── Actions ───────────────────────────────────────────────────────────────

interface ProjectActions {
  /**
   * Load a project from a parsed JSON object.
   * Replaces the current project state entirely.
   */
  loadProject: (projectData: Project) => void;

  /**
   * Update the canvas resolution.
   */
  updateResolution: (width: number, height: number) => void;

  /**
   * Partially update project metadata (title, description, author, etc.).
   */
  updateMetadata: (metadata: Partial<ProjectMetadata>) => void;

  /**
   * Partially update project settings (fps, duration, backgroundColor, etc.).
   */
  updateSettings: (settings: Partial<ProjectSettings>) => void;

  /**
   * Append a new track to the timeline.
   */
  addTrack: (track: Track) => void;

  /**
   * Append a clip to the specified track.
   * Throws if the trackId does not exist.
   */
  addClip: (trackId: string, clip: TimelineClip | CaptionClip) => void;

  /**
   * Return the current project as a plain JSON-serialisable object.
   * Useful for file export.
   */
  exportJSON: () => Project;

  /**
   * Reset the store to the default empty project.
   */
  reset: () => void;
}

// ── Combined store type ───────────────────────────────────────────────────

export type ProjectStore = ProjectState & ProjectActions;

// ── Store implementation ──────────────────────────────────────────────────

export const useProjectStore = create<ProjectStore>()(
  immer((set, get) => ({
    // ── Initial state ──────────────────────────────────────────────────
    project: DEFAULT_PROJECT,

    // ── Actions ────────────────────────────────────────────────────────

    loadProject: (projectData) => {
      set((state) => {
        state.project = projectData;
      });
    },

    updateResolution: (width, height) => {
      set((state) => {
        state.project.settings.width = width;
        state.project.settings.height = height;
        if (state.project.projectMetadata) {
          state.project.projectMetadata.updatedAt = new Date().toISOString();
        }
      });
    },

    updateMetadata: (metadata) => {
      set((state) => {
        state.project.projectMetadata = {
          ...state.project.projectMetadata,
          ...metadata,
          updatedAt: new Date().toISOString(),
        };
      });
    },

    updateSettings: (settings) => {
      set((state) => {
        state.project.settings = {
          ...state.project.settings,
          ...settings,
        };
        if (state.project.projectMetadata) {
          state.project.projectMetadata.updatedAt = new Date().toISOString();
        }
      });
    },

    addTrack: (track) => {
      set((state) => {
        state.project.timeline.tracks.push(track);
        if (state.project.projectMetadata) {
          state.project.projectMetadata.updatedAt = new Date().toISOString();
        }
      });
    },

    addClip: (trackId, clip) => {
      set((state) => {
        const track = state.project.timeline.tracks.find(
          (t) => t.id === trackId
        );
        if (!track) {
          throw new Error(`Track with id "${trackId}" not found.`);
        }
        track.clips.push(clip);
        if (state.project.projectMetadata) {
          state.project.projectMetadata.updatedAt = new Date().toISOString();
        }
      });
    },

    exportJSON: () => {
      // Return a deep copy to prevent external mutations affecting the store
      return JSON.parse(JSON.stringify(get().project)) as Project;
    },

    reset: () => {
      set((state) => {
        state.project = {
          ...DEFAULT_PROJECT,
          projectMetadata: {
            ...DEFAULT_PROJECT.projectMetadata,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
  }))
);
