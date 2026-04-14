import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page.component';
import { BlogPageComponent } from './pages/blog/blog-page.component';
import { ProjectsPageComponent } from './pages/projects/projects-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'projects',
    component: ProjectsPageComponent,
  },
  {
    path: 'blog',
    component: BlogPageComponent,
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
