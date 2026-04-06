import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page.component';
import { AboutPageComponent } from './pages/about/about-page.component';
import { ContactsPageComponent } from './pages/contacts/contacts-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'about',
    component: AboutPageComponent,
  },
  {
    path: 'contacts',
    component: ContactsPageComponent,
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
