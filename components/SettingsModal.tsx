
import React, { useState } from 'react';
import type { AppConfig } from '../types';

interface SettingsModalProps {
  config: AppConfig;
  onSave: (newConfig: AppConfig) => void;
  onClose: () => void;
}

const ListManager: React.FC<{
    title: string;
    items: string[];
    onUpdate: (newItems: string[]) => void;
}> = ({ title, items, onUpdate }) => {
    const [newItem, setNewItem] = useState('');

    const handleAddItem = () => {
        if (newItem && !items.includes(newItem)) {
            onUpdate([...items, newItem]);
            setNewItem('');
        }
    };

    const handleRemoveItem = (itemToRemove: string) => {
        onUpdate(items.filter(item => item !== itemToRemove));
    };

    return (
        <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>
            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                {items.map(item => (
                    <div key={item} className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                        <span className="text-sm">{item}</span>
                        <button onClick={() => handleRemoveItem(item)} className="text-red-500 hover:text-red-700 font-bold">
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddItem()}
                    className="w-full p-2 border rounded-md"
                    placeholder={`Añadir nuevo...`}
                />
                <button onClick={handleAddItem} className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600">Añadir</button>
            </div>
        </div>
    );
};


const SettingsModal: React.FC<SettingsModalProps> = ({ config, onSave, onClose }) => {
  const [currentConfig, setCurrentConfig] = useState<AppConfig>(config);

  const handleUpdateList = (field: keyof AppConfig, newList: string[]) => {
      if (Array.isArray(currentConfig[field])) {
          setCurrentConfig(prev => ({...prev, [field]: newList}));
      }
  };
  
  const handleChange = (field: keyof AppConfig, value: string | number) => {
    setCurrentConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(currentConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Configuración</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ListManager title="Obras Sociales" items={currentConfig.insuranceProviders} onUpdate={(newList) => handleUpdateList('insuranceProviders', newList)} />
              <ListManager title="Cirujanos/as" items={currentConfig.surgeons} onUpdate={(newList) => handleUpdateList('surgeons', newList)} />
              <ListManager title="Nutricionistas" items={currentConfig.nutritionists} onUpdate={(newList) => handleUpdateList('nutritionists', newList)} />
              <ListManager title="Psicólogos/as" items={currentConfig.psychologists} onUpdate={(newList) => handleUpdateList('psychologists', newList)} />
          </div>

          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Parámetros de Alerta por Tiempo</h3>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Días de Alerta Post-Presentación</label>
              <input
                type="number"
                value={currentConfig.alertDaysPostSubmission}
                onChange={e => handleChange('alertDaysPostSubmission', parseInt(e.target.value, 10))}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Mensaje Alerta (Interno)</label>
              <textarea
                value={currentConfig.alertMessageInternal}
                onChange={e => handleChange('alertMessageInternal', e.target.value)}
                className="w-full p-2 border rounded-md h-24"
                placeholder="El caso [ID de Caso] de [Paciente] ha superado los días en revisión por [Obra Social]. Se recomienda acción."
              />
            </div>
             <div className="mt-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">Mensaje Alerta (Paciente)</label>
              <textarea
                value={currentConfig.alertMessagePatient}
                onChange={e => handleChange('alertMessagePatient', e.target.value)}
                className="w-full p-2 border rounded-md h-24"
                placeholder="Hola [Paciente], notamos que tu carpeta lleva más de [Días] días en revisión. Estamos gestionándolo activamente y te informaremos cualquier novedad."
              />
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Parámetros de WhatsApp (Simulado)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Clave API WhatsApp</label>
                <input
                  type="password"
                  value={currentConfig.whatsAppApiToken}
                  onChange={e => handleChange('whatsAppApiToken', e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">ID de Cuenta</label>
                <input
                  type="text"
                  value={currentConfig.whatsAppAccountId}
                  onChange={e => handleChange('whatsAppAccountId', e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Número de Envío</label>
                <input
                  type="text"
                  value={currentConfig.whatsAppSenderNumber}
                  onChange={e => handleChange('whatsAppSenderNumber', e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 mr-3">Cancelar</button>
          <button onClick={handleSave} className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
