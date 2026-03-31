import { Component } from '@angular/core';
import {
  contactLinks,
  highlights,
  profile,
  projects,
  skills,
  stats,
  timeline,
} from './portfolio.data';
import { buildTagline, summarizeStack, toKebabCase } from './portfolio.utils';

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly profile = profile;
  readonly stats = stats;
  readonly highlights = highlights;
  readonly skills = skills;
  readonly projects = projects;
  readonly timeline = timeline;
  readonly contactLinks = contactLinks;
  readonly tagline = buildTagline(profile.role, profile.focus);
  readonly summarizeStack = summarizeStack;
  readonly toKebabCase = toKebabCase;
}
