
export enum DocumentStatus {
  Pending = 'Pendiente',
  Received = 'Recibido',
  NotApplicable = 'No Aplica',
}

export enum FolderStatus {
  Incomplete = 'Incompleta',
  ReadyToSubmit = '✅ Lista para Presentar',
}

export enum FollowUpStatus {
  NotSubmitted = 'No Presentada',
  SubmittedInReview = 'Presentada y en Revisión',
  Authorized = 'Autorizada',
  Rejected = 'Rechazada',
  Judicialized = 'Judicializada',
  SurgeryScheduled = 'Cirugía Programada',
  Operated = 'Operado',
}

export interface SurgicalCase {
  id: string;
  patientName: string;
  whatsappNumber: string;
  insuranceProvider: string;
  surgeon: string;
  nutritionist: string;
  psychologist: string;
  consent: DocumentStatus;
  budget: DocumentStatus;
  surgeonReport: DocumentStatus;
  nutritionistReport: DocumentStatus;
  psychologistReport: DocumentStatus;
  folderStatus: FolderStatus;
  followUpStatus: FollowUpStatus;
  requestDate: string; // ISO string
  submittedDate: string | null; // ISO string
  authorizedDate: string | null; // ISO string
  operatedDate: string | null; // ISO string
  lastAlertSent: string | null; // ISO string
  driveFolderLink: string;
  notes: string;
}

export interface AppConfig {
  whatsAppApiToken: string;
  whatsAppAccountId: string;
  whatsAppSenderNumber: string;
  alertDaysPostSubmission: number;
  alertMessageInternal: string;
  alertMessagePatient: string;
  insuranceProviders: string[];
  surgeons: string[];
  nutritionists: string[];
  psychologists: string[];
}
