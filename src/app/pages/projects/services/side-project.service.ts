import { Injectable, isDevMode } from "@angular/core";
import { SIDE_PROJECTS } from "../side-projects";
import { SideProject } from "../models/side-project.model";

@Injectable({ providedIn: "root" })
export class SideProjectService {
  // A production build never sees a draft.
  private readonly projects = SIDE_PROJECTS.filter((project) => !project.draft || isDevMode());

  getAll(): readonly SideProject[] {
    return this.projects;
  }
}
