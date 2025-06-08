'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Package, User, Calendar, Search } from 'lucide-react';
import { trajetService, type TrajetPlanifie, type TrajetFilters } from '@/services/trajetService';
import { useApiCall } from '@/hooks/use-api-call';
import { toast } from 'sonner';

export default function AvailableRoutes() {
  const [trajets, setTrajets] = useState<TrajetPlanifie[]>([]);
  const [filters, setFilters] = useState<TrajetFilters>({
    startingAddress: '',
    destinationAddress: '',
    date: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const { loading, execute } = useApiCall();

  // Charger les trajets actifs
  const loadTrajets = async (searchFilters?: TrajetFilters) => {
    try {
      const response = await execute(() => trajetService.getActiveTrajets(searchFilters));
      if (response?.data?.trajets && Array.isArray(response.data.trajets)) {
        setTrajets(response.data.trajets);
      } else if (response?.trajets && Array.isArray(response.trajets)) {
        setTrajets(response.trajets);
      } else {
        setTrajets([]);
        console.warn('Format de réponse inattendu:', response);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des trajets:', error);
      setTrajets([]);
      toast.error('Erreur lors du chargement des trajets');
    }
  };

  useEffect(() => {
    loadTrajets();
  }, []);

  // Gérer la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchFilters = {
      ...filters,
      startingAddress: filters.startingAddress || undefined,
      destinationAddress: filters.destinationAddress || undefined,
      date: filters.date || undefined
    };
    loadTrajets(searchFilters);
  };

  // Réinitialiser les filtres
  const handleReset = () => {
    setFilters({
      startingAddress: '',
      destinationAddress: '',
      date: ''
    });
    loadTrajets();
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'delivery_route': return 'Trajet de livraison';
      case 'shopping_trip': return 'Course/Shopping';
      case 'other': return 'Autre';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'delivery_route': return 'bg-blue-100 text-blue-800';
      case 'shopping_trip': return 'bg-green-100 text-green-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Contacter le livreur (placeholder - à implémenter avec le système de messages)
  const handleContact = (trajet: TrajetPlanifie) => {
    toast.info('Fonctionnalité de contact en cours de développement');
    // TODO: Rediriger vers le système de messages ou ouvrir un modal de contact
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Trajets Disponibles</h2>
          <p className="text-gray-600 mt-1">Trouvez des livreurs qui se déplacent près de chez vous</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Search className="h-4 w-4" />
          {showFilters ? 'Masquer les filtres' : 'Filtrer'}
        </button>
      </div>

      {/* Filtres de recherche */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Filtrer les trajets</h3>
          
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville de départ
                </label>
                <input
                  type="text"
                  value={filters.startingAddress}
                  onChange={(e) => setFilters({ ...filters, startingAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Paris"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville de destination
                </label>
                <input
                  type="text"
                  value={filters.destinationAddress}
                  onChange={(e) => setFilters({ ...filters, destinationAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Lyon"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={filters.date}
                  onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Recherche...' : 'Rechercher'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des trajets */}
      <div className="space-y-4">
        {loading && trajets.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Recherche des trajets disponibles...</p>
          </div>
        ) : trajets.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun trajet disponible</p>
            <p className="text-sm text-gray-500">Essayez de modifier vos critères de recherche</p>
          </div>
        ) : (
          trajets.map((trajet) => (
            <div key={trajet.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(trajet.type)}`}>
                      {getTypeLabel(trajet.type)}
                    </span>
                    {trajet.livreur && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Livreur #{trajet.livreur.id}</span>
                        {trajet.livreur.rating && (
                          <span className="text-yellow-600">⭐ {trajet.livreur.rating}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="font-medium">De:</span>
                      <span>{trajet.startingAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span className="font-medium">Vers:</span>
                      <span>{trajet.destinationAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">Date:</span>
                      <span>{new Date(trajet.plannedDate).toLocaleString('fr-FR')}</span>
                    </div>
                    {trajet.maxCapacity && (
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Capacité disponible:</span>
                        <span>{trajet.maxCapacity} colis/courses</span>
                      </div>
                    )}
                    {trajet.estimatedDuration && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">Durée estimée:</span>
                        <span>{trajet.estimatedDuration} minutes</span>
                      </div>
                    )}
                    {trajet.description && (
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium">Description:</span> {trajet.description}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  <button
                    onClick={() => handleContact(trajet)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors text-sm"
                  >
                    Contacter
                  </button>
                </div>
              </div>
              
              {/* Informations sur le véhicule */}
              {trajet.livreur && (
                <div className="border-t pt-3 mt-3">
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    {trajet.livreur.vehicleType && (
                      <span>Véhicule: {trajet.livreur.vehicleType}</span>
                    )}
                    {trajet.livreur.totalDeliveries && (
                      <span>{trajet.livreur.totalDeliveries} livraisons effectuées</span>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      trajet.livreur.availabilityStatus === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {trajet.livreur.availabilityStatus === 'available' ? 'Disponible' : 'Occupé'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Message informatif */}
      {trajets.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900">Comment ça marche ?</h4>
              <p className="text-sm text-blue-700 mt-1">
                Contactez directement les livreurs qui planifient des trajets près de chez vous. 
                Vous pouvez leur demander de récupérer vos colis ou faire vos courses pendant leur trajet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}