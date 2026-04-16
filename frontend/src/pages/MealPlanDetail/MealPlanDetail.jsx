import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMealPlans } from '../../services/mealPlanService'

const MEALS = ['breakfast', 'lunch', 'dinner']
const MEAL_LABELS = { breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', dinner: '🌙 Dinner' }
const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const MealPlanDetail = () => {
    const { planId } = useParams()
    const navigate = useNavigate()
    const [plan, setPlan] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchPlan()
    }, [])

    const fetchPlan = async () => {
        try {
            const plans = await getMealPlans()
            const found = plans.find(p => p.id === parseInt(planId))
            if (!found) {
                setError('Plan not found')
                return
            }
            setPlan(found)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const getEntry = (day, meal) => {
        if (!plan) return null
        return plan.entries.find(e => e.day_of_week === day && e.meal_type === meal)
    }

    const getTotalMacros = () => {
        if (!plan) return { calories: 0, protein: 0, carbs: 0, fat: 0 }
        return plan.entries.reduce((acc, entry) => {
            if (!entry.recipe) return acc
            return {
                calories: acc.calories + entry.recipe.calories,
                protein: acc.protein + entry.recipe.protein,
                carbs: acc.carbs + entry.recipe.carbs,
                fat: acc.fat + entry.recipe.fat,
            }
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white/80 text-sm">Loading plan...</p>
        </div>
    )

    if (error) return (
        <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">⚠️ {error}</div>
        </div>
    )

    const totals = getTotalMacros()

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">

            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/meal-planner')}
                    className="text-white/70 hover:text-white bg-transparent border-none shadow-none p-0 text-sm"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-bold text-white drop-shadow">
                    📅 Week of {plan.week_start_date}
                </h1>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'Total calories', value: `${totals.calories.toFixed(1)} kcal`, color: 'bg-orange-50 text-orange-600' },
                    { label: 'Total protein', value: `${totals.protein.toFixed(1)}g`, color: 'bg-blue-50 text-blue-600' },
                    { label: 'Total carbs', value: `${totals.carbs.toFixed(1)}g`, color: 'bg-yellow-50 text-yellow-600' },
                    { label: 'Total fat', value: `${totals.fat.toFixed(1)}g`, color: 'bg-green-50 text-green-600' },
                ].map((m, i) => (
                    <div key={i} className={`text-center py-3 px-4 rounded-2xl ${m.color}`}>
                        <p className="text-sm font-bold">{m.value}</p>
                        <p className="text-xs opacity-70">{m.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3">
                {ALL_DAYS.map(day => (
                    <div key={day} className="bg-white/80 backdrop-blur-md rounded-2xl shadow-md overflow-hidden">
                        <div className="bg-indigo-500 px-5 py-3">
                            <h3 className="font-bold text-white text-sm">{day}</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {MEALS.map(meal => {
                                const entry = getEntry(day, meal)
                                return (
                                    <div key={meal} className="flex items-center gap-4 px-5 py-3">
                                        <span className="text-lg w-7 text-center">
                                            {meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙'}
                                        </span>
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-gray-400 mb-0.5">
                                                {MEAL_LABELS[meal].split(' ')[1]}
                                            </p>
                                            {entry ? (
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{entry.recipe.name}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        {[
                                                            { label: `🔥 ${entry.recipe.calories.toFixed(1)} kcal`, color: 'text-orange-500' },
                                                            { label: `💪 ${entry.recipe.protein.toFixed(1)}g`, color: 'text-blue-500' },
                                                            { label: `🍞 ${entry.recipe.carbs.toFixed(1)}g`, color: 'text-yellow-500' },
                                                            { label: `🧈 ${entry.recipe.fat.toFixed(1)}g`, color: 'text-green-500' },
                                                        ].map((m, i) => (
                                                            <span key={i} className={`text-xs font-medium ${m.color}`}>{m.label}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-400 italic">Not assigned</p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <button
                    onClick={() => navigate(`/shopping/${planId}`)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-2xl transition active:scale-95 border-none shadow-md"
                >
                    🛒 Generate shopping list
                </button>
            </div>
        </div>
    )
}

export default MealPlanDetail