import { useState, useEffect } from 'react'
import { getMealPlans, createMealPlan, deleteMealPlan, completeMealPlan } from '../../services/mealPlanService'
import { getRecipes } from '../../services/recipeService'
import { useNavigate } from 'react-router-dom'

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MEALS = ['breakfast', 'lunch', 'dinner']
const MEAL_LABELS = { breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', dinner: '🌙 Dinner' }

const getDaysFromDate = (dateStr) => {
    if (!dateStr) return ALL_DAYS
    const date = new Date(dateStr + 'T00:00:00')
    const jsDay = date.getDay()
    const startIndex = jsDay === 0 ? 6 : jsDay - 1
    return [...ALL_DAYS.slice(startIndex), ...ALL_DAYS.slice(0, startIndex)]
}

const MealPlanner = () => {
    const [plans, setPlans] = useState([])
    const [recipes, setRecipes] = useState([])
    const [weekStart, setWeekStart] = useState('')
    const [entries, setEntries] = useState({})
    const [openDay, setOpenDay] = useState(null)
    const [showForm, setShowForm] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [confirmDelete, setConfirmDelete] = useState(null)
    const navigate = useNavigate()

    const days = getDaysFromDate(weekStart)

    useEffect(() => { fetchData() }, [])

    const fetchData = async () => {
        try {
            const [plansData, recipesData] = await Promise.all([getMealPlans(), getRecipes()])
            setPlans(plansData)
            setRecipes(recipesData)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleEntryChange = (day, meal, recipeId) => {
        setEntries({ ...entries, [`${day}_${meal}`]: recipeId })
    }

    const handleDateChange = (date) => {
        setWeekStart(date)
        setEntries({})
        setOpenDay(getDaysFromDate(date)[0])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const entriesArray = Object.entries(entries)
            .filter(([_, recipeId]) => recipeId)
            .map(([key, recipeId]) => {
                const [day, meal] = key.split('_')
                return { day_of_week: day, meal_type: meal, recipe_id: parseInt(recipeId) }
            })
        try {
            await createMealPlan({ week_start_date: weekStart, entries: entriesArray })
            setWeekStart('')
            setEntries({})
            setShowForm(false)
            fetchData()
        } catch (err) {
            setError(err.message)
        }
    }

    const handleDelete = async (id) => {
        try {
            await deleteMealPlan(id)
            fetchData()
        } catch (err) {
            setError(err.message)
        }
    }

    const getDayCount = (day) => MEALS.filter(meal => entries[`${day}_${meal}`]).length

    return (
        <div className="max-w-3xl mx-auto px-4 py-6">

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-white drop-shadow">📅 Meal Planner</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition active:scale-95 border-none shadow-md ${showForm ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white text-indigo-600 hover:bg-indigo-50'
                        }`}
                >
                    {showForm ? '✕ Cancel' : '+ New plan'}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                    ⚠️ {error}
                </div>
            )}

            {showForm && (
                <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 mb-6 relative z-10">
                    <h2 className="text-lg font-bold text-black mb-4">New weekly plan</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Start date</label>
                            <input
                                type="date"
                                value={weekStart}
                                onChange={e => handleDateChange(e.target.value)}
                                required
                                min={new Date().toISOString().split('T')[0]}
                                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 focus:bg-white transition"
                            />
                        </div>

                        {!weekStart && (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-500 text-center">
                                📅 Select a start date first
                            </div>
                        )}

                        {weekStart && (
                            <div className="flex flex-col gap-3">
                                {days.map(day => (
                                    <div
                                        key={day}
                                        className={`rounded-2xl border-2 transition-all ${openDay === day ? 'border-indigo-400 shadow-md' : 'border-transparent'
                                            }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenDay(openDay === day ? null : day)}
                                            className={`w-full flex items-center justify-between px-5 py-4 border-none shadow-none text-left transition rounded-2xl ${openDay === day ? 'bg-indigo-500' : 'bg-white/60 hover:bg-white/80'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${openDay === day ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                                                    }`}>
                                                    {day.slice(0, 2)}
                                                </div>
                                                <span className={`font-semibold text-sm ${openDay === day ? 'text-white' : 'text-gray-700'}`}>
                                                    {day}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getDayCount(day) > 0 && (
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${openDay === day ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600'
                                                        }`}>
                                                        {getDayCount(day)} / 3
                                                    </span>
                                                )}
                                                <span className={`text-xs ${openDay === day ? 'text-white/70' : 'text-gray-400'}`}>
                                                    {openDay === day ? '▲' : '▼'}
                                                </span>
                                            </div>
                                        </button>

                                        {openDay === day && (
                                            <div className="px-5 pb-4 pt-3 bg-white rounded-b-2xl flex flex-col gap-3">
                                                {MEALS.map(meal => (
                                                    <div key={meal} className="flex items-center gap-3">
                                                        <span className="text-lg w-7 text-center">
                                                            {meal === 'breakfast' ? '🌅' : meal === 'lunch' ? '☀️' : '🌙'}
                                                        </span>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-semibold text-gray-400 mb-1">
                                                                {MEAL_LABELS[meal].split(' ')[1]}
                                                            </p>
                                                            <select
                                                                value={entries[`${day}_${meal}`] || ''}
                                                                onChange={e => handleEntryChange(day, meal, e.target.value)}
                                                                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:border-indigo-400 transition"
                                                            >
                                                                <option value="">— Not assigned —</option>
                                                                {recipes.map(r => (
                                                                    <option key={r.id} value={r.id}>{r.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 rounded-xl transition active:scale-95 border-none"
                        >
                            Save plan
                        </button>
                    </form>
                </div>
            )}

            <div className="flex flex-col gap-3 relative z-0">
                <h2 className="text-lg font-bold text-white drop-shadow mb-1">Saved plans</h2>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        <p className="text-white/80 text-sm">Loading plans...</p>
                    </div>
                ) : plans.length === 0 ? (
                    <div className="rounded-2xl text-center py-16 text-xl text-white/90 bg-black/40">
                        No plans yet. Create your first one!
                    </div>
                ) : (
                    plans.map(plan => (
                        <div key={plan.id} className={`backdrop-blur-md rounded-2xl shadow-md p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${plan.completed ? 'bg-green-50/80' : 'bg-white/80'
                            }`}>
                            <div>
                                <div className="flex items-center gap-2">
                                    {plan.completed && <span className="text-green-500">✅</span>}
                                    <h4 className="font-bold text-gray-800">📅 Week of {plan.week_start_date}</h4>
                                </div>
                                <p className="text-gray-500 text-sm mt-0.5">{plan.entries.length} meals planned</p>
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => navigate(`/meal-planner/${plan.id}`)}
                                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-sm font-medium rounded-xl transition border-none shadow-none"
                                >
                                    View
                                </button>
                                <button
                                    onClick={() => navigate(`/shopping/${plan.id}`)}
                                    className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 text-sm font-medium rounded-xl transition border-none shadow-none"
                                >
                                    Shopping list
                                </button>
                                {plan.completed && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await completeMealPlan(plan.id)
                                                fetchData()
                                            } catch (err) {
                                                setError(err.message)
                                            }
                                        }}
                                        className="px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-600 text-sm font-medium rounded-xl transition border-none shadow-none"
                                    >
                                        Mark incomplete
                                    </button>
                                )}
                                <button
                                    onClick={() => setConfirmDelete(plan.id)}
                                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-500 text-sm font-medium rounded-xl transition border-none shadow-none"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}

                {confirmDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
                        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center flex flex-col gap-4">
                            <div className="text-5xl">🗑️</div>
                            <h3 className="text-xl font-bold text-gray-800">Delete plan?</h3>
                            <p className="text-gray-500 text-sm">This action cannot be undone.</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDelete(null)}
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition border-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => { handleDelete(confirmDelete); setConfirmDelete(null) }}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition border-none"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

export default MealPlanner