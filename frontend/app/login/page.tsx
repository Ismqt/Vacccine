"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const { login, user, loading } = useAuth()
  const router = useRouter()



    const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ LoginIdentifier: email, Password: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to login');
      }

      console.log('[LoginPage] User data from API to be passed to AuthContext:', JSON.stringify(data.user, null, 2));
      login(data.token, data.user);

    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-full max-w-md p-8 space-y-4">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Login as Administrator</CardTitle>
            <CardDescription className="text-center">
              You have successfully logged in as an administrator. Please choose your destination.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Button onClick={() => router.push('/dashboard')}>Go to Personal Tutor View</Button>
            <Button onClick={() => router.push('/admin/login')} variant="secondary">Proceed to Admin Portal</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>
              Ingresa tu correo electrónico o tu número de identificación para acceder a tu cuenta.
            </CardDescription>
            {error && <p className="text-sm font-medium text-destructive pt-2">{error}</p>}
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Correo o Identificación</Label>
              <Input
                id="email"
                type="text"
                placeholder="nombre@ejemplo.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/register" className="text-sm text-blue-600 hover:underline">
              ¿No tienes cuenta? Regístrate
            </Link>
            <Button disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Iniciar Sesión
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
