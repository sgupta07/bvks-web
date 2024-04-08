import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFireMessagingModule } from "@angular/fire/messaging";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { TuiCurrencyPipeModule } from "@taiga-ui/addon-commerce";
import {
  TuiButtonModule,
  TuiDataListModule,
  TuiDialogModule,
  TuiDropdownModule,
  TuiHintModule,
  TuiLinkModule,
  TuiLoaderModule,
  TuiNotificationModule,
  TuiNotificationsModule,
  TuiRootModule,
  TuiScrollbarModule,
  TuiSvgModule,
  TuiTextfieldControllerModule,
  TuiTooltipModule,
} from "@taiga-ui/core";
import {
  TuiBadgeModule,
  TuiCheckboxModule,
  TuiDataListWrapperModule,
  TuiInputModule,
  TuiInputNumberModule,
  TuiInputPhoneInternationalModule,
  TuiPaginationModule,
  TuiRadioModule,
  TuiSelectModule,
  TuiTextAreaModule,
  TuiToggleModule,
} from "@taiga-ui/kit";
import { ToastrModule } from "ngx-toastr";
import { StorageModule } from "src/libs/storage/src";
import { environment } from "../environments/environment";
// import { TuiTableModule } from "@taiga-ui/addon-table";

import { AppRoutingModule } from "./app-routing.module";

import { AppComponent } from "./app.component";

import { VjsPlayerComponent } from "./components/vjs-player/vjs-player.component";

import { AudioplayerComponent } from "./components/audioplayer/audioplayer.component";
import { DownloadProgressComponent } from "./components/download-progress-popup/download-progress.component";
import { FilterVariantComponent } from "./components/filter/filter-variant/filter-variant.component";
import { FilterComponent } from "./components/filter/filter.component";
import { GoToDownloadsComponent } from "./components/go-to-downloads/go-to-downloads.component";
import { HeaderComponent } from "./components/header/header.component";
import { LectureInfoComponent } from "./components/lecture-info/lecture-info.component";
import { LecturePostComponent } from "./components/lecture-post/lecture-post.component";
import { ProgressBarComponent } from "./components/progress-bar/progress-bar.component";
import { SearchComponent } from "./components/search/search.component";
import { SidebarComponent } from "./components/sidebar/sidebar.component";
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
import { LecturesComponent } from "./views/dashboard/lectures/lectures.component";
import { TopLecturesComponent } from "./views/dashboard/top-lectures/top-lectures.component";
import { LectureComponent } from "./views/lecture/lecture.component";
import { LoginPageComponent } from "./views/login-page/login-page.component";
import { MobileComponent } from "./views/mobile/mobile.component";
import { PlaylistsComponent } from "./views/playlists/playlists.component";
import { PlaylistCheckboxComponent } from "./views/playlists/popups/add-to-playlist/playlist-checkbox/playlist-checkbox.component";
import { RegisterPageComponent } from "./views/register-page/register-page.component";
import { RestorePageComponent } from "./views/restore-page/restore-page.component";
import { SettingsComponent } from "./views/settings/settings.component";
import { StatisticsComponent } from "./views/statistics/statistics.component";

import { PaginationDirective } from "./directives/pagination.directive";
import { CreatePlaylistComponent } from "./views/playlists/popups/create-playlist/create-playlist.component";

import {
  TuiCheckboxLabeledModule,
  TuiInputDateRangeModule,
} from "@taiga-ui/kit";
import { FileSaverModule } from "ngx-filesaver";
import { AdminHeader } from "./components/admin/admin-header/admin-header.component";
import { EditTicketItemComponent } from "./components/admin/edit-ticket-item/edit-ticket-item.component";
import { CustomStatisticsPeriodComponent } from "./components/custom-statistics-period/custom-statistics-period.component";
import { NotificationComponent } from "./components/notification/notification.component";
import { PlaylistPostComponent } from "./components/playlist-post/playlist-post.component";
import { SearchTextItemComponent } from "./components/search-text-item/search-text-item.component";
import { StatisticsPeriodComponent } from "./components/statistics-period/statistics-period.component";
import { HighlightDirective } from "./directives/highlight.directive";
import { ObserveVisibilityDirective } from "./directives/observe-visibility.directive";
import { adminTokenInterceptorProviders } from "./interceptors/admin-token.interceptor";
import { FilterByResourcesPipe } from "./pipes/filter-by-resources.pipe";
import { LectureCountPipe } from "./pipes/lecture-count.pipe";
import { LectureDatePipe } from "./pipes/lecture-date.pipe";
import { LectureProgressPipe } from "./pipes/lecture-progress.pipe";
import { LecturesSortPipe } from "./pipes/lectures-sort.pipe";
import { SearchFilterPipe } from "./pipes/search-filter.pipe";
import { TimePipe } from "./pipes/time.pipe";
import { AdminEditPageComponent } from "./views/admin/admin-edit-page/admin-edit-page.component";
import { AdminEditsComponent } from "./views/admin/admin-edits/admin-edits.component";
import { AdminLoginComponent } from "./views/admin/admin-login/admin-login.component";
import { AdminTranscriptionCreateComponent } from "./views/admin/admin-transcription-create/admin-transcription-create.component";
import { AdminComponent } from "./views/admin/admin.component";
import { ThankYouPopupComponent } from "./views/dashboard/donate-page/thank-you-popup/thank-you-popup.component";
import { HowSearchComponent } from "./views/dashboard/how-search/how-search.component";
import { TextComponent } from "./views/dashboard/text/text.component";
import { LectureTranscriptionComponent } from "./views/lecture/lecture-transcription/lecture-transcription.component";
import { EditPopupComponent } from "./views/playlist/edit-popup/edit-popup.component";
import { PlaylistComponent } from "./views/playlist/playlist.component";
import { AddToPlaylistComponent } from "./views/playlists/popups/add-to-playlist/add-to-playlist.component";
import { SearchPlaylistsComponent } from "./views/search-playlists/search-playlists.component";

@NgModule({
  declarations: [
    AppComponent,
    VjsPlayerComponent,
    SearchTextItemComponent,
    LoginPageComponent,
    DashboardComponent,
    PlaylistsComponent,
    DownloadsComponent,
    FavoritesComponent,
    StatisticsComponent,
    SettingsComponent,
    LecturesComponent,
    LectureComponent,
    RestorePageComponent,
    HeaderComponent,
    SearchComponent,
    TimePipe,
    SearchFilterPipe,
    RegisterPageComponent,
    LecturesSortPipe,
    SidebarComponent,
    MobileComponent,
    TopLecturesComponent,
    TextComponent,
    HowSearchComponent,
    CategoriesComponent,
    LectureTranscriptionComponent,
    LecturePostComponent,
    AboutComponent,
    BhaktiComponent,
    SrilaComponent,
    LeadersComponent,
    HistoryPageComponent,
    FilterComponent,
    FilterVariantComponent,
    NotificationComponent,
    DonatePageComponent,
    PaginationDirective,
    HighlightDirective,
    LectureProgressPipe,
    LectureCountPipe,
    LectureDatePipe,
    FilterByResourcesPipe,
    AudioplayerComponent,
    GoToDownloadsComponent,
    CreatePlaylistComponent,
    LectureInfoComponent,
    DownloadProgressComponent,
    ProgressBarComponent,
    PlaylistPostComponent,
    AddToPlaylistComponent,
    PlaylistCheckboxComponent,
    SearchPlaylistsComponent,
    PlaylistComponent,
    EditPopupComponent,
    StatisticsPeriodComponent,
    CustomStatisticsPeriodComponent,
    ThankYouPopupComponent,
    AdminComponent,
    AdminLoginComponent,
    AdminTranscriptionCreateComponent,
    AdminEditsComponent,
    AdminHeader,
    EditTicketItemComponent,
    ObserveVisibilityDirective,
    AdminEditPageComponent,
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: "serverApp" }),
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    TuiNotificationsModule,
    StorageModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireMessagingModule,
    TuiRootModule,
    TuiButtonModule,
    TuiInputModule,
    TuiLinkModule,
    TuiSelectModule,
    TuiInputNumberModule,
    TuiDataListModule,
    TuiRadioModule,
    TuiCurrencyPipeModule,
    TuiSvgModule,
    TuiCheckboxModule,
    TuiDialogModule,
    TuiHintModule,
    TuiInputPhoneInternationalModule,
    TuiScrollbarModule,
    TuiLoaderModule,
    TuiBadgeModule,
    TuiDataListWrapperModule,
    TuiTextfieldControllerModule,
    TuiDropdownModule,
    TuiSvgModule,
    TuiDialogModule,
    TuiToggleModule,
    // TuiTableModule,
    TuiTooltipModule,
    TuiHintModule,
    FileSaverModule,
    TuiTextAreaModule,
    TuiToggleModule,
    TuiNotificationModule,
    TuiCheckboxModule,
    TuiCheckboxLabeledModule,
    TuiInputDateRangeModule,
    TuiPaginationModule,
    ToastrModule.forRoot(),
  ],
  providers: [adminTokenInterceptorProviders],
  bootstrap: [AppComponent],
})
export class AppModule {}
