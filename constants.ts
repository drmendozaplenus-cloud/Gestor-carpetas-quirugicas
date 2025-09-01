
import { DocumentStatus, FollowUpStatus } from './types';

export const DOCUMENT_STATUS_OPTIONS = [
  DocumentStatus.Pending,
  DocumentStatus.Received,
  DocumentStatus.NotApplicable,
];

export const FOLLOW_UP_STATUS_OPTIONS = [
  FollowUpStatus.NotSubmitted,
  FollowUpStatus.SubmittedInReview,
  FollowUpStatus.Authorized,
  FollowUpStatus.Rejected,
  FollowUpStatus.Judicialized,
  FollowUpStatus.SurgeryScheduled,
  FollowUpStatus.Operated,
];
