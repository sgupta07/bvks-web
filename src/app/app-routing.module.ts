import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MobileGuard } from "./guards/mobile.guard";
import { MobileComponent } from "./views/mobile/mobile.component";
import { PlaylistComponent } from "./views/playlist/playlist.component";

import { AuthGuard } from "./guards/auth.guard";

import { AdminAuthGuard } from "./guards/admin-auth.guard";
import { AdminEditPageComponent } from "./views/admin/admin-edit-page/admin-edit-page.component";
import { AdminEditsComponent } from "./views/admin/admin-edits/admin-edits.component";
import { AdminLoginComponent } from "./views/admin/admin-login/admin-login.component";
import { AdminTranscriptionCreateComponent } from "./views/admin/admin-transcription-create/admin-transcription-create.component";
import { AdminComponent } from "./views/admin/admin.component";
import { AboutComponent } from "./views/dashboard/about/about.component";
import { BhaktiComponent } from "./views/dashboard/about/bhakti/bhakti.component";
import { LeadersComponent } from "./views/dashboard/about/leaders/leaders.component";
import { SrilaComponent } from "./views/dashboard/about/srila/srila.component";
import { CategoriesComponent } from "./views/dashboard/categories/categories.component";
import { DashboardComponent } from "./views/dashboard/dashboard.component";
import { DonatePageComponent } from "./views/dashboard/donate-page/donate-page.component";
import { DownloadsComponent } from "./views/dashboard/downloads/downloads.component";
import { FavoritesComponent } from "./views/dashboard/favorites/favorites.component";
import { HistoryPageComponent } from "./views/dashboard/history-page/history-page.component";
import { HowSearchComponent } from "./views/dashboard/how-search/how-search.component";
import { TextComponent } from "./views/dashboard/text/text.component";
import { TopLecturesComponent } from "./views/dashboard/top-lectures/top-lectures.component";
import { LectureTranscriptionComponent } from "./views/lecture/lecture-transcription/lecture-transcription.component";
import { LectureComponent } from "./views/lecture/lecture.component";
import { LoginPageComponent } from "./views/login-page/login-page.component";
import { PlaylistsComponent } from "./views/playlists/playlists.component";
import { RegisterPageComponent } from "./views/register-page/register-page.component";
import { RestorePageComponent } from "./views/restore-page/restore-page.component";
import { SettingsComponent } from "./views/settings/settings.component";
import { StatisticsComponent } from "./views/statistics/statistics.component";

const downloadsChildrens = [
  { path: "", redirectTo: "categories" },
  { path: "top", component: TopLecturesComponent },
  { path: "text", component: TextComponent },
  { path: "text/how", component: HowSearchComponent },
  { path: "categories", component: CategoriesComponent },
  {
    path: "donate",
    component: DonatePageComponent,
  },
  { path: "favorites", component: FavoritesComponent },
  { path: "history", component: HistoryPageComponent },
  { path: "playlists", component: PlaylistsComponent },
  { path: "playlists/:listID", component: PlaylistComponent },
  { path: "downloads", component: DownloadsComponent },
  { path: "settings", component: SettingsComponent },
  { path: "statistics", component: StatisticsComponent },
  {
    path: "about",
    component: AboutComponent,
    children: [
      {
        path: "",
        redirectTo: "leaders",
      },
      {
        path: "srila",
        component: SrilaComponent,
      },
      {
        path: "bhakti",
        component: BhaktiComponent,
      },
      {
        path: "leaders",
        component: LeadersComponent,
      },
    ],
  },
];

const adminChildren = [
  { path: "", redirectTo: "edits", pathMatch: "full" },
  { path: "transcription", component: AdminTranscriptionCreateComponent },
  { path: "edits", component: AdminEditsComponent },
  { path: "edits/:id", component: AdminEditPageComponent },
];

const routes: Routes = [
  { path: "", redirectTo: "dashboard/categories", pathMatch: "full" },
  { path: "login", component: LoginPageComponent, canActivate: [MobileGuard] },
  {
    path: "register",
    component: RegisterPageComponent,
    canActivate: [MobileGuard],
  },
  {
    path: "mobile",
    component: MobileComponent,
  },
  {
    path: "restore",
    component: RestorePageComponent,
    canActivate: [MobileGuard],
  },
  {
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [AuthGuard, MobileGuard],
    children: downloadsChildrens,
  },
  { path: "top", component: TopLecturesComponent },
  { path: "playlists", component: PlaylistsComponent },
  {
    path: "lecture/:id",
    component: LectureComponent,
    canActivate: [AuthGuard],
  },
  {
    path: "lecture/:id/transcription",
    component: LectureTranscriptionComponent,
    canActivate: [AuthGuard],
  },
  { path: "top-lecturtes", component: DashboardComponent },
  { path: "favorites", component: FavoritesComponent },
  { path: "statistics", component: StatisticsComponent },
  { path: "settings", component: SettingsComponent },
  {
    path: "admin",
    component: AdminComponent,
    children: adminChildren,
    canActivate: [AdminAuthGuard],
  },
  { path: "admin/login", component: AdminLoginComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: "enabled",
      scrollPositionRestoration: "enabled",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
