'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { trajetService } from '@/services/trajetService'
import { livreurService } from '@/services/livreurService'
import { useToast } from '@/hooks/use-toast'

export default function TestFixes() {
  const [testResults, setTestResults] = useState<string[]>([])
  const { toast } = useToast()

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result])
  }

  const testTrajetEndpoints = async () => {
    try {
      addResult('🧪 Test des endpoints de trajets...')
      
      // Test de récupération des trajets
      const trajets = await trajetService.getTrajetsByLivreur(1)
      addResult(`✅ Trajets récupérés: ${JSON.stringify(trajets).substring(0, 100)}...`)
      
      // Test de récupération des trajets actifs
      const trajetsActifs = await trajetService.getActiveTrajets()
      addResult(`✅ Trajets actifs récupérés: ${JSON.stringify(trajetsActifs).substring(0, 100)}...`)
      
    } catch (error) {
      addResult(`❌ Erreur trajets: ${error}`)
    }
  }

  const testLivreurEndpoints = async () => {
    try {
      addResult('🧪 Test des endpoints livreur...')
      
      // Test de récupération du profil
      const profile = await livreurService.getProfile()
      addResult(`✅ Profil récupéré: ${JSON.stringify(profile).substring(0, 100)}...`)
      
      // Test de récupération des livraisons
      const livraisons = await livreurService.getMyLivraisons()
      addResult(`✅ Livraisons récupérées: ${JSON.stringify(livraisons).substring(0, 100)}...`)
      
    } catch (error) {
      addResult(`❌ Erreur livreur: ${error}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Test des Corrections - Section Livreur</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testTrajetEndpoints}>Test Trajets</Button>
          <Button onClick={testLivreurEndpoints}>Test Livreur</Button>
          <Button variant="outline" onClick={clearResults}>Effacer</Button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">Résultats des tests:</h3>
          {testResults.length === 0 ? (
            <p className="text-gray-500">Aucun test exécuté</p>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">📋 Corrections Apportées:</h3>
          <ul className="text-sm space-y-1">
            <li>✅ Correction des routes API trajets (/trajets/create → /trajets-planifies/create)</li>
            <li>✅ Amélioration de la gestion des erreurs dans planned-routes.tsx</li>
            <li>✅ Correction du mapping des statuts de livraison (scheduled, in_progress, completed, cancelled)</li>
            <li>✅ Filtrage des annonces pour ne montrer que celles disponibles</li>
            <li>✅ Création automatique de conversation lors de l'acceptation d'une livraison</li>
            <li>✅ Suppression immédiate des annonces acceptées de la liste</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}