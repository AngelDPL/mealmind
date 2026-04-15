import { get } from './api'

export const searchFoods = async (query = '') => get(`/foods/?q=${encodeURIComponent(query)}`)

export const getCategories = async () => get('/foods/categories')