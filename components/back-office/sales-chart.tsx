"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SalesChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx) return

    // Données fictives pour le graphique
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]
    const salesData = [1200, 1900, 3000, 5000, 4000, 6500, 7000, 6000, 8000, 9500, 10000, 11000]

    // Dessiner le graphique
    const drawChart = () => {
      if (!ctx || !canvasRef.current) return

      const width = canvasRef.current.width
      const height = canvasRef.current.height
      const padding = 40
      const chartWidth = width - padding * 2
      const chartHeight = height - padding * 2
      const maxValue = Math.max(...salesData) * 1.1
      const barWidth = (chartWidth / salesData.length) * 0.6
      const barSpacing = (chartWidth / salesData.length) * 0.4

      // Effacer le canvas
      ctx.clearRect(0, 0, width, height)

      // Dessiner l'axe Y
      ctx.beginPath()
      ctx.moveTo(padding, padding)
      ctx.lineTo(padding, height - padding)
      ctx.strokeStyle = "#e2e8f0"
      ctx.stroke()

      // Dessiner l'axe X
      ctx.beginPath()
      ctx.moveTo(padding, height - padding)
      ctx.lineTo(width - padding, height - padding)
      ctx.strokeStyle = "#e2e8f0"
      ctx.stroke()

      // Dessiner les barres
      salesData.forEach((value, index) => {
        const barHeight = (value / maxValue) * chartHeight
        const x = padding + index * (barWidth + barSpacing) + barSpacing / 2
        const y = height - padding - barHeight

        // Dessiner la barre
        ctx.fillStyle = "#3b82f6"
        ctx.fillRect(x, y, barWidth, barHeight)

        // Ajouter le mois
        ctx.fillStyle = "#64748b"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(months[index], x + barWidth / 2, height - padding + 20)

        // Ajouter la valeur
        ctx.fillStyle = "#64748b"
        ctx.font = "10px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`€${value}`, x + barWidth / 2, y - 5)
      })
    }

    drawChart()

    // Redessiner le graphique lors du redimensionnement
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth
        canvasRef.current.height = canvasRef.current.offsetHeight
        drawChart()
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Ventes</CardTitle>
        <Select defaultValue="year">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="year">Cette année</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pl-2">
        <canvas ref={canvasRef} width={800} height={400} className="w-full h-[300px]" />
      </CardContent>
    </Card>
  )
}

