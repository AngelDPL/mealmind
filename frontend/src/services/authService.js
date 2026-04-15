import { get, post, put, patch } from './api'

export const register = async (data) => post('/auth/register', data)

export const login = async (data) => post('/auth/login', data)

export const getMe = async () => get('/auth/me')

export const updateInfo = async (data) => put('/auth/update', data)

export const changePassword = async (data) => patch('/auth/change-password', data)