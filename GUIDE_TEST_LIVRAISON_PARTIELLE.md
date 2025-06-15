# 🧪 Guide de Test - Livraison Partielle

## 📋 Vue d'Ensemble

Ce guide vous explique comment tester toutes les fonctionnalités de livraison partielle dans l'application EcoDeli.

## 🚀 Accès à la Page de Test

### URL d'accès :
```
http://localhost:3000/app_deliveryman/partial-delivery-test
```

### Navigation :
1. Connectez-vous en tant que livreur
2. Accédez à l'URL ci-dessus directement
3. Ou ajoutez un lien dans le menu de navigation

## 🎯 Fonctionnalités Testables

### 1. **Scénarios de Test Automatisés**

#### ✅ Créer une livraison partielle
- **Description** : Teste la création d'une nouvelle livraison avec segments multiples
- **Données de test** :
  - Livraison originale ID: 1
  - Segment 1: Paris Centre → Louvre (30min, 15.50€)
  - Segment 2: Louvre → Arc de Triomphe (25min, 12.00€)
- **Résultat attendu** : Livraison partielle créée avec ID

#### 💰 Calculer le coût
- **Description** : Teste le calcul automatique du coût
- **Données de test** : Segment Paris Centre → Louvre
- **Résultat attendu** : Coût total calculé

#### 📡 Demande WebSocket
- **Description** : Teste l'envoi de demande via WebSocket
- **Résultat attendu** : Message envoyé et confirmé

#### 🤝 Initier coordination
- **Description** : Démarre la coordination entre livreurs
- **Résultat attendu** : Coordination active, chat disponible

#### 👥 Rejoindre coordination
- **Description** : Rejoint une coordination existante
- **Prérequis** : Coordination déjà initiée
- **Résultat attendu** : Participation confirmée

#### 📍 Mettre à jour position
- **Description** : Teste le tracking GPS
- **Résultat attendu** : Position mise à jour en temps réel

### 2. **Interface WebSocket en Temps Réel**

#### État de Connexion
- 🟢 **Connecté** : WebSocket opérationnel
- 🟡 **Connexion...** : En cours de connexion
- 🔴 **Déconnecté** : Problème de connexion

#### Événements Surveillés
- `partial_delivery_request` : Nouvelles demandes
- `delivery_coordination_started` : Coordination démarrée
- `package_handover_confirmed` : Remise confirmée
- `group_chat_message` : Messages de chat
- `location_update` : Mises à jour GPS

### 3. **Coordination de Livraison**

#### Actions Disponibles
- **Confirmer Remise** : Valide le transfert de colis
- **Quitter Coordination** : Sort de la coordination active
- **Voir Informations** : Détails de la coordination

#### Données de Coordination
```json
{
  "livraisonId": 1,
  "currentSegmentId": 1,
  "nextSegmentId": 2,
  "handoverLocation": {
    "latitude": 48.8606,
    "longitude": 2.3376,
    "address": "Point de remise Louvre"
  }
}
```

### 4. **Chat de Groupe**

#### Fonctionnalités
- Messages en temps réel entre livreurs
- Messages système automatiques
- Historique des conversations
- Notifications d'événements

#### Types de Messages
- **Text** : Messages des livreurs
- **System** : Notifications automatiques

## 🔧 Procédure de Test Complète

### Étape 1 : Préparation
```bash
# 1. Démarrer le backend AdonisJS
cd PA_2A_BackEnd
npm run dev

# 2. Démarrer le frontend Next.js
cd PA_2A_FrontEnd
npm run dev

# 3. Accéder à la page de test
http://localhost:3000/app_deliveryman/partial-delivery-test
```

### Étape 2 : Test Séquentiel

1. **Vérifier WebSocket**
   - Onglet "🔌 WebSocket Status"
   - Vérifier statut "Connecté"

2. **Créer Livraison Partielle**
   - Onglet "🎯 Scénarios de Test"
   - Cliquer "Tester" sur "Créer une livraison partielle"
   - Vérifier succès ✅

3. **Calculer Coût**
   - Tester "Calculer le coût"
   - Vérifier montant retourné

4. **Test WebSocket**
   - Tester "Demande WebSocket"
   - Vérifier message dans chat

5. **Initier Coordination**
   - Tester "Initier coordination"
   - Passer à l'onglet "🤝 Coordination"
   - Vérifier livraison active

6. **Rejoindre Coordination**
   - Tester "Rejoindre coordination"
   - Vérifier participation

7. **Test Chat**
   - Onglet "💬 Chat Groupe"
   - Envoyer messages de test
   - Vérifier réception

8. **Confirmer Remise**
   - Dans coordination, cliquer "Confirmer Remise"
   - Vérifier notification système

9. **Test GPS**
   - Tester "Mettre à jour position"
   - Vérifier coordonnées dans résultats

### Étape 3 : Vérification Backend

#### Logs à Surveiller
```bash
# Backend AdonisJS
✅ Livraison partielle créée
✅ WebSocket connecté
✅ Coordination initiée
✅ Message chat reçu
✅ Position mise à jour
```

#### Base de Données
```sql
-- Vérifier les livraisons partielles
SELECT * FROM partial_deliveries;

-- Vérifier les segments
SELECT * FROM delivery_segments;

-- Vérifier les coordinations
SELECT * FROM delivery_coordinations;
```

## 🐛 Résolution de Problèmes

### Problèmes Courants

#### WebSocket Déconnecté
```bash
# Vérifier le serveur WebSocket
netstat -an | grep 3333

# Redémarrer le backend
cd PA_2A_BackEnd
npm run dev
```

#### Erreurs API
```bash
# Vérifier les logs backend
tail -f PA_2A_BackEnd/tmp/logs/app.log

# Vérifier la base de données
psql -d ecodeli_db -c "\dt"
```

#### Tests qui Échouent
1. Vérifier la connexion réseau
2. Contrôler les logs de console (F12)
3. Vérifier l'authentification
4. Redémarrer les serveurs

### Messages d'Erreur Typiques

| Erreur | Cause | Solution |
|--------|-------|----------|
| `WebSocket connection failed` | Backend arrêté | Redémarrer backend |
| `401 Unauthorized` | Token expiré | Se reconnecter |
| `404 Not Found` | Route manquante | Vérifier routes backend |
| `500 Internal Error` | Erreur serveur | Vérifier logs backend |

## 📊 Métriques de Test

### Indicateurs de Succès
- ✅ Tous les scénarios passent
- ✅ WebSocket reste connecté
- ✅ Messages chat en temps réel
- ✅ Coordination fonctionnelle
- ✅ GPS tracking opérationnel

### Performance Attendue
- Création livraison : < 2s
- Calcul coût : < 1s
- Messages WebSocket : < 100ms
- Mise à jour GPS : < 500ms

## 🔄 Tests d'Intégration

### Scénario Multi-Utilisateurs

1. **Ouvrir 2 onglets** :
   - Onglet 1 : Livreur A (initiateur)
   - Onglet 2 : Livreur B (participant)

2. **Livreur A** :
   - Créer livraison partielle
   - Initier coordination
   - Envoyer message chat

3. **Livreur B** :
   - Rejoindre coordination
   - Répondre au chat
   - Confirmer remise

4. **Vérifications** :
   - Messages synchronisés
   - Événements reçus des deux côtés
   - Coordination mise à jour

## 📱 Test Mobile

### Responsive Design
- Tester sur mobile (F12 → mode mobile)
- Vérifier interface tactile
- Contrôler géolocalisation

### Fonctionnalités Mobiles
- GPS natif du navigateur
- Notifications push
- Interface adaptée

## 🚀 Déploiement en Production

### Checklist Avant Déploiement
- [ ] Tous les tests passent
- [ ] WebSocket stable
- [ ] Performance acceptable
- [ ] Sécurité vérifiée
- [ ] Documentation à jour

### Variables d'Environnement
```env
# Frontend
NEXT_PUBLIC_API_URL=https://api.ecodeli.com
NEXT_PUBLIC_WS_URL=wss://api.ecodeli.com

# Backend
WS_PORT=3333
DB_CONNECTION=postgresql
```

## 📞 Support

En cas de problème :
1. Consulter les logs (F12 → Console)
2. Vérifier ce guide
3. Tester avec données minimales
4. Contacter l'équipe technique

---

**🎉 Bonne chance avec vos tests de livraison partielle !**