'use client';

import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Clock, Package, Edit, Trash2, Calendar } from 'lucide-react';
import { trajetService, type TrajetPlanifie, type CreateTrajetData } from '@/services/trajetService';
import { livreurService } from '@/services/livreurService';
import { useApiCall } from '@/hooks/use-api-call';
import { toast } from 'sonner';

interface PlannedRoutesProps {
  livreurId: number;
}

export default function PlannedRoutes({ livreurId }: PlannedRoutesProps) {
  const [trajets, setTrajets] = useState<TrajetPlanifie[]>([]);
  const [livraisons, setLivraisons] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTrajet, setEditingTrajet] = useState<TrajetPlanifie | null>(null);
  const [formData, setFormData] = useState<CreateTrajetData>({
    startingAddress: '',
    destinationAddress: '',
    plannedDate: '',
    description: '',
    type: 'delivery_route',
    maxCapacity: 1,
    estimatedDuration: 60
  });

  const { loading, execute } = useApiCall();

  // Charger les trajets
  const loadTrajets = async () => {
    try {
      console.log('Chargement des trajets pour le livreur:', livreurId);
      const response = await execute(trajetService.getTrajetsByLivreur(livreurId));
      
      console.log('Réponse trajets reçue:', response);
      
      // Gestion flexible du format de réponse
      let trajetsData: any[] = [];
      
      if (response?.data?.trajets && Array.isArray(response.data.trajets)) {
        trajetsData = response.data.trajets;
      } else if (response?.trajets && Array.isArray(response.trajets)) {
        trajetsData = response.trajets;
      } else if (response?.data && Array.isArray(response.data)) {
        trajetsData = response.data;
      } else if (Array.isArray(response)) {
        trajetsData = response;
      } else {
        trajetsData = [];
        console.warn('Format de réponse inattendu pour les trajets:', response);
      }
      
      setTrajets(trajetsData);
      console.log('Trajets chargés:', trajetsData.length);
      
    } catch (error) {
      console.error('Erreur lors du chargement des trajets:', error);
      setTrajets([]);
      
      // Gestion d'erreur plus spécifique
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          toast.error('Service de trajets non disponible');
        } else if (error.message.includes('500')) {
          toast.error('Erreur serveur lors du chargement des trajets');
        } else {
          toast.error(`Erreur: ${error.message}`);
        }
      } else {
        toast.error('Erreur lors du chargement des trajets');
      }
    }
  };

  // Charger les livraisons du livreur
  const loadLivraisons = async () => {
    try {
      const response = await execute(livreurService.getMyLivraisons({ status: 'in_progress' }));
      if (response?.data?.livraisons && Array.isArray(response.data.livraisons)) {
        setLivraisons(response.data.livraisons);
      } else if (response?.livraisons && Array.isArray(response.livraisons)) {
        setLivraisons(response.livraisons);
      } else {
        setLivraisons([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des livraisons:', error);
      setLivraisons([]);
    }
  };

  useEffect(() => {
    loadTrajets();
    loadLivraisons();
  }, [livreurId]);

  // Fonction pour créer un trajet basé sur une livraison
  const createTrajetFromLivraison = async (livraison: any) => {
    if (!confirm(`Êtes-vous sûr de vouloir créer un trajet planifié basé sur la livraison #${livraison.id} ?`)) return;
    
    const trajetData: CreateTrajetData = {
      startingAddress: livraison.pickupLocation,
      destinationAddress: livraison.dropoffLocation,
      plannedDate: new Date().toISOString(),
      description: `Livraison #${livraison.id}`,
      type: 'delivery_route',
      maxCapacity: livraison.colis?.length || 1,
      estimatedDuration: 60
    };
    
    try {
      await execute(trajetService.createTrajet(trajetData));
      toast.success('Trajet créé à partir de la livraison');
      await loadTrajets();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la création du trajet');
    }
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTrajet) {
        await execute(trajetService.updateTrajet(editingTrajet.id, formData));
        toast.success('Trajet mis à jour avec succès');
      } else {
        await execute(trajetService.createTrajet(formData));
        toast.success('Trajet planifié créé avec succès');
      }
      
      // Réinitialiser le formulaire
      setFormData({
        startingAddress: '',
        destinationAddress: '',
        plannedDate: '',
        description: '',
        type: 'delivery_route',
        maxCapacity: 1,
        estimatedDuration: 60
      });
      setShowCreateForm(false);
      setEditingTrajet(null);
      
      // Recharger les trajets
      await loadTrajets();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(editingTrajet ? 'Erreur lors de la mise à jour' : 'Erreur lors de la création');
    }
  };

  // Supprimer un trajet
  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce trajet ?')) return;
    
    try {
      await execute(trajetService.deleteTrajet(id));
      toast.success('Trajet supprimé avec succès');
      await loadTrajets();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Marquer comme terminé
  const handleComplete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir marquer ce trajet comme terminé ? Cette action est irréversible.')) return;
    
    try {
      await execute(trajetService.completeTrajet(id));
      toast.success('Trajet marqué comme terminé');
      await loadTrajets();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  // Préparer l'édition
  const handleEdit = (trajet: TrajetPlanifie) => {
    setEditingTrajet(trajet);
    setFormData({
      startingAddress: trajet.startingAddress,
      destinationAddress: trajet.destinationAddress,
      plannedDate: trajet.plannedDate.split('T')[0] + 'T' + trajet.plannedDate.split('T')[1].substring(0, 5),
      description: trajet.description || '',
      type: trajet.type,
      maxCapacity: trajet.maxCapacity || 1,
      estimatedDuration: trajet.estimatedDuration || 60
    });
    setShowCreateForm(true);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'delivery_route': return 'Trajet de livraison';
      case 'shopping_trip': return 'Course/Shopping';
      case 'other': return 'Autre';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mes Trajets Planifiés</h2>
        <button
          onClick={() => {
            setShowCreateForm(true);
            setEditingTrajet(null);
            setFormData({
              startingAddress: '',
              destinationAddress: '',
              plannedDate: '',
              description: '',
              type: 'delivery_route',
              maxCapacity: 1,
              estimatedDuration: 60
            });
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Planifier un trajet
        </button>
      </div>

      {/* Formulaire de création/édition */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {editingTrajet ? 'Modifier le trajet' : 'Planifier un nouveau trajet'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse de départ *
                </label>
                <input
                  type="text"
                  value={formData.startingAddress}
                  onChange={(e) => setFormData({ ...formData, startingAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Paris, France"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse de destination *
                </label>
                <input
                  type="text"
                  value={formData.destinationAddress}
                  onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Lyon, France"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date et heure prévues *
                </label>
                <input
                  type="datetime-local"
                  value={formData.plannedDate}
                  onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de trajet
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="delivery_route">Trajet de livraison</option>
                  <option value="shopping_trip">Course/Shopping</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacité maximale (colis/courses)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxCapacity || ''}
                  onChange={(e) => setFormData({ ...formData, maxCapacity: e.target.value ? parseInt(e.target.value) : 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée estimée (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.estimatedDuration || ''}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value ? parseInt(e.target.value) : 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnel)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Détails supplémentaires sur votre trajet..."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Enregistrement...' : (editingTrajet ? 'Mettre à jour' : 'Créer le trajet')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingTrajet(null);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
              >
                Annuler
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
            <p className="mt-2 text-gray-600">Chargement des trajets...</p>
          </div>
        ) : trajets.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun trajet planifié</p>
            <p className="text-sm text-gray-500">Commencez par planifier votre premier trajet</p>
          </div>
        ) : (
          trajets.map((trajet) => (
            <div key={trajet.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trajet.status)}`}>
                      {trajet.status === 'active' ? 'Actif' : trajet.status === 'completed' ? 'Terminé' : 'Annulé'}
                    </span>
                    <span className="text-sm text-gray-600">{getTypeLabel(trajet.type)}</span>
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
                        <span className="font-medium">Capacité:</span>
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
                
                <div className="flex gap-2 ml-4">
                  {trajet.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleEdit(trajet)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleComplete(trajet.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                        title="Marquer comme terminé"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(trajet.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}