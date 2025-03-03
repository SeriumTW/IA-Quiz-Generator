import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface QuizScoreProps {
  correctAnswers: number
  totalQuestions: number
}

export default function QuizScore({ correctAnswers, totalQuestions }: QuizScoreProps) {
  const score = (correctAnswers / totalQuestions) * 100
  const roundedScore = Math.round(score)

  const getMessage = () => {
    if (score === 100) return "Punteggio perfetto! Congratulazioni!"
    if (score >= 80) return "Ottimo lavoro! Hai fatto un eccellente risultato!"
    if (score >= 60) return "Buon impegno! Sei sulla strada giusta."
    if (score >= 40) return "Non male, ma c'è spazio per migliorare."
    return "Continua ad esercitarti, migliorerai!"
  }

  return (
    <Card className="w-full bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 shadow-lg">
      <CardContent className="space-y-4 p-8">
        <div className="text-center">
          <p className="text-5xl font-bold text-blue-600 dark:text-blue-400">{roundedScore}%</p>
          <p className="text-sm text-blue-500 dark:text-blue-300 mt-2">
            {correctAnswers} su {totalQuestions} corrette
          </p>
        </div>
        <p className="text-center font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/50 p-3 rounded-md">{getMessage()}</p>
      </CardContent>
    </Card>
  )
}
