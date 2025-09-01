import React, { useState, useEffect, useCallback } from 'react';
import type { SurgicalCase, AppConfig } from './types';
import { DocumentStatus, FolderStatus, FollowUpStatus } from './types';
import { CaseRow } from './components/CaseRow';
import NewCaseModal from './components/NewCaseModal';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';
import { generateCaseSummary } from './services/geminiService';

const initialConfig: AppConfig = {
  whatsAppApiToken: 'simulated_token',
  whatsAppAccountId: 'simulated_id',
  whatsAppSenderNumber: '+15550001234',
  alertDaysPostSubmission: 30,
  alertMessageInternal: 'ALERTA: El caso [ID de Caso] de [Paciente] para [Obra Social] ha superado los [Días] días en revisión.',
  alertMessagePatient: 'Hola [Paciente], notamos que tu carpeta con [Obra Social] lleva más de [Días] días en revisión. Estamos gestionándolo y te informaremos cualquier novedad.',
  insuranceProviders: ['OSDE', 'Swiss Medical', 'Galeno', 'Medifé'],
  surgeons: ['Dr. Favaloro', 'Dra. Moreno', 'Dr. Pérez'],
  nutritionists: ['Lic. Ramirez', 'Lic. Gonzalez'],
  psychologists: ['Lic. Gomez', 'Lic. Fernandez'],
};

const App: React.FC = () => {
  const [cases, setCases] = useState<SurgicalCase[]>(() => {
    try {
      const savedCases = localStorage.getItem('surgicalCases');
      return savedCases ? JSON.parse(savedCases) : [];
    } catch (error) {
      console.error("Failed to load cases from localStorage:", error);
      return [];
    }
  });

  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const savedConfig = localStorage.getItem('surgicalConfig');
      // Merge saved config over defaults to ensure app doesn't break if new config options are added
      return savedConfig ? { ...initialConfig, ...JSON.parse(savedConfig) } : initialConfig;
    } catch (error) {
      console.error("Failed to load config from localStorage:", error);
      return initialConfig;
    }
  });

  const [isNewCaseModalOpen, setNewCaseModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);
  const [generatingSummaryId, setGeneratingSummaryId] = useState<string | null>(null);
  const [insuranceFilter, setInsuranceFilter] = useState<string>('');
  
  // Save cases to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('surgicalCases', JSON.stringify(cases));
    } catch (error) {
      console.error("Failed to save cases to localStorage:", error);
    }
  }, [cases]);

  // Save config to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('surgicalConfig', JSON.stringify(config));
    } catch (error) {
      console.error("Failed to save config to localStorage:", error);
    }
  }, [config]);


  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error') => {
    setToast({ message, type });
  };

  const handleCreateCase = (newCaseData: Omit<SurgicalCase, 'id' | 'folderStatus' | 'followUpStatus' | 'requestDate' | 'driveFolderLink' | 'lastAlertSent' | 'notes' | 'submittedDate' | 'authorizedDate' | 'operatedDate' | 'consent' | 'budget' | 'surgeonReport' | 'nutritionistReport' | 'psychologistReport'>) => {
    const newCase: SurgicalCase = {
      ...newCaseData,
      id: `AUT-${new Date().getFullYear()}-${String(cases.length + 1).padStart(3, '0')}`,
      consent: DocumentStatus.Pending,
      budget: DocumentStatus.Pending,
      surgeonReport: DocumentStatus.Pending,
      nutritionistReport: DocumentStatus.Pending,
      psychologistReport: DocumentStatus.Pending,
      folderStatus: FolderStatus.Incomplete,
      followUpStatus: FollowUpStatus.NotSubmitted,
      requestDate: new Date().toISOString(),
      submittedDate: null,
      authorizedDate: null,
      operatedDate: null,
      lastAlertSent: null,
      driveFolderLink: `https://example.com/drive/${newCaseData.patientName.replace(/\s/g, '_')}`,
      notes: '',
    };
    setCases(prev => [...prev, newCase]);
    showToast(`Caso para ${newCase.patientName} creado exitosamente.`, 'success');
  };

  const handleUpdateCase = useCallback((updatedCase: SurgicalCase) => {
    // Automatic Folder Status Update
    const requiredDocs: (keyof SurgicalCase)[] = ['consent', 'budget', 'surgeonReport', 'nutritionistReport', 'psychologistReport'];
    const allDocsReceived = requiredDocs.every(doc => updatedCase[doc] === DocumentStatus.Received || updatedCase[doc] === DocumentStatus.NotApplicable);
    
    if (allDocsReceived && updatedCase.folderStatus === FolderStatus.Incomplete) {
      updatedCase.folderStatus = FolderStatus.ReadyToSubmit;
      showToast(`Carpeta de ${updatedCase.patientName} lista para presentar!`, 'info');
    } else if (!allDocsReceived && updatedCase.folderStatus === FolderStatus.ReadyToSubmit) {
      updatedCase.folderStatus = FolderStatus.Incomplete;
    }

    // Automatic Submitted Date
    const oldCase = cases.find(c => c.id === updatedCase.id);
    if(oldCase && oldCase.followUpStatus === FollowUpStatus.NotSubmitted && updatedCase.followUpStatus === FollowUpStatus.SubmittedInReview && !updatedCase.submittedDate) {
        updatedCase.submittedDate = new Date().toISOString();
        showToast(`El caso de ${updatedCase.patientName} ha sido marcado como 'Presentada'.`, 'info');
    }

    setCases(prevCases => prevCases.map(c => (c.id === updatedCase.id ? updatedCase : c)));
  }, [cases]);


  const handleGenerateSummary = async (caseData: SurgicalCase) => {
    setGeneratingSummaryId(caseData.id);
    showToast(`Generando resumen para ${caseData.patientName}...`, 'info');
    const summary = await generateCaseSummary(caseData);
    const updatedCase = { ...caseData, notes: `${caseData.notes ? caseData.notes + '\n\n' : ''}--- Resumen IA ---\n${summary}` };
    handleUpdateCase(updatedCase);
    showToast('Resumen generado por IA y añadido a las notas.', 'success');
    setGeneratingSummaryId(null);
  };


  useEffect(() => {
    const checkAlerts = () => {
        const now = new Date();
        const updatedCases = cases.map(c => {
            if (c.followUpStatus === FollowUpStatus.SubmittedInReview && c.submittedDate) {
                const submittedDate = new Date(c.submittedDate);
                const daysDiff = (now.getTime() - submittedDate.getTime()) / (1000 * 3600 * 24);

                if (daysDiff > config.alertDaysPostSubmission) {
                    const lastAlertDate = c.lastAlertSent ? new Date(c.lastAlertSent) : null;
                    // Only send if no alert sent, or if last alert was before this alert period started
                    if (!lastAlertDate || lastAlertDate < new Date(now.getTime() - config.alertDaysPostSubmission * 24 * 3600 * 1000)) {
                        
                        const internalMsg = config.alertMessageInternal
                            .replace('[ID de Caso]', c.id)
                            .replace('[Paciente]', c.patientName)
                            .replace('[Obra Social]', c.insuranceProvider)
                            .replace('[Días]', String(config.alertDaysPostSubmission));

                        const patientMsg = config.alertMessagePatient
                            .replace('[Paciente]', c.patientName)
                            .replace('[Obra Social]', c.insuranceProvider)
                            .replace('[Días]', String(config.alertDaysPostSubmission));

                        showToast(`ALERTA INTERNA: ${internalMsg}`, 'warning');
                        showToast(`(Simulado) WhatsApp a ${c.patientName}: ${patientMsg}`, 'info');
                        
                        return { ...c, lastAlertSent: now.toISOString() };
                    }
                }
            }
            return c;
        });
        // This avoids re-rendering if no case was updated
        if (JSON.stringify(cases) !== JSON.stringify(updatedCases)) {
            setCases(updatedCases);
        }
    };

    const intervalId = setInterval(checkAlerts, 30000); // Check every 30 seconds for demo
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cases, config]);

  const filteredCases = cases.filter(c => 
    !insuranceFilter || c.insuranceProvider === insuranceFilter
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-700">Gestión de Carpetas Quirúrgicas</h1>
        <div>
          <button onClick={() => setSettingsModalOpen(true)} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors mr-2">
            Configuración
          </button>
          <button onClick={() => setNewCaseModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            + Nuevo Caso
          </button>
        </div>
      </header>
      <main className="p-6">
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full table-auto">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="p-3 text-sm font-semibold tracking-wide text-left align-top">Paciente</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-left align-top">
                    <span>Obra Social</span>
                    <select
                        value={insuranceFilter}
                        onChange={e => setInsuranceFilter(e.target.value)}
                        className="w-full mt-1 p-1 border rounded-md text-xs bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Filtrar por Obra Social"
                    >
                        <option value="">Todas</option>
                        {config.insuranceProviders.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </th>
                <th className="p-3 text-sm font-semibold tracking-wide text-left align-top">Documentos Generales</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-left align-top">Cirujano / Informe</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-left align-top">Nutricionista / Informe</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-left align-top">Psicólogo/a / Informe</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-center align-top">Estado Carpeta</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-left align-top">Estado Seguimiento</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-left align-top">Fechas Clave</th>
                <th className="p-3 text-sm font-semibold tracking-wide text-left w-64 align-top">Notas / Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cases.length > 0 ? (
                filteredCases.length > 0 ? (
                    filteredCases.map(c => (
                        <CaseRow 
                            key={c.id} 
                            caseData={c} 
                            onUpdate={handleUpdateCase} 
                            onGenerateSummary={handleGenerateSummary}
                            isGeneratingSummary={generatingSummaryId === c.id}
                            alertDaysPostSubmission={config.alertDaysPostSubmission}
                        />
                    ))
                ) : (
                    <tr>
                        <td colSpan={10} className="text-center p-8 text-gray-500">
                            No se encontraron casos que coincidan con el filtro.
                        </td>
                    </tr>
                )
              ) : (
                <tr>
                  <td colSpan={10} className="text-center p-8 text-gray-500">
                    No hay casos. ¡Crea uno para empezar!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {isNewCaseModalOpen && <NewCaseModal config={config} onSave={handleCreateCase} onClose={() => setNewCaseModalOpen(false)} />}
      {isSettingsModalOpen && <SettingsModal config={config} onSave={setConfig} onClose={() => setSettingsModalOpen(false)} />}
    </div>
  );
};

export default App;
