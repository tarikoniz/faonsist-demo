'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { loginSchema, type LoginInput } from '@/lib/validators';
import { useAuthStore } from '@/lib/store/auth';
import { ROUTES } from '@/lib/constants';

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error, clearError } = useAuthStore();

    const form = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
            rememberMe: false,
        },
    });

    const onSubmit = async (data: LoginInput) => {
        try {
            clearError();
            await login(data.email, data.password);
            router.push(ROUTES.MESSAGES);
        } catch (err) {
            // Error is handled in store
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />

            <Card className="relative w-full max-w-md bg-surface border-border">
                <CardHeader className="text-center space-y-4">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-glow">
                            <span className="text-2xl font-bold text-primary-foreground">F</span>
                        </div>
                    </div>

                    <div>
                        <CardTitle className="text-2xl font-bold">Hoş Geldiniz</CardTitle>
                        <CardDescription className="text-muted-foreground mt-2">
                            FaOnSisT hesabınıza giriş yapın
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Error Alert */}
                        {error && (
                            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">E-posta Adresi</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="ornek@sirket.com"
                                autoComplete="email"
                                {...form.register('email')}
                                className="bg-background"
                            />
                            {form.formState.errors.email && (
                                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Şifre</Label>
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-primary hover:underline"
                                >
                                    Şifremi Unuttum
                                </Link>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    {...form.register('password')}
                                    className="bg-background pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {form.formState.errors.password && (
                                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="rememberMe"
                                checked={form.watch('rememberMe')}
                                onCheckedChange={(checked) => form.setValue('rememberMe', checked as boolean)}
                            />
                            <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                                Beni hatırla
                            </Label>
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full btn-glow" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Giriş Yapılıyor...
                                </>
                            ) : (
                                'Giriş Yap'
                            )}
                        </Button>

                        {/* Demo Credentials */}
                        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-xs text-muted-foreground text-center">
                                <span className="font-medium text-foreground">Demo Hesap:</span><br />
                                E-posta: demo@faonsist.com<br />
                                Şifre: demo123
                            </p>
                        </div>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Hesabınız yok mu?{' '}
                        <Link href="/register" className="text-primary font-medium hover:underline">
                            Kayıt Olun
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
