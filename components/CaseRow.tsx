import React from 'react';
import type { SurgicalCase } from '../types';
import { DocumentStatus, FollowUpStatus } from '../types';
import { DOCUMENT_STATUS_OPTIONS, FOLLOW_UP_STATUS_OPTIONS } from '../constants';

interface CaseRowProps {
  caseData: SurgicalCase;
  onUpdate: (updatedCase: SurgicalCase) => void;
  onGenerateSummary: (caseData: SurgicalCase) => void;
  isGeneratingSummary: boolean;
  alertDaysPostSubmission: number;
}

const statusColor = (status: FollowUpStatus): string => {
  switch (status) {
    case FollowUpStatus.Authorized:
    case FollowUpStatus.Operated:
    case FollowUpStatus.SurgeryScheduled:
      return 'bg-green-100 text-green-800';
    case FollowUpStatus.SubmittedInReview:
      return 'bg-blue-100 text-blue-800';
    case FollowUpStatus.Rejected:
    case FollowUpStatus.Judicialized:
      return 'bg-red-100 text-red-800';
    case FollowUpStatus.NotSubmitted:
    default:
      return 'bg-gray-200 text-gray-800';
  }
};

const folderStatusColor = (status: string): string => {
    if (status.includes('✅')) {
        return 'bg-green-100 text-green-800';
    }
    return 'bg-yellow-100 text-yellow-800';
}

const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    // Handles 'YYYY-MM-DD' from date picker
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    // Add time to avoid timezone issues making it the previous day
    return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

export const CaseRow: React.FC<CaseRowProps> = ({ caseData, onUpdate, onGenerateSummary, isGeneratingSummary, alertDaysPostSubmission }) => {

  const handleFieldChange = (field: keyof SurgicalCase, value: any) => {
    onUpdate({ ...caseData, [field]: value });
  };

  const isOverdue = caseData.followUpStatus === FollowUpStatus.SubmittedInReview &&
    caseData.submittedDate &&
    (new Date().getTime() - new Date(caseData.submittedDate).getTime()) / (1000 * 3600 * 24) > alertDaysPostSubmission;
    
  const overdueTooltip = `El caso ha superado los ${alertDaysPostSubmission} días de revisión. Última alerta enviada: ${caseData.lastAlertSent ? new Date(caseData.lastAlertSent).toLocaleDateString() : 'Nunca'}.`;

  return (
    <tr className="bg-white border-b hover:bg-gray-50">
      <td className="p-3 text-sm text-gray-700 whitespace-nowrap align-top">
        <div className="font-bold text-gray-900">{caseData.patientName}</div>
        <div className="text-xs">{caseData.id}</div>
        <div className="text-xs text-blue-600">{caseData.whatsappNumber}</div>
      </td>
      <td className="p-3 text-sm text-gray-700 whitespace-nowrap align-top">
        {caseData.insuranceProvider}
      </td>
      <td className="p-3 text-sm align-top">
        <div className="mb-2">
            <label className="text-xs font-medium text-gray-500">Consentimiento</label>
            <select
              value={caseData.consent}
              onChange={(e) => handleFieldChange('consent', e.target.value as DocumentStatus)}
              className="w-full p-1.5 border rounded-md text-xs"
            >
              {DOCUMENT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
        <div>
            <label className="text-xs font-medium text-gray-500">Presupuesto</label>
            <select
              value={caseData.budget}
              onChange={(e) => handleFieldChange('budget', e.target.value as DocumentStatus)}
              className="w-full p-1.5 border rounded-md text-xs"
            >
              {DOCUMENT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
      </td>
      <td className="p-3 text-sm text-gray-700 align-top">
        <div className="font-semibold text-gray-800 mb-1">{caseData.surgeon || <span className="text-gray-400 italic">No asignado</span>}</div>
        <select
          value={caseData.surgeonReport}
          onChange={(e) => handleFieldChange('surgeonReport', e.target.value as DocumentStatus)}
          className="w-full p-1.5 border rounded-md text-xs"
          disabled={!caseData.surgeon}
        >
          {DOCUMENT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </td>
      <td className="p-3 text-sm text-gray-700 align-top">
        <div className="font-semibold text-gray-800 mb-1">{caseData.nutritionist || <span className="text-gray-400 italic">No asignado</span>}</div>
        <select
          value={caseData.nutritionistReport}
          onChange={(e) => handleFieldChange('nutritionistReport', e.target.value as DocumentStatus)}
          className="w-full p-1.5 border rounded-md text-xs"
          disabled={!caseData.nutritionist}
        >
          {DOCUMENT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </td>
      <td className="p-3 text-sm text-gray-700 align-top">
        <div className="font-semibold text-gray-800 mb-1">{caseData.psychologist || <span className="text-gray-400 italic">No asignado</span>}</div>
        <select
          value={caseData.psychologistReport}
          onChange={(e) => handleFieldChange('psychologistReport', e.target.value as DocumentStatus)}
          className="w-full p-1.5 border rounded-md text-xs"
          disabled={!caseData.psychologist}
        >
          {DOCUMENT_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </td>
      <td className="p-3 text-sm text-center align-top">
        <span className={`px-2 py-1 mt-1 inline-block text-xs font-semibold rounded-full ${folderStatusColor(caseData.folderStatus)}`}>
          {caseData.folderStatus}
        </span>
      </td>
      <td className="p-3 text-sm align-top">
        <div className="flex items-center gap-2">
            <select
              value={caseData.followUpStatus}
              onChange={(e) => handleFieldChange('followUpStatus', e.target.value as FollowUpStatus)}
              className={`w-full p-1.5 border rounded-md text-xs font-medium ${statusColor(caseData.followUpStatus)}`}
            >
              {FOLLOW_UP_STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {isOverdue && (
              <div title={overdueTooltip}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            )}
        </div>
      </td>
      <td className="p-3 text-sm align-top space-y-2">
        <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 w-16">Solicitud:</label>
            <input type="text" readOnly value={formatDate(caseData.requestDate)} className="w-full p-1 border-none bg-gray-100 rounded-md text-xs cursor-not-allowed" title="Fecha Solicitud"/>
        </div>
        <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 w-16">Presentada:</label>
            <input type="date" value={formatDate(caseData.submittedDate)} onChange={e => handleFieldChange('submittedDate', e.target.value)} className="w-full p-1 border rounded-md text-xs" title="Fecha Presentada"/>
        </div>
        <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 w-16">Autorizado:</label>
            <input type="date" value={formatDate(caseData.authorizedDate)} onChange={e => handleFieldChange('authorizedDate', e.target.value)} className="w-full p-1 border rounded-md text-xs" title="Fecha Autorizado"/>
        </div>
        <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-gray-500 w-16">Operado:</label>
            <input type="date" value={formatDate(caseData.operatedDate)} onChange={e => handleFieldChange('operatedDate', e.target.value)} className="w-full p-1 border rounded-md text-xs" title="Fecha Operado"/>
        </div>
      </td>
      <td className="p-3 text-sm align-top">
         <textarea
            value={caseData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            className="w-full p-1.5 border rounded-md text-xs h-24"
            placeholder="Observaciones..."
        />
        <button
            onClick={() => onGenerateSummary(caseData)}
            disabled={isGeneratingSummary}
            className="mt-1 w-full text-xs bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-1 px-2 rounded-md disabled:bg-indigo-300 flex items-center justify-center"
        >
            {isGeneratingSummary ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : "✨ IA"}
            <span className="ml-1">Resumir</span>
        </button>
      </td>
    </tr>
  );
};
