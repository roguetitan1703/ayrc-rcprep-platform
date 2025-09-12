import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../../lib/api'

const AuthCtx = createContext({ user: null, loading: true, setUser: () => {}, logout: () => {} })

export function AuthProvider({ children }){
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(()=>{
		let mounted = true
		;(async()=>{
			try{
				const token = localStorage.getItem('arc_token')
				if(!token){ if(mounted) setUser(null); return }
				const { data } = await api.get('/users/me')
				if(mounted) setUser(data)
			}catch{ if(mounted) setUser(null) }
			finally{ if(mounted) setLoading(false) }
		})()
		return ()=> { mounted=false }
	},[])

	function logout(){
		try{ localStorage.removeItem('arc_token') }catch{}
		setUser(null)
		// best-effort redirect
		if(typeof window !== 'undefined') window.location.href = '/login'
	}

	return (
		<AuthCtx.Provider value={{ user, loading, setUser, logout }}>
			{children}
		</AuthCtx.Provider>
	)
}

export function useAuth(){
	return useContext(AuthCtx)
}
