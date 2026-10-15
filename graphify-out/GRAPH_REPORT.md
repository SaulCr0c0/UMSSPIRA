# Graph Report - UMSSPIRA  (2026-10-14)

## Corpus Check
- 624 files · ~374,859 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 21 file(s) not represented in the graph (top: .css 8, (none) 6, .example 4)

## Summary
- 3069 nodes · 6892 edges · 155 communities (121 shown, 34 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 135 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `698e4368`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- documents.service.ts
- document-upload-step.tsx
- graduate-csv.service.spec.ts
- companies/page.tsx
- getSupabaseClient
- MentorshipInterestsService
- profile-records-manager.tsx
- mentor-interests-api.ts
- perfil.repository.ts
- src/index.ts
- cn
- dev-token.js
- useProfileStore
- graduates-report-export.tsx
- @testing-library/jest-dom
- clearAccessToken
- perfil-resumen.service.ts
- mentorship.service.ts
- mentor-areas-page.tsx
- graduate-affinity-view.tsx
- class-validator
- reports/page.tsx
- observe-dialog.tsx
- companies.controller.ts
- CreateEventDto
- mentor-profile-info-page.tsx
- affinity-service.ts
- mentorship-availability.service.ts
- api/package.json
- mail.service.ts
- profile-data.ts
- auth.module.ts
- RegistrationsRepository
- afinidad/page.tsx
- MentorshipController
- web/package.json
- lucide-react
- pdf-preview-modal.tsx
- verify-email.dto.ts
- perfil-registros.controller.ts
- registration-form.tsx
- Button
- event-form.tsx
- events-ui.tsx
- MentorshipService
- register-sw.ts
- verify-email-form.tsx
- Proyecto Fexco (nombre provisional — ajustar)
- EmailVerificationRepository
- CreateReviewDto
- ApplicationsService
- compilerOptions
- @testing-library/react
- package.json
- dependencies
- CreateJobPostingDto
- @nestjs/common
- mentorship-api.ts
- affinity-radar.tsx
- formatPercentage
- app.module.ts
- email-verification/services/email-verification.service.ts
- applications-board.service.ts
- devDependencies
- graduates-report.service.spec.ts
- react
- profile-summary.tsx
- use-auth.ts
- GraduatesReportController
- timeline.tsx
- candidate-search.tsx
- compilerOptions
- main.ts
- EventsController
- graduates-report-pdf.builder.ts
- next
- app-sidebar.tsx
- use-registration.ts
- errors/index.ts
- perfil-exportar.controller.spec.ts
- devDependencies
- event-draft-editor.tsx
- route-access.ts
- obtenerTituladoId
- dependencies
- sw.js
- submission-confirmation.tsx
- application-drawer.tsx
- services/reports.service.ts
- query
- supabase.ts
- EventItem
- SubmitRegistrationDto
- registrations.service.ts
- portal/page.tsx
- MailService
- mentorship.module.ts
- mentorship-profile-information.test.cjs
- catalog/page.tsx
- (dashboard)/layout.tsx
- mentorship-interests.e2e.cjs
- scripts
- archivo-respaldo.pipe.spec.ts
- CreateRegistrationDataDto
- RegistrationsService
- graduates-report.controller.spec.ts
- graduates-report.service.ts
- MentorAvailabilityPage
- adminnavbar.tsx
- login-form.tsx
- badge.tsx
- MentorshipAvailabilityController
- CrearFormacionAcademicaDto
- ListApplicationsQueryDto
- logout-button.tsx
- AGENTS.md
- registrations.controller.ts
- progress-steps.tsx
- frontend/services/email-verification.service.ts
- create-registration-data.dto.ts
- RegistrationsController
- applications.repository.spec.ts
- compilerOptions
- DraftAccessRepository
- auth.store.ts
- registration/frontend/store/index.ts
- events-admin.test.tsx
- scripts
- report-alert-modal.tsx
- nest-cli.json
- login/page.tsx
- submitReview
- use-debounced-batch.ts
- shared-types/package.json
- .eslintrc.json
- next.config.mjs
- typescript-eslint
- engines
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `react` - 148 edges
2. `@nestjs/common` - 115 edges
3. `lucide-react` - 84 edges
4. `@testing-library/react` - 67 edges
5. `next` - 60 edges
6. `cn()` - 49 edges
7. `PerfilRepository` - 36 edges
8. `@testing-library/jest-dom` - 30 edges
9. `MentorshipService` - 25 edges
10. `class-validator` - 24 edges

## Surprising Connections (you probably didn't know these)
- `Frontend — `apps/web/src/`` --references--> `cn()`  [INFERRED]
  README.md → apps/web/src/shared/utils/cn.ts
- `Code gotchas` --references--> `UpdateParticipationDto`  [INFERRED]
  AGENTS.md → apps/api/src/modules/mentorship/dto/update-participation.dto.ts
- `Code gotchas` --references--> `MentorState`  [INFERRED]
  AGENTS.md → packages/shared-types/src/mentor.ts
- `Layout` --references--> `MentorshipModule`  [INFERRED]
  AGENTS.md → apps/api/src/modules/mentorship/mentorship.module.ts
- `EventCardProps` --references--> `EventItem`  [EXTRACTED]
  apps/web/src/shared/components/event-card.tsx → packages/shared-types/src/events.ts

## Import Cycles
- None detected.

## Communities (155 total, 34 thin omitted)

### Community 0 - "documents.service.ts"
Cohesion: 0.05
Nodes (33): DEFAULT_DOCUMENTS_BUCKET, DOCUMENT_FILE_FIELD, DOCUMENT_MESSAGES, DOCUMENT_TYPES, MAX_DOCUMENT_SIZE_BYTES, registrationSessionKey(), trim(), UploadDocumentDto (+25 more)

### Community 1 - "document-upload-step.tsx"
Cohesion: 0.05
Nodes (52): DocumentFilePicker(), DocumentFilePickerProps, DocumentPreview(), DocumentPreviewProps, DOCUMENT_TYPE_OPTIONS, DocumentTypeOption, DocumentTypeSelect(), DocumentTypeSelectProps (+44 more)

### Community 2 - "graduate-csv.service.spec.ts"
Cohesion: 0.06
Nodes (22): GetGraduatesQueryDto, GRADUATE_REPORT_DATA_SOURCE, GraduateReportDataSource, GraduateReportFilters, GraduateReportStatus, MockGraduateReportDataSource, CsvHttpResponse, GraduateCsvController (+14 more)

### Community 3 - "companies/page.tsx"
Cohesion: 0.06
Nodes (45): CompanyDetails(), CompanyDetailsProps, CompanyHeader(), CompanyHeaderProps, CompanyLayout(), CompaniesPage(), handleSubmit(), toCompany() (+37 more)

### Community 4 - "getSupabaseClient"
Cohesion: 0.08
Nodes (26): applicationCode(), ApplicationDetail, ApplicationListItem, normalizeStatus(), STATUS_ALIASES, statusVariants(), ApplicationRow, ApplicationsRepository (+18 more)

### Community 5 - "MentorshipInterestsService"
Cohesion: 0.09
Nodes (12): AddInterestsDto, AuthenticatedRequest, MentorshipInterestsController, Area, AreaResumen, InterestCatalogGroup, InterestCatalogItem, MentorArea (+4 more)

### Community 6 - "profile-records-manager.tsx"
Cohesion: 0.09
Nodes (36): ProfileRecordsPage(), DeleteRecordModal(), DeleteRecordModalProps, ERROR_CONTENT, ProfileRecordsManager(), handleConfirmDelete(), ProfileRecordsManagerProps, SECTIONS (+28 more)

### Community 7 - "mentor-interests-api.ts"
Cohesion: 0.09
Nodes (34): PrimaryButton(), Props, SecondaryButton(), MentorInterestsConnected(), getInterests, getProfile, save, state (+26 more)

### Community 8 - "perfil.repository.ts"
Cohesion: 0.10
Nodes (24): CertificacionRespaldoService, upload, ExperienciaLaboralService, BUCKET_RESPALDOS, COLUMNA_FECHA_CREACION, COLUMNA_ID, COLUMNA_TITULADO, COLUMNAS (+16 more)

### Community 9 - "src/index.ts"
Cohesion: 0.09
Nodes (18): LoginDto, AuthGuard, RequestWithUser, CurrentUser, ROLES_KEY, RolesGuard, guardRequiring(), isUserRole() (+10 more)

### Community 10 - "cn"
Cohesion: 0.07
Nodes (34): ActivePanel(), ApprovedChip(), StatusBadge(), styles, ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES, DocumentDropzone(), DocumentDropzoneProps (+26 more)

### Community 11 - "dev-token.js"
Cohesion: 0.07
Nodes (19): ACTIVATION_CODE_LENGTH, ACTIVATION_CODE_TTL_SECONDS, ACTIVATION_REDIS, ActivationModule, ActivationCodeRepository, redisWith(), ActivationCodeService, path (+11 more)

### Community 12 - "useProfileStore"
Cohesion: 0.09
Nodes (28): EditCertificationPage(), EditEducationPage(), EditExperiencePage(), CertificationFormData, DEGREES, EditCertificationFields(), EditCertificationForm(), CertificationName() (+20 more)

### Community 13 - "graduates-report-export.tsx"
Cohesion: 0.10
Nodes (28): ExportMenu(), ExportMenuProps, ExportTriggerControls, GraduatesReportExport(), GraduatesReportExportProps, PdfPreviewModal, EXPORT_TIMEOUT_MS, EXPORTABLE_STATUSES (+20 more)

### Community 14 - "@testing-library/jest-dom"
Cohesion: 0.07
Nodes (24): PerfilPage(), AcordeonPerfil(), BarraProgreso(), BarraProgresoProps, Certificacion, FormularioCertificaciones(), FormularioCertificacionesProps, GRADOS (+16 more)

### Community 15 - "clearAccessToken"
Cohesion: 0.10
Nodes (30): save(), options, statusLabels, successMessages, wait(), API_URL, MentorAreasError, request() (+22 more)

### Community 16 - "perfil-resumen.service.ts"
Cohesion: 0.08
Nodes (19): ExportacionPerfil, fechaISO(), nombreArchivoExportacion(), nombreParaArchivo(), ahora, base, perfil, repositorio() (+11 more)

### Community 17 - "mentorship.service.ts"
Cohesion: 0.07
Nodes (10): globalPipe, UpdateMentorAreasDto, UpdateMentorProfileInformationDto, UpdateParticipationDto, AuthenticatedRequest, Area, MentorAreaItem, MentorAreaLink (+2 more)

### Community 18 - "mentor-areas-page.tsx"
Cohesion: 0.10
Nodes (23): MentorAreasRoute(), MentorProfilePage(), areaIcon(), MentorAreasPage(), loadAreas(), save(), sortedUniqueAreas(), areas (+15 more)

### Community 19 - "graduate-affinity-view.tsx"
Cohesion: 0.10
Nodes (20): AffinitySkeleton(), AffinityTabs(), AffinityTabsProps, GraduateAffinityView(), loadInitialVector(), InspectionAreas, EXPECTED_LABELS, mockPush (+12 more)

### Community 20 - "class-validator"
Cohesion: 0.09
Nodes (9): CrearCertificacionDto, CrearExperienciaLaboralDto, AnioNoFuturo(), FechaNoFutura(), NoAnteriorA(), CrearCertificacionDto, CrearExperienciaLaboralDto, CrearFormacionAcademicaDto (+1 more)

### Community 21 - "reports/page.tsx"
Cohesion: 0.12
Nodes (23): normalizeText(), readReportsListState(), ReportsListState, ReportsPage(), EmptyState(), EmptyStateProps, GraduatesSearch(), GraduatesSearchProps (+15 more)

### Community 22 - "observe-dialog.tsx"
Cohesion: 0.16
Nodes (27): ApproveDialog(), Props, ObserveDialog(), Props, Props, RejectDialog(), btnAccent, btnPrimary (+19 more)

### Community 23 - "companies.controller.ts"
Cohesion: 0.11
Nodes (8): CurrentUser, JwtAuthGuard, CompaniesController, CompaniesModule, CompaniesService, EmpresaRow, ContactResponseDto, HeaderResponseDto

### Community 24 - "CreateEventDto"
Cohesion: 0.09
Nodes (8): CREATE_ALLOWED_STATUSES, CreateEventDto, UpdateDraftEventDto, EventRow, EVENT_STATUS, EventFilters, EventStatus, UpdateDraftEventDto

### Community 25 - "mentor-profile-info-page.tsx"
Cohesion: 0.11
Nodes (20): MentorProfileInfoRoute(), ALLOWED_EXTENSIONS, MentorProfileInfoPage(), handleConfirmDelete(), handleSave(), loadProfile(), mockDelete, mockGet (+12 more)

### Community 26 - "affinity-service.ts"
Cohesion: 0.11
Nodes (20): AFFINITY_ROUTE, AffinityCustomizer(), AREA_ICONS, AREA_LABELS, PROFILE_EDIT_ROUTE, EXPECTED_LABELS, useAffinityCalculation(), UseAffinityCalculationReturn (+12 more)

### Community 27 - "mentorship-availability.service.ts"
Cohesion: 0.17
Nodes (14): UpdateAvailabilityDto, AuthenticatedRequest, byRecency(), compareDesc(), DisponibilidadMentor, isAvailabilityStatus(), latestRowByMentor(), MentorAvailability (+6 more)

### Community 28 - "api/package.json"
Cohesion: 0.07
Nodes (28): eslint, jest, @supabase/supabase-js, @types/jest, @types/node, typescript, @umsspira/shared-types, name (+20 more)

### Community 29 - "mail.service.ts"
Cohesion: 0.10
Nodes (15): MAIL_CONFIG, MAIL_TRANSPORTER, MailConfig, readMailConfig(), REQUIRED_VARIABLES, MailModule, escapeHtml(), HTML_ESCAPES (+7 more)

### Community 30 - "profile-data.ts"
Cohesion: 0.17
Nodes (19): downloadProfile(), DownloadProfileButton(), DownloadProfileButtonProps, BackupStatus, profileHeader, profileTimeline, TimelineSection, buildProfileJson() (+11 more)

### Community 31 - "auth.module.ts"
Cohesion: 0.10
Nodes (9): AuthController, logger, resolveJwtSecret(), AuthService, JwtPayload, JwtStrategy, @nestjs/config, @nestjs/passport (+1 more)

### Community 32 - "RegistrationsRepository"
Cohesion: 0.12
Nodes (11): escapeLike(), MIME_TO_FORMAT, RegistrationsRepository, REJECTED_STATES, baseData, mockedGetClient, SubmitRegistrationData, DUPLICATE_MESSAGES (+3 more)

### Community 33 - "afinidad/page.tsx"
Cohesion: 0.13
Nodes (12): AffinityPage(), AffinitySiteFooter(), AffinitySiteHeader(), AffinitySiteHeaderProps, CandidatesEmptyState(), CandidateEvidenceProps, EvidenceBreakdown(), InstitutionalBanner() (+4 more)

### Community 34 - "MentorshipController"
Cohesion: 0.19
Nodes (3): MentorshipController, MentorAreasState, MentorProfileInformationState

### Community 35 - "web/package.json"
Cohesion: 0.07
Nodes (25): engines, node, eslint, jest, @supabase/supabase-js, @types/jest, @types/node, typescript (+17 more)

### Community 36 - "lucide-react"
Cohesion: 0.16
Nodes (16): MentoriasPage(), ExploreCard(), InactivePanel(), InactivePanelProps, previews, MentorAreasEditor(), Icon, MentorConfiguration() (+8 more)

### Community 37 - "pdf-preview-modal.tsx"
Cohesion: 0.13
Nodes (12): PdfPreviewModal(), PdfPreviewModalProps, PreviewErrorBoundary, PreviewErrorBoundaryProps, PreviewErrorBoundaryState, file, MockDocumentProps, renderModal() (+4 more)

### Community 38 - "verify-email.dto.ts"
Cohesion: 0.11
Nodes (8): ResendCodeDto, CODE_PATTERN, VerifyEmailDto, EmailVerificationController, IssueCodeResultDTO, ResendCodeInput, VerifyEmailInput, VerifyEmailResultDTO

### Community 39 - "perfil-registros.controller.ts"
Cohesion: 0.12
Nodes (8): esSeccion(), DTO_POR_SECCION, PerfilRegistrosController, validador, esFormacionDuplicada(), FormacionComparable, MENSAJE_FORMACION_DUPLICADA, normalizar()

### Community 40 - "registration-form.tsx"
Cohesion: 0.11
Nodes (21): buildYearOptions(), EMPTY_VALUES, EXPEDITION_OPTIONS, FORM_FIELDS, RegistrationForm(), mockedCheckSession, mockedCreateSession, mockedFetchCareers (+13 more)

### Community 41 - "Button"
Cohesion: 0.16
Nodes (19): BoardFilters, EMPTY_FILTERS, RequestsFilters(), RequestsFiltersProps, STATUS_OPTIONS, formatSentDate(), hoursSince(), isOverdue() (+11 more)

### Community 42 - "event-form.tsx"
Cohesion: 0.14
Nodes (19): CreateEventPage(), countValidationGroups(), createInitialState(), EventForm(), EventFormErrors, EventFormProps, EventFormState, EventPreview() (+11 more)

### Community 43 - "events-ui.tsx"
Cohesion: 0.18
Nodes (20): EventDraftsPage(), EventsLayout(), EventsManagementPage(), AdminSection, EventAdminTabs(), EventConfirmDialog(), eventDateFormatter, EventDraftsContent() (+12 more)

### Community 45 - "register-sw.ts"
Cohesion: 0.17
Nodes (16): PortalLayout(), activateWorker(), detectDeviceProfile(), DeviceProfile, listenForForeground(), listenForUpdates(), registerServiceWorker(), requestPersistentStorage() (+8 more)

### Community 46 - "verify-email-form.tsx"
Cohesion: 0.16
Nodes (13): VerifyEmailPage(), OtpInput(), OtpInputProps, ResendCodeButton(), ResendCodeButtonProps, VerifyEmailForm(), VerifyEmailFormProps, useCountdown() (+5 more)

### Community 47 - "Proyecto Fexco (nombre provisional — ajustar)"
Cohesion: 0.09
Nodes (22): Antes de mergear una épica, API en Render, Backend — `apps/api/src/`, Colección de API (Postman), Convenciones de commits, Despliegue, Dónde trabaja cada equipo / tarea, Ejecutar el proyecto (+14 more)

### Community 48 - "EmailVerificationRepository"
Cohesion: 0.18
Nodes (6): REDIS_KEY_PREFIX, buildCodeKey(), buildCooldownKey(), EmailVerificationRepository, EmailVerificationService, maskEmail()

### Community 49 - "CreateReviewDto"
Cohesion: 0.10
Nodes (9): CreateReviewDto, MAX_NOTE_LENGTH, MIN_NOTE_LENGTH, REVIEW_DECISIONS, ReviewDecisionValue, trim(), approved, observed (+1 more)

### Community 50 - "ApplicationsService"
Cohesion: 0.16
Nodes (3): ReviewsController, ApplicationsService, Roles()

### Community 51 - "compilerOptions"
Cohesion: 0.09
Nodes (21): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, incremental (+13 more)

### Community 52 - "@testing-library/react"
Cohesion: 0.16
Nodes (18): buildDefaultFilename(), getErrorMessage(), getFilename(), GraduateCsvDownload, GraduateCsvFilters, GraduateCsvStatus, requestGraduateCsv(), triggerGraduateCsvDownload() (+10 more)

### Community 53 - "package.json"
Cohesion: 0.09
Nodes (21): devDependencies, @commitlint/cli, @commitlint/config-conventional, husky, lint-staged, supabase, engines, node (+13 more)

### Community 54 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, class-transformer, class-validator, dotenv, ioredis, multer, @nestjs/common, @nestjs/config (+13 more)

### Community 55 - "CreateJobPostingDto"
Cohesion: 0.11
Nodes (4): CreateJobPostingDto, JobPostingsController, JobPostingsModule, JobPostingsService

### Community 56 - "@nestjs/common"
Cohesion: 0.23
Nodes (5): FORMACION_REPOSITORIO, FormacionAcademicaService, perfilValidationPipe(), PerfilRegistroService, @nestjs/common

### Community 57 - "mentorship-api.ts"
Cohesion: 0.20
Nodes (17): getProfile, inactive, updateParticipation, errorMessage(), getProfile, inactive, updateParticipation, useMentorParticipation() (+9 more)

### Community 58 - "affinity-radar.tsx"
Cohesion: 0.16
Nodes (15): AffinityRadar(), AffinityRadarProps, AREA_LABELS, AREA_SHORT_LABELS, AreaId, AXES_ORDER, mockData, CandidateCard() (+7 more)

### Community 59 - "formatPercentage"
Cohesion: 0.16
Nodes (12): AffinitySummaryCard(), AffinitySummaryCardProps, TopArea, ProgressBar(), ProgressBarProps, AREA_NAMES_MAP, AreaData, EvidenceItem (+4 more)

### Community 60 - "app.module.ts"
Cohesion: 0.12
Nodes (8): AppModule, AuthModule, EventsModule, PerfilModule, RegistrationsModule, ReviewsModule, assertServiceRoleKey(), logger

### Community 61 - "email-verification/services/email-verification.service.ts"
Cohesion: 0.17
Nodes (12): EMAIL_VERIFICATION_CONFIG, EmailVerificationConfig, readEmailVerificationConfig(), buildCooldownMessage(), CODE_LENGTH, CODE_TTL_SECONDS, EMAIL_VERIFICATION_MESSAGES, MAX_VERIFY_ATTEMPTS (+4 more)

### Community 62 - "applications-board.service.ts"
Cohesion: 0.16
Nodes (15): RequestsTableProps, boardPage, mockedFetchBoard, ApplicationDrawer(), ApiErrorBody, authHeaders(), BoardDetail, boardFetch() (+7 more)

### Community 63 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, eslint, jest, jsonwebtoken, @nestjs/cli, ts-jest, @types/express, @types/jest (+11 more)

### Community 64 - "graduates-report.service.spec.ts"
Cohesion: 0.19
Nodes (8): GraduatesReportRepository, SISTEMAS, GRADUATES_REPORT_MOCK, ApplicationDetailRow, ApplicationRow, CareerRow, ReportMockData, ReportSourceData

### Community 65 - "react"
Cohesion: 0.13
Nodes (6): AffinityCalculator(), ErrorAlert(), ErrorAlertProps, SpinnerProps, SuccessBannerProps, react

### Community 66 - "profile-summary.tsx"
Cohesion: 0.20
Nodes (11): ProfilePage(), AFFINITY_ROUTE, AddEducationButton(), certificationItem(), educationItem(), experienceItem(), formatMonthYear(), MONTHS (+3 more)

### Community 67 - "use-auth.ts"
Cohesion: 0.18
Nodes (10): mockPush, useAuth(), getRedirectPath(), login(), LOGIN_ERROR_MESSAGE, LoginCredentials, loginMock(), loginRequest() (+2 more)

### Community 68 - "GraduatesReportController"
Cohesion: 0.15
Nodes (5): GraduatesReportController, controllerWith(), GraduatesReportModule, GraduatesReportService, GraduatesReportResponse

### Community 69 - "timeline.tsx"
Cohesion: 0.19
Nodes (13): TimelineItem, SAMPLE_BACKUP_URL, CertificationItem(), CertificationItemProps, Field(), Harness(), withBackup, withoutBackup (+5 more)

### Community 70 - "candidate-search.tsx"
Cohesion: 0.18
Nodes (13): AREA_KEYS, AREA_KEYWORDS, AREA_NAME_HINTS, AreaKey, areaKeyOf(), AreaPointLike, detectAreas(), normalize() (+5 more)

### Community 71 - "compilerOptions"
Cohesion: 0.11
Nodes (17): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+9 more)

### Community 72 - "main.ts"
Cohesion: 0.14
Nodes (5): bootstrap(), trim(), UpdateCompanyDto, AppExceptionFilter, class-transformer

### Community 74 - "graduates-report-pdf.builder.ts"
Cohesion: 0.20
Nodes (13): buildGraduatesReportPdf(), buildHeaderRow(), buildInstitutionalHeader(), buildTable(), FONTS, PdfPrinterConstructor, TITLE_STATUS, UMSS_LOGO_DATA_URL (+5 more)

### Community 75 - "next"
Cohesion: 0.13
Nodes (9): createJestConfig, customJestConfig, nextJest, NuevaCertificacionPage(), inter, metadata, playfairDisplay, viewport (+1 more)

### Community 76 - "app-sidebar.tsx"
Cohesion: 0.21
Nodes (13): ProfileLayout(), createId(), ProfileStoreProvider(), AppHeadbar(), AppHeadbarProps, getInitials(), AppSidebar(), AppSidebarProps (+5 more)

### Community 77 - "use-registration.ts"
Cohesion: 0.25
Nodes (11): SavedSessionStatus, useRegistration(), ApiErrorBody, Career, checkRegistrationSession(), createRegistrationSession(), CreateSessionResult, fetchCareers() (+3 more)

### Community 78 - "errors/index.ts"
Cohesion: 0.23
Nodes (4): AppError, ForbiddenError, UnauthorizedError, mockGetUser

### Community 79 - "perfil-exportar.controller.spec.ts"
Cohesion: 0.14
Nodes (7): PerfilExportarController, base, conDatos, crearControlador(), peticion, vacio, PerfilExportarService

### Community 80 - "devDependencies"
Cohesion: 0.12
Nodes (16): devDependencies, autoprefixer, eslint, eslint-config-next, jest, jest-environment-jsdom, postcss, serwist (+8 more)

### Community 81 - "event-draft-editor.tsx"
Cohesion: 0.26
Nodes (12): EventDetailPage(), EventDetailPageProps, EditEventDraftPage(), EventDraftEditor(), EventDraftEditorProps, getRequestErrorMessage(), apiClient, getAdminDraft() (+4 more)

### Community 82 - "route-access.ts"
Cohesion: 0.20
Nodes (11): config, middleware(), AccessDecision, ADMIN_HOME, decideAccess(), LOGIN_PATH, ROLE_COOKIE, TOKEN_COOKIE (+3 more)

### Community 84 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, clsx, @hookform/resolvers, lucide-react, next, react, react-dom, react-hook-form (+7 more)

### Community 85 - "sw.js"
Cohesion: 0.17
Nodes (10): ALL_CACHES, cacheFirst(), CORE_ASSETS, isCacheable(), networkFirst(), PRECACHE_ICONS, PRECACHE_URLS, PROFILES (+2 more)

### Community 86 - "submission-confirmation.tsx"
Cohesion: 0.20
Nodes (10): ConfirmationPage(), metadata, MOCK_SUBMISSION, DOCUMENT_TYPE_LABELS, formatSubmittedAt(), SubmissionConfirmation(), SubmissionConfirmationProps, SubmittedDocumentType (+2 more)

### Community 87 - "application-drawer.tsx"
Cohesion: 0.20
Nodes (13): Application, ApplicationDetail(), ApplicationStatus, ChecklistItem, Field(), hoursSince(), MOCK_APPLICATION, OVERDUE_HOURS (+5 more)

### Community 88 - "services/reports.service.ts"
Cohesion: 0.21
Nodes (13): GraduateStatus, useDashboardIndicators(), loadIndicators(), loadGraduates(), API_BASE_URL, calculateDuration(), DashboardIndicators, formatDate() (+5 more)

### Community 89 - "query"
Cohesion: 0.21
Nodes (7): HealthController, JobPostingRow, queryMock, configuracionSsl(), getPool(), query(), pg

### Community 90 - "supabase.ts"
Cohesion: 0.21
Nodes (6): AuthRepository, mockDbFrom, mockSignIn, getSupabaseAuthClient(), supabase, SupabaseConfigError

### Community 93 - "registrations.service.ts"
Cohesion: 0.25
Nodes (9): DATA_SOURCE_UNAVAILABLE_MESSAGE, EXPIRED_MESSAGE, SESSION_TTL_SECONDS, mockedRedis, createRedisClient(), getRedisOptions(), getRedisPort(), logger (+1 more)

### Community 94 - "portal/page.tsx"
Cohesion: 0.16
Nodes (4): PublicLandingPage(), events, quickLinks, PublicNavbar()

### Community 96 - "mentorship.module.ts"
Cohesion: 0.19
Nodes (5): LOCAL_MENTOR_TEST_USER_ID, MentorAuthGuard, MentorRequest, MentorTestAuthGuard, mockGetUser

### Community 97 - "mentorship-profile-information.test.cjs"
Cohesion: 0.18
Nodes (4): assert, { MentorshipController }, { MentorshipService }, { test, describe, it }

### Community 98 - "catalog/page.tsx"
Cohesion: 0.24
Nodes (10): EventsCatalogPage(), loadCatalog(), SortOrder, dateFormatter, EventCard(), EventCardProps, formatEventDate(), formatEventTime() (+2 more)

### Community 99 - "(dashboard)/layout.tsx"
Cohesion: 0.28
Nodes (8): DashboardLayout(), LogoutButton(), handleLogout(), TituladoHeader(), clearSession(), adminLinks, AdminNavbar(), AdminNavbarProps

### Community 100 - "mentorship-interests.e2e.cjs"
Cohesion: 0.17
Nodes (7): { AppModule }, assert, { createClient }, { NestFactory }, path, { randomUUID }, { test }

### Community 101 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, dev, dev:local, lint, start, test, test:interests (+4 more)

### Community 102 - "archivo-respaldo.pipe.spec.ts"
Cohesion: 0.20
Nodes (7): ArchivoRespaldoPipe, EXTENSIONES, FIRMAS, JPG, PDF, PNG, TAMANIO_MAXIMO_BYTES

### Community 105 - "graduates-report.controller.spec.ts"
Cohesion: 0.27
Nodes (6): GraduatesReportQueryDto, query(), REPORT, GRADUATE_STATUSES, GraduateReportRow, GraduateStatus

### Community 106 - "graduates-report.service.ts"
Cohesion: 0.30
Nodes (10): compareApplications(), DB_STATUS, getStatusDate(), STATUS_LABEL, toReportRow(), calculateCareerDuration(), formatDate(), NOT_AVAILABLE (+2 more)

### Community 107 - "MentorAvailabilityPage"
Cohesion: 0.24
Nodes (6): MentorAvailabilityRoute(), MentorInterestsPage(), MentorAvailabilityPage(), Crumb, PageLayout(), PageLayoutProps

### Community 108 - "adminnavbar.tsx"
Cohesion: 0.23
Nodes (7): AdminDashboardPage(), AdminNavbar(), AdminNavbarProps, MobileMenu(), MobileMenuProps, sections, NavbarMovil()

### Community 109 - "login-form.tsx"
Cohesion: 0.35
Nodes (11): AtIcon(), EyeIcon(), EyeOffIcon(), FieldErrors, fieldState(), Icon(), KeyIcon(), LockIcon() (+3 more)

### Community 110 - "badge.tsx"
Cohesion: 0.24
Nodes (10): AgeBadge(), AgeBadgeProps, Badge(), BadgeProps, BadgeVariant, RequestStatus, STATUS_LABELS, StatusBadge() (+2 more)

### Community 114 - "logout-button.tsx"
Cohesion: 0.27
Nodes (3): mockPush, mockPush, authStore

### Community 115 - "AGENTS.md"
Cohesion: 0.20
Nodes (7): Code gotchas, Commands, Docs to distrust, Environment & services, Git workflow, Layout, MentorshipModule

### Community 116 - "registrations.controller.ts"
Cohesion: 0.31
Nodes (4): RegistrationFieldError, validationExceptionFactory(), RegistrationsExceptionFilter, runFilter()

### Community 117 - "progress-steps.tsx"
Cohesion: 0.31
Nodes (6): RegisterDocumentPage(), RegisterPage(), ProgressStepKey, ProgressSteps(), ProgressStepsProps, STEPS

### Community 118 - "frontend/services/email-verification.service.ts"
Cohesion: 0.20
Nodes (5): emailVerificationService, ResendOtpPayload, ResendOtpResponse, VerifyOtpPayload, VerifyOtpResponse

### Community 119 - "create-registration-data.dto.ts"
Cohesion: 0.31
Nodes (6): EXPEDITION_DEPARTMENTS, REQUIRED, trim(), trimLower(), trimUpper(), trim()

### Community 121 - "applications.repository.spec.ts"
Cohesion: 0.22
Nodes (6): applications, careers, details, mockedGetClient, NEW_ISO, OLD_ISO

### Community 122 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, declaration, esModuleInterop, module, skipLibCheck, strict, target, include

### Community 124 - "auth.store.ts"
Cohesion: 0.29
Nodes (5): UserRole, AuthState, AuthStatus, initialState, listeners

### Community 125 - "registration/frontend/store/index.ts"
Cohesion: 0.43
Nodes (6): ConfirmationInfo, PersonalData, REGISTRATION_STORAGE_KEY, RegistrationState, useRegistrationStore, zustand

### Community 126 - "events-admin.test.tsx"
Cohesion: 0.25
Nodes (7): draftEvent, mockGetAdminDraft, mockGetAdminEvents, mockPublishDraftEvent, mockPush, mockUpdateDraftEvent, publishedEvent

### Community 127 - "scripts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, lint, start, test, test:watch

### Community 128 - "report-alert-modal.tsx"
Cohesion: 0.48
Nodes (4): ReportAlertModal(), ReportAlertModalProps, isVisible(), useModalFocus()

### Community 129 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, assets, deleteOutDir, sourceRoot

### Community 130 - "login/page.tsx"
Cohesion: 0.73
Nodes (5): CheckCircleIcon(), LockSmallIcon(), LoginPage(), ServerIcon(), Svg()

### Community 131 - "submitReview"
Cohesion: 0.33
Nodes (6): handleConfirm(), handleClose(), handleConfirm(), handleClose(), handleConfirm(), submitReview()

### Community 132 - "use-debounced-batch.ts"
Cohesion: 0.60
Nodes (3): DEBOUNCE_MS, useDebouncedBatch(), UseDebouncedBatchReturn

### Community 133 - "shared-types/package.json"
Cohesion: 0.40
Nodes (4): main, name, types, version

## Knowledge Gaps
- **707 isolated node(s):** `collection`, `sourceRoot`, `deleteOutDir`, `assets`, `name` (+702 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1199 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **34 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `@nestjs/common` connect `@nestjs/common` to `documents.service.ts`, `graduate-csv.service.spec.ts`, `getSupabaseClient`, `MentorshipInterestsService`, `perfil.repository.ts`, `src/index.ts`, `dev-token.js`, `perfil-resumen.service.ts`, `mentorship.service.ts`, `companies.controller.ts`, `CreateEventDto`, `mentorship-availability.service.ts`, `api/package.json`, `mail.service.ts`, `auth.module.ts`, `RegistrationsRepository`, `verify-email.dto.ts`, `perfil-registros.controller.ts`, `EmailVerificationRepository`, `CreateReviewDto`, `CreateJobPostingDto`, `app.module.ts`, `email-verification/services/email-verification.service.ts`, `graduates-report.service.spec.ts`, `GraduatesReportController`, `main.ts`, `graduates-report-pdf.builder.ts`, `errors/index.ts`, `perfil-exportar.controller.spec.ts`, `query`, `supabase.ts`, `registrations.service.ts`, `mentorship.module.ts`, `archivo-respaldo.pipe.spec.ts`, `graduates-report.controller.spec.ts`, `graduates-report.service.ts`, `registrations.controller.ts`?**
  _High betweenness centrality (0.343) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `report-alert-modal.tsx`, `document-upload-step.tsx`, `login/page.tsx`, `companies/page.tsx`, `use-debounced-batch.ts`, `profile-records-manager.tsx`, `mentor-interests-api.ts`, `cn`, `useProfileStore`, `graduates-report-export.tsx`, `@testing-library/jest-dom`, `clearAccessToken`, `mentor-areas-page.tsx`, `graduate-affinity-view.tsx`, `reports/page.tsx`, `observe-dialog.tsx`, `mentor-profile-info-page.tsx`, `affinity-service.ts`, `afinidad/page.tsx`, `web/package.json`, `lucide-react`, `pdf-preview-modal.tsx`, `registration-form.tsx`, `Button`, `event-form.tsx`, `events-ui.tsx`, `register-sw.ts`, `verify-email-form.tsx`, `@testing-library/react`, `mentorship-api.ts`, `affinity-radar.tsx`, `formatPercentage`, `use-auth.ts`, `timeline.tsx`, `app-sidebar.tsx`, `use-registration.ts`, `event-draft-editor.tsx`, `application-drawer.tsx`, `services/reports.service.ts`, `portal/page.tsx`, `catalog/page.tsx`, `(dashboard)/layout.tsx`, `MentorAvailabilityPage`, `adminnavbar.tsx`, `login-form.tsx`, `badge.tsx`, `auth.store.ts`?**
  _High betweenness centrality (0.269) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `lucide-react` to `report-alert-modal.tsx`, `document-upload-step.tsx`, `companies/page.tsx`, `profile-records-manager.tsx`, `mentor-interests-api.ts`, `cn`, `useProfileStore`, `graduates-report-export.tsx`, `@testing-library/jest-dom`, `clearAccessToken`, `mentor-areas-page.tsx`, `graduate-affinity-view.tsx`, `reports/page.tsx`, `mentor-profile-info-page.tsx`, `affinity-service.ts`, `profile-data.ts`, `afinidad/page.tsx`, `web/package.json`, `pdf-preview-modal.tsx`, `events-ui.tsx`, `register-sw.ts`, `verify-email-form.tsx`, `@testing-library/react`, `affinity-radar.tsx`, `react`, `profile-summary.tsx`, `timeline.tsx`, `app-sidebar.tsx`, `portal/page.tsx`, `catalog/page.tsx`, `MentorAvailabilityPage`, `adminnavbar.tsx`, `progress-steps.tsx`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **What connects `collection`, `sourceRoot`, `deleteOutDir` to the rest of the system?**
  _707 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `documents.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.053613053613053616 - nodes in this community are weakly interconnected._
- **Should `document-upload-step.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05365686944634313 - nodes in this community are weakly interconnected._
- **Should `graduate-csv.service.spec.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._