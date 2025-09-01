
import React, { useState } from 'react';
import type { SurgicalCase, AppConfig } from '../types';

interface NewCaseModalProps {
  config: AppConfig;
  onSave: (newCase: Omit<SurgicalCase, 'id' | 'folderStatus' | 'followUpStatus' | 'requestDate' | 'driveFolderLink' | 'lastAlertSent' | 'notes' | 'submittedDate' | 'authorizedDate' | 'operatedDate' | 'consent' | 'budget' | 'surgeonReport' | 'nutritionistReport' | 'psychologistReport'>) => void;
  onClose: () => void;
}

const NewCaseModal: React.FC<NewCaseModalProps> = ({ config, onSave, onClose }) => {
  const [patientName, setPatientName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [surgeon, setSurgeon] = useState('');
  const [nutritionist, setNutritionist] = useState('');
  const [psychologist, setPsychologist] = useState('');

  const handleSave = () => {
    if (!patientName || !insuranceProvider) {
        alert('El nombre del paciente y la obra social son obligatorios.');
        return;
    }
    onSave({
      patientName,
      whatsappNumber,
      insuranceProvider,
      surgeon,
      nutritionist,
      psychologist,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Crear Nuevo Caso</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Paciente*</label>
              <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} className="w-full p-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Número de WhatsApp</label>
              <input type="text" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} className="w-full p-2 border rounded-md" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Obra Social*</label>
            <select value={insuranceProvider} onChange={e => setInsuranceProvider(e.target.value)} className="w-full p-2 border rounded-md bg-white">
              <option value="" disabled>Seleccionar...</option>
              {config.insuranceProviders.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Cirujano/a</label>
               <select value={surgeon} onChange={e => setSurgeon(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                 <option value="" disabled>Seleccionar...</option>
                 {config.surgeons.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Nutricionista</label>
               <select value={nutritionist} onChange={e => setNutritionist(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                 <option value="" disabled>Seleccionar...</option>
                 {config.nutritionists.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Psicólogo/a</label>
              <select value={psychologist} onChange={e => setPsychologist(e.target.value)} className="w-full p-2 border rounded-md bg-white">
                 <option value="" disabled>Seleccionar...</option>
                 {config.psychologists.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 mr-3">Cancelar</button>
          <button onClick={handleSave} className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Crear Caso</button>
        </div>
      </div>
    </div>
  );
};

export default NewCaseModal;
