"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/types"
import type { User } from "@supabase/supabase-js"
import { TooltipProvider } from "@/components/ui/tooltip"

interface AuthContext {
  user: User | null
  profile: Profile | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContext>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
})

export const useAuth = () => useContext(AuthContext)

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()
    setProfile(data)
  }

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id)
  }

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      if (user) await fetchProfile(user.id)
      setLoading(false)
    }
    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        await fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <TooltipProvider>{children}</TooltipProvider>
  </AuthProvider>
)
