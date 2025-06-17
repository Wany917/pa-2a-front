'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Package, Users, MessageCircle, Clock, CheckCircle, AlertCircle, Send, Zap } from 'lucide-react';
import { PartialDeliveryService } from '@/services/partial-delivery.service';
import { livreurService } from '@/services/livreurService';
import { usePartialDeliveryWebSocket } from '@/hooks/use-partial-delivery-websocket';
import { toast } from 'sonner';
import DeliverymanLayout from '@/components/deliveryman/layout';
import { Livraison } from '@/types/api';
import SmartPartialDeliveryLivreur from '@/components/deliveryman/smart-partial-delivery-livreur';

interface PartialDelivery {
  id: number;
  livraisonId: number;
  status: string;
  segments: any[];
  createdAt: string;
}

interface CoordinationInfo {
  id: number;
  livraisonId: number;
  currentSegment: any;
  nextSegment?: any;
  handoverLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  estimatedHandoverTime: string;
  status: string;
  createdAt: string;
}

export default function PartialDeliveriesPage() {
  const [partialDeliveries, setPartialDeliveries] = useState<PartialDelivery[]>([]);
  const [coordinationInfo, setCoordinationInfo] = useState<CoordinationInfo[]>([]);
  const [assignedDeliveries, setAssignedDeliveries] = useState<Livraison[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<number | null>(null);
  const [selectedLivraison, setSelectedLivraison] = useState<Livraison | null>(null);
  const [loading, setLoading] = useState(false);
  const [newDeliveryForm, setNewDeliveryForm] = useState({
    livraisonId: '',
    segments: [{
      startLatitude: '',
      startLongitude: '',
      endLatitude: '',
      endLongitude: '',
      distance: ''
    }]
  });
  const [coordinationForm, setCoordinationForm] = useState({
    livraisonId: '',
    currentSegmentId: '',
    nextSegmentId: '',
    handoverLocation: {
      latitude: '',
      longitude: '',
      address: ''
    },
    estimatedHandoverTime: ''
  });
  const [locationForm, setLocationForm] = useState({
    livraisonId: '',
    segmentId: '',
    latitude: '',
    longitude: ''
  });
  const [chatMessage, setChatMessage] = useState('');
  const { isAuthenticated, userRole, userData } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);

  // Obtenir l'ID utilisateur depuis le contexte d'authentification
  const getUserId = () => {
    if (userData?.id) {
      return userData.id;
    }
    
    // Fallback: essayer de récupérer depuis le localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        return user.id;
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
      }
    }
    
    return null;
  };

  const userId = getUserId();

  const {
    isConnected,
    requestPartialDelivery,
    proposeSegment,
    acceptSegmentProposal,
    updateSegmentStatus,
    sendGroupChatMessage,
    updateLocation,
    groupChatMessages,
    coordinationData
  } = usePartialDeliveryWebSocket({
    userId: userId || 0,
    userType: 'livreur',
    onPartialDeliveryRequest: (event) => {
      console.log('Nouvelle demande de livraison partielle:', event);
    },
    onSegmentProposal: (event) => {
      console.log('Nouvelle proposition de segment:', event);
    },
    onSegmentAccepted: (event) => {
      console.log('Segment accepté:', event);
    },
    onSegmentStatusUpdate: (event) => {
      console.log('Statut du segment mis à jour:', event);
    },
    onDeliveryCoordination: (event) => {
      console.log('Coordination de livraison:', event);
      setCoordinationInfo(prev => [...prev, event]);
    },
    onPackageHandover: (event) => {
      console.log('Remise de colis:', event);
    },
    onGroupChatMessage: (event) => {
      console.log('Message de chat de groupe:', event);
      setMessages(prev => [...prev, event]);
    },
    onSegmentAvailable: (segment) => {
      console.log('Nouveau segment disponible:', segment);
    }
  });

  useEffect(() => {
    if (isAuthenticated && userRole === 'delivery_man' && userId) {
      loadPartialDeliveries();
    }
  }, [isAuthenticated, userRole, userId]);

  useEffect(() => {
    if (groupChatMessages.length > 0) {
      setMessages(groupChatMessages);
    }
  }, [groupChatMessages]);

  useEffect(() => {
    if (coordinationData) {
      setCoordinationInfo(prev => [...prev, coordinationData]);
    }
  }, [coordinationData]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vous devez être connecté pour accéder à cette page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (userRole !== 'delivery_man') {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Accès réservé aux livreurs.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Impossible de récupérer les informations utilisateur.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const loadPartialDeliveries = async () => {
    setLoading(true);
    try {
      // Charger les livraisons partielles
      const partialResponse = await PartialDeliveryService.getPartialDeliveries();
      if (partialResponse.success && partialResponse.data) {
        setPartialDeliveries(partialResponse.data);
      }
      
      // Charger les livraisons assignées
      try {
        const assignedResponse = await livreurService.getMyLivraisons();
        if (assignedResponse.success && assignedResponse.data && Array.isArray(assignedResponse.data)) {
          // Filtrer les livraisons en cours ou acceptées
          const activeLivraisons = assignedResponse.data.filter(
            (livraison: Livraison) => ['accepted', 'in_progress', 'picked_up'].includes(livraison.status || '')
          );
          setAssignedDeliveries(activeLivraisons);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des livraisons assignées:', error);
        // Essayer avec la méthode alternative
        try {
          const availableResponse = await livreurService.getAvailableLivraisons();
          if (availableResponse.success && availableResponse.data && Array.isArray(availableResponse.data)) {
            setAssignedDeliveries(availableResponse.data.slice(0, 5)); // Limiter à 5 pour test
          }
        } catch (fallbackError) {
          console.error('Erreur fallback:', fallbackError);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartialDelivery = async () => {
    if (!newDeliveryForm.livraisonId) {
      toast.error('Veuillez sélectionner une livraison');
      return;
    }

    setLoading(true);
    try {
      const segments = newDeliveryForm.segments.map(segment => ({
        startLatitude: parseFloat(segment.startLatitude),
        startLongitude: parseFloat(segment.startLongitude),
        endLatitude: parseFloat(segment.endLatitude),
        endLongitude: parseFloat(segment.endLongitude),
        distance: parseFloat(segment.distance)
      }));

      const response = await PartialDeliveryService.createPartialDelivery({
        livraisonId: parseInt(newDeliveryForm.livraisonId),
        segments
      });

      if (response.success) {
        toast.success('Livraison partielle créée avec succès');
        loadPartialDeliveries();
        setNewDeliveryForm({
          livraisonId: '',
          segments: [{
            startLatitude: '',
            startLongitude: '',
            endLatitude: '',
            endLongitude: '',
            distance: ''
          }]
        });
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      toast.error('Erreur lors de la création de la livraison partielle');
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateCoordination = async () => {
    if (!coordinationForm.livraisonId || !coordinationForm.currentSegmentId) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    setLoading(true);
    try {
      const response = await PartialDeliveryService.initiateCoordination({
        livraisonId: parseInt(coordinationForm.livraisonId),
        currentSegmentId: parseInt(coordinationForm.currentSegmentId),
        nextSegmentId: parseInt(coordinationForm.nextSegmentId),
        handoverLocation: {
          latitude: parseFloat(coordinationForm.handoverLocation.latitude),
          longitude: parseFloat(coordinationForm.handoverLocation.longitude),
          address: coordinationForm.handoverLocation.address
        },
        estimatedHandoverTime: coordinationForm.estimatedHandoverTime
      });

      if (response.success) {
        toast.success('Coordination initiée avec succès');
        loadPartialDeliveries();
      }
    } catch (error) {
      console.error('Erreur lors de l\'initiation de la coordination:', error);
      toast.error('Erreur lors de l\'initiation de la coordination');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLocation = async () => {
    if (!locationForm.livraisonId || !locationForm.segmentId) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    try {
      await updateLocation({
        livraisonId: parseInt(locationForm.livraisonId),
        segmentId: parseInt(locationForm.segmentId),
        location: {
          latitude: parseFloat(locationForm.latitude),
          longitude: parseFloat(locationForm.longitude)
        }
      });
      
      toast.success('Position mise à jour');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la position:', error);
      toast.error('Erreur lors de la mise à jour de la position');
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    sendGroupChatMessage({
      livraisonId: selectedDelivery || 1,
      message: chatMessage,
      senderId: 1 // À remplacer par l'ID du livreur connecté
    });
    
    setChatMessage('');
  };

  const addSegment = () => {
    setNewDeliveryForm(prev => ({
      ...prev,
      segments: [...prev.segments, {
        startLatitude: '',
        startLongitude: '',
        endLatitude: '',
        endLongitude: '',
        distance: ''
      }]
    }));
  };

  const removeSegment = (index: number) => {
    setNewDeliveryForm(prev => ({
      ...prev,
      segments: prev.segments.filter((_, i) => i !== index)
    }));
  };

  return (
    <DeliverymanLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Livraisons Partielles</h1>
            <p className="text-muted-foreground">Gestion des livraisons collaboratives</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? 'Connecté' : 'Déconnecté'}
            </Badge>
            <Button onClick={loadPartialDeliveries} disabled={loading}>
              {loading ? 'Chargement...' : 'Actualiser'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="deliveries" className="space-y-4">
          <TabsList>
            <TabsTrigger value="deliveries">Mes Livraisons</TabsTrigger>
            <TabsTrigger value="smart" className="flex items-center space-x-1">
              <Zap className="h-4 w-4" />
              <span>Smart</span>
            </TabsTrigger>
            <TabsTrigger value="create">Créer</TabsTrigger>
            <TabsTrigger value="coordination">Coordination</TabsTrigger>
            <TabsTrigger value="tracking">Suivi GPS</TabsTrigger>
            <TabsTrigger value="chat">Chat Groupe</TabsTrigger>
          </TabsList>

          <TabsContent value="deliveries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Livraisons Partielles Actives</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Chargement...</div>
                ) : partialDeliveries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune livraison partielle active
                  </div>
                ) : (
                  <div className="space-y-4">
                    {partialDeliveries.map((delivery) => (
                      <Card key={delivery.id} className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => setSelectedDelivery(delivery.id)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold">Livraison #{delivery.livraisonId}</h3>
                              <p className="text-sm text-muted-foreground">
                                {delivery.segments.length} segment(s) • Créée le {new Date(delivery.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="outline">
                              {delivery.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="smart" className="space-y-4">
            <SmartPartialDeliveryLivreur />
          </TabsContent>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Créer une Livraison Partielle</CardTitle>
                <CardDescription>
                  Divisez une livraison en plusieurs segments pour une collaboration efficace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="livraisonSelect">Sélectionner une livraison assignée</Label>
                  <Select
                    value={selectedLivraison?.id.toString() || ''}
                    onValueChange={(value) => {
                      const livraison = assignedDeliveries.find(l => l.id.toString() === value);
                      if (livraison) {
                        setSelectedLivraison(livraison);
                        setNewDeliveryForm(prev => ({ ...prev, livraisonId: value }));
                        // Pré-remplir les coordonnées si disponibles
                        if (livraison.adresseDepart && livraison.adresseArrivee) {
                          const newSegments = [...prev.segments];
                          if (newSegments[0]) {
                            newSegments[0] = {
                              startLatitude: livraison.adresseDepart.latitude?.toString() || '',
                              startLongitude: livraison.adresseDepart.longitude?.toString() || '',
                              endLatitude: livraison.adresseArrivee.latitude?.toString() || '',
                              endLongitude: livraison.adresseArrivee.longitude?.toString() || '',
                              distance: livraison.distance?.toString() || ''
                            };
                          }
                          setNewDeliveryForm(prev => ({ ...prev, segments: newSegments }));
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisissez une livraison" />
                    </SelectTrigger>
                    <SelectContent>
                      {assignedDeliveries.map((livraison) => (
                        <SelectItem key={livraison.id} value={livraison.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">Livraison #{livraison.id}</span>
                            <span className="text-sm text-gray-500">
                              {livraison.adresseDepart?.ville} → {livraison.adresseArrivee?.ville}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedLivraison && (
                  <Card className="bg-blue-50">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Détails de la livraison sélectionnée</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Départ:</strong> {selectedLivraison.adresseDepart?.adresse}, {selectedLivraison.adresseDepart?.ville}</p>
                        <p><strong>Arrivée:</strong> {selectedLivraison.adresseArrivee?.adresse}, {selectedLivraison.adresseArrivee?.ville}</p>
                        <p><strong>Distance:</strong> {selectedLivraison.distance} km</p>
                        <p><strong>Prix:</strong> {selectedLivraison.prix} €</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Segments</h3>
                    <Button onClick={addSegment} variant="outline" size="sm">
                      <Package className="h-4 w-4 mr-2" />
                      Ajouter un segment
                    </Button>
                  </div>

                  {newDeliveryForm.segments.map((segment, index) => (
                    <Card key={index}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Segment {index + 1}</h4>
                          {newDeliveryForm.segments.length > 1 && (
                            <Button onClick={() => removeSegment(index)} variant="destructive" size="sm">
                              Supprimer
                            </Button>
                          )}
                        </div>

                        {selectedLivraison && index === 0 ? (
                          // Affichage des adresses pré-remplies pour le premier segment
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-green-50 rounded-lg">
                                <Label className="text-sm font-medium text-green-800">Point de départ</Label>
                                <p className="text-sm text-green-700 mt-1">
                                  {selectedLivraison.adresseDepart?.adresse}<br />
                                  {selectedLivraison.adresseDepart?.ville}
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                  {selectedLivraison.adresseDepart?.latitude}, {selectedLivraison.adresseDepart?.longitude}
                                </p>
                              </div>
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <Label className="text-sm font-medium text-blue-800">Point d'arrivée</Label>
                                <p className="text-sm text-blue-700 mt-1">
                                  {selectedLivraison.adresseArrivee?.adresse}<br />
                                  {selectedLivraison.adresseArrivee?.ville}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                  {selectedLivraison.adresseArrivee?.latitude}, {selectedLivraison.adresseArrivee?.longitude}
                                </p>
                              </div>
                            </div>
                            <div>
                              <Label>Distance estimée (km)</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={segment.distance}
                                onChange={(e) => {
                                  const newSegments = [...newDeliveryForm.segments];
                                  newSegments[index].distance = e.target.value;
                                  setNewDeliveryForm(prev => ({ ...prev, segments: newSegments }));
                                }}
                                placeholder="Distance en km"
                              />
                            </div>
                          </div>
                        ) : (
                          // Saisie manuelle pour les autres segments
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label>Latitude de départ</Label>
                              <Input
                                type="number"
                                step="any"
                                value={segment.startLatitude}
                                onChange={(e) => {
                                  const newSegments = [...newDeliveryForm.segments];
                                  newSegments[index].startLatitude = e.target.value;
                                  setNewDeliveryForm(prev => ({ ...prev, segments: newSegments }));
                                }}
                                placeholder="Latitude de départ"
                              />
                            </div>
                            <div>
                              <Label>Longitude de départ</Label>
                              <Input
                                type="number"
                                step="any"
                                value={segment.startLongitude}
                                onChange={(e) => {
                                  const newSegments = [...newDeliveryForm.segments];
                                  newSegments[index].startLongitude = e.target.value;
                                  setNewDeliveryForm(prev => ({ ...prev, segments: newSegments }));
                                }}
                                placeholder="Longitude de départ"
                              />
                            </div>
                            <div>
                              <Label>Latitude d'arrivée</Label>
                              <Input
                                type="number"
                                step="any"
                                value={segment.endLatitude}
                                onChange={(e) => {
                                  const newSegments = [...newDeliveryForm.segments];
                                  newSegments[index].endLatitude = e.target.value;
                                  setNewDeliveryForm(prev => ({ ...prev, segments: newSegments }));
                                }}
                                placeholder="Latitude d'arrivée"
                              />
                            </div>
                            <div>
                              <Label>Longitude d'arrivée</Label>
                              <Input
                                type="number"
                                step="any"
                                value={segment.endLongitude}
                                onChange={(e) => {
                                  const newSegments = [...newDeliveryForm.segments];
                                  newSegments[index].endLongitude = e.target.value;
                                  setNewDeliveryForm(prev => ({ ...prev, segments: newSegments }));
                                }}
                                placeholder="Longitude d'arrivée"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label>Distance (km)</Label>
                              <Input
                                type="number"
                                step="0.1"
                                value={segment.distance}
                                onChange={(e) => {
                                  const newSegments = [...newDeliveryForm.segments];
                                  newSegments[index].distance = e.target.value;
                                  setNewDeliveryForm(prev => ({ ...prev, segments: newSegments }));
                                }}
                                placeholder="Distance en km"
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button onClick={handleCreatePartialDelivery} disabled={loading} className="w-full">
                  {loading ? 'Création...' : 'Créer la Livraison Partielle'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coordination" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Initier une Coordination</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>ID Livraison</Label>
                      <Input
                        type="number"
                        value={coordinationForm.livraisonId}
                        onChange={(e) => setCoordinationForm(prev => ({ ...prev, livraisonId: e.target.value }))}
                        placeholder="ID de la livraison"
                      />
                    </div>
                    <div>
                      <Label>Segment Actuel</Label>
                      <Input
                        type="number"
                        value={coordinationForm.currentSegmentId}
                        onChange={(e) => setCoordinationForm(prev => ({ ...prev, currentSegmentId: e.target.value }))}
                        placeholder="ID du segment actuel"
                      />
                    </div>
                    <div>
                      <Label>Segment Suivant</Label>
                      <Input
                        type="number"
                        value={coordinationForm.nextSegmentId}
                        onChange={(e) => setCoordinationForm(prev => ({ ...prev, nextSegmentId: e.target.value }))}
                        placeholder="ID du segment suivant"
                      />
                    </div>
                    <div>
                      <Label>Heure Estimée</Label>
                      <Input
                        type="datetime-local"
                        value={coordinationForm.estimatedHandoverTime}
                        onChange={(e) => setCoordinationForm(prev => ({ ...prev, estimatedHandoverTime: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Lieu de Remise</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="number"
                        step="any"
                        value={coordinationForm.handoverLocation.latitude}
                        onChange={(e) => setCoordinationForm(prev => ({
                          ...prev,
                          handoverLocation: {
                            ...prev.handoverLocation,
                            latitude: e.target.value
                          }
                        }))}
                        placeholder="Latitude"
                      />
                      <Input
                        type="number"
                        step="any"
                        value={coordinationForm.handoverLocation.longitude}
                        onChange={(e) => setCoordinationForm(prev => ({
                          ...prev,
                          handoverLocation: {
                            ...prev.handoverLocation,
                            longitude: e.target.value
                          }
                        }))}
                        placeholder="Longitude"
                      />
                    </div>
                    <Input
                      value={coordinationForm.handoverLocation.address}
                      onChange={(e) => setCoordinationForm(prev => ({
                        ...prev,
                        handoverLocation: {
                          ...prev.handoverLocation,
                          address: e.target.value
                        }
                      }))}
                      placeholder="Adresse du lieu de remise"
                    />
                  </div>

                  <Button onClick={handleInitiateCoordination} disabled={loading} className="w-full">
                    {loading ? 'Initiation...' : 'Initier la Coordination'}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Coordinations Actives</CardTitle>
                </CardHeader>
                <CardContent>
                  {coordinationInfo.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Aucune coordination active
                    </div>
                  ) : (
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {coordinationInfo.map((coord) => (
                          <Card key={coord.id}>
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Livraison #{coord.livraisonId}</span>
                                <Badge variant="outline">{coord.status}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Remise prévue: {new Date(coord.estimatedHandoverTime).toLocaleString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {coord.handoverLocation.address}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Mise à Jour de Position</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>ID Livraison</Label>
                    <Input
                      type="number"
                      value={locationForm.livraisonId}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, livraisonId: e.target.value }))}
                      placeholder="ID de la livraison"
                    />
                  </div>
                  <div>
                    <Label>ID Segment</Label>
                    <Input
                      type="number"
                      value={locationForm.segmentId}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, segmentId: e.target.value }))}
                      placeholder="ID du segment"
                    />
                  </div>
                  <div>
                    <Label>Latitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={locationForm.latitude}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, latitude: e.target.value }))}
                      placeholder="Latitude actuelle"
                    />
                  </div>
                  <div>
                    <Label>Longitude</Label>
                    <Input
                      type="number"
                      step="any"
                      value={locationForm.longitude}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, longitude: e.target.value }))}
                      placeholder="Longitude actuelle"
                    />
                  </div>
                </div>

                <Button onClick={handleUpdateLocation} className="w-full">
                  <MapPin className="h-4 w-4 mr-2" />
                  Mettre à Jour la Position
                </Button>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    La position sera partagée avec les autres livreurs participant à cette livraison.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="space-y-4">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span>Chat de Groupe - Coordination Livraison</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{messages.length > 0 ? `${new Set(messages.map(m => m.senderId)).size} livreurs connectés` : 'En attente de connexions'}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-12">
                      <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">
                        Aucun message pour le moment
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Commencez la conversation avec les autres livreurs participant à cette livraison partielle.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, index) => {
                        const isCurrentUser = msg.senderId === userId?.toString();
                        const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId;
                        
                        return (
                          <div key={index} className={`flex items-start space-x-3 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {showAvatar && (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                isCurrentUser 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {isCurrentUser ? 'Moi' : `L${msg.senderId}`}
                              </div>
                            )}
                            <div className={`flex-1 max-w-xs ${isCurrentUser ? 'text-right' : 'text-left'} ${!showAvatar ? (isCurrentUser ? 'mr-11' : 'ml-11') : ''}`}>
                              {showAvatar && (
                                <div className={`text-xs text-muted-foreground mb-1 ${
                                  isCurrentUser ? 'text-right' : 'text-left'
                                }`}>
                                  {isCurrentUser ? 'Vous' : `Livreur #${msg.senderId}`}
                                </div>
                              )}
                              <div className={`inline-block p-3 rounded-lg max-w-full break-words ${
                                isCurrentUser 
                                  ? 'bg-blue-500 text-white rounded-br-sm' 
                                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                              }`}>
                                <p className="text-sm leading-relaxed">{msg.message}</p>
                                <div className={`text-xs mt-1 opacity-70 ${
                                  isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>

                <div className="border-t p-4">
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <Input
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Tapez votre message de coordination..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!chatMessage.trim()}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Appuyez sur Entrée pour envoyer • Shift + Entrée pour une nouvelle ligne
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DeliverymanLayout>
  );
}