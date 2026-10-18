import React, { useState } from 'react';
import {
  User,
  MapPin,
  Layers,
  Droplets,
  Plus,
  Save,
  CheckCircle2,
  Sprout,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { Farm } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export const FarmerProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { showToast } = useToast();

  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddFarm, setShowAddFarm] = useState(false);

  // New farm form state
  const [farmName, setFarmName] = useState('');
  const [farmState, setFarmState] = useState('Maharashtra');
  const [farmDistrict, setFarmDistrict] = useState('Nashik');
  const [farmLocality, setFarmLocality] = useState('Niphad');
  const [area, setArea] = useState(3);
  const [soilType, setSoilType] = useState('Black Soil');
  const [irrigationMethod, setIrrigationMethod] = useState<'Drip' | 'Sprinkler' | 'Canal / Flood' | 'Borewell / Tube' | 'Rainfed'>('Drip');
  const [waterAvailability, setWaterAvailability] = useState<'High' | 'Medium' | 'Low' | 'Critical / Scanty'>('Medium');
  const [waterCapacityKL, setWaterCapacityKL] = useState(4000);

  const farms = dataService.getFarms('farmer-1');

  const handleAddFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) {
      showToast('Please enter a farm name.', 'error');
      return;
    }

    dataService.addFarm({
      farmerId: 'farmer-1',
      name: farmName.trim(),
      state: farmState,
      district: farmDistrict,
      locality: farmLocality.trim(),
      area,
      areaUnit: 'acres',
      soilType,
      irrigationMethod,
      waterAvailability,
      waterStorageCapacityKL: waterCapacityKL,
    });

    showToast(`Added farm "${farmName}" successfully!`, 'success');
    setShowAddFarm(false);
    setFarmName('');
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-4 sm:p-6 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold mb-1.5">
            <User className="w-3.5 h-3.5 text-emerald-300" />
            <span>Farmer Profile & Land</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {currentUser?.fullName || 'Ramesh Patel'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-0.5">
            {currentUser?.location?.district}, {currentUser?.location?.state} • Registered Farmer
          </p>
        </div>

        <button
          onClick={() => setShowAddFarm(!showAddFarm)}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-emerald-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 text-emerald-800" />
          <span>{showAddFarm ? 'Cancel' : 'Add Farm Plot'}</span>
        </button>
      </div>

      {/* Add Farm Form */}
      {showAddFarm && (
        <form onSubmit={handleAddFarm} className="bg-white rounded-2xl border border-emerald-900/15 p-4 sm:p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Register New Farm Land Plot
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Farm Plot Name *
              </label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="e.g. Riverbank Plot East"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Land Area (Acres) *
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Soil Type *
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-700"
              >
                <option value="Black Soil">Black Cotton Soil</option>
                <option value="Loamy Soil">Loamy Soil</option>
                <option value="Sandy Loam">Sandy Loam</option>
                <option value="Clay Loam">Clay Loam</option>
                <option value="Alluvial Soil">Alluvial Soil</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Irrigation Method *
              </label>
              <select
                value={irrigationMethod}
                onChange={(e) => setIrrigationMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-700"
              >
                <option value="Drip">Drip Irrigation</option>
                <option value="Sprinkler">Sprinkler Irrigation</option>
                <option value="Canal / Flood">Canal / Furrow Flood</option>
                <option value="Borewell / Tube">Borewell Direct</option>
                <option value="Rainfed">Rainfed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Water Availability Level
              </label>
              <select
                value={waterAvailability}
                onChange={(e) => setWaterAvailability(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-700"
              >
                <option value="High">High (Adequate year-round)</option>
                <option value="Medium">Medium (Seasonal storage)</option>
                <option value="Low">Low (Restricted pumping)</option>
                <option value="Critical / Scanty">Critical / Scanty</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Water Budget (KL / Season)
              </label>
              <input
                type="number"
                min="100"
                step="500"
                value={waterCapacityKL}
                onChange={(e) => setWaterCapacityKL(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddFarm(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs shadow-xs hover:bg-emerald-900"
            >
              Save Farm Plot
            </button>
          </div>
        </form>
      )}

      {/* Existing Registered Farms */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">
          Registered Land Plots ({farms.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {farms.map((farm) => (
            <div
              key={farm.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {farm.id}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {farm.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{farm.locality}, {farm.district}, {farm.state}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black text-slate-900">{farm.area}</span>
                  <span className="text-xs text-slate-500 font-bold block">{farm.areaUnit}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Soil Type</span>
                  <span className="font-bold text-slate-800">{farm.soilType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Irrigation</span>
                  <span className="font-bold text-slate-800">{farm.irrigationMethod}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Water Availability</span>
                  <span className="font-bold text-emerald-800">{farm.waterAvailability}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Water Budget</span>
                  <span className="font-bold text-cyan-800">{farm.waterStorageCapacityKL?.toLocaleString() || 6000} KL</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
