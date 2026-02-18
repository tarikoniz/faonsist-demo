'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { registerSchema, type RegisterInput } from '@/lib/validators';
import { useAuthStore } from '@/lib/store/auth';
import { ROUTES } from '@/lib/constants';

const DEPARTMENTS = [
    'Yönetim',
    'Proje Yönetimi',
    'Satış & Pazarlama',
    'İnsan Kaynakları',
    'Finans',
    'Muhasebe',
    'Depo & Lojistik',
    'IT',
    'Diğer',
];

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register: registerUser, isLoading, error, clearError } = useAuthStore();

    const form = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            department: '',
            acceptTerms: false,
        },
        mode: 'onChange',
    });

    const password = form.watch('password');

    // Password strength indicators
    const passwordChecks = [
        { label: 'En az 8 karakter', valid: password.length >= 8 },
        { label: 'Bir büyük harf', valid: /[A-Z]/.test(password) },
        { label: 'Bir küçük harf', valid: /[a-z]/.test(password) },
        { label: 'Bir rakam', valid: /[0-9]/.test(password) },
    ];

    const onSubmit = async (data: RegisterInput) => {
        try {
            clearError();
            await registerUser({
                name: data.name,
                email: data.email,
                password: data.password,
                department: data.department,
            });
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
                        <CardTitle className="text-2xl font-bold">Hesap Oluşturun</CardTitle>
                        <CardDescription className="text-muted-foreground mt-2">
                            FaOnSisT platformuna katılın
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

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Ad Soyad</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Adınız Soyadınız"
                                autoComplete="name"
                                {...form.register('name')}
                                className="bg-background"
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                            )}
                        </div>

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

                        {/* Department */}
                        <div className="space-y-2">
                            <Label htmlFor="department">Departman (Opsiyonel)</Label>
                            <Select
                                onValueChange={(value) => form.setValue('department', value)}
                            >
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Departman seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEPARTMENTS.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Şifre</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
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

                            {/* Password Strength Indicators */}
                            {password && (
                                <div className="grid grid-cols-2 gap-2 pt-2">
                                    {passwordChecks.map((check, index) => (
                                        <div key={index} className="flex items-center gap-1.5 text-xs">
                                            {check.valid ? (
                                                <Check className="h-3 w-3 text-green-500" />
                                            ) : (
                                                <X className="h-3 w-3 text-muted-foreground" />
                                            )}
                                            <span className={check.valid ? 'text-green-500' : 'text-muted-foreground'}>
                                                {check.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {form.formState.errors.password && (
                                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    {...form.register('confirmPassword')}
                                    className="bg-background pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {form.formState.errors.confirmPassword && (
                                <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="acceptTerms"
                                checked={form.watch('acceptTerms') === true}
                                onCheckedChange={(checked) => form.setValue('acceptTerms', checked === true)}
                                className="mt-0.5"
                            />
                            <div>
                                <Label htmlFor="acceptTerms" className="text-sm cursor-pointer">
                                    <Link href="/terms" className="text-primary hover:underline">Kullanım Şartları</Link>
                                    {' '}ve{' '}
                                    <Link href="/privacy" className="text-primary hover:underline">Gizlilik Politikası</Link>
                                    'nı kabul ediyorum
                                </Label>
                                {form.formState.errors.acceptTerms && (
                                    <p className="text-sm text-destructive mt-1">{form.formState.errors.acceptTerms.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full btn-glow" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Kayıt Yapılıyor...
                                </>
                            ) : (
                                'Kayıt Ol'
                            )}
                        </Button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Zaten hesabınız var mı?{' '}
                        <Link href="/login" className="text-primary font-medium hover:underline">
                            Giriş Yapın
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
