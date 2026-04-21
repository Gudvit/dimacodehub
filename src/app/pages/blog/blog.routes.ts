import { Routes } from '@angular/router';
import { BlogPageComponent } from './blog-page.component';
import { BlogPostPageComponent } from './components/blog-post-page/blog-post-page.component';

export const BLOG_ROUTES: Routes = [
  { path: '', component: BlogPageComponent },
  { path: ':slug', component: BlogPostPageComponent },
];
