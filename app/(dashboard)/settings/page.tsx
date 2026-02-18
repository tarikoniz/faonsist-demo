'use client';

import { useState } from 'react';
import {
    Settings, User, Bell, Shield, Palette, Globe,
    Save, ChevronRight
} from 'lucide-react';
import { ShellLayout } from '@/components/shell/shell-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth';

const SETTINGS_TABS = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'security', label: 'Güvenlik', icon: Shield },
    { id: 'appearance', label: 'Görünüm', icon: Palette },
    { id: 'language', label: 'Dil & Bölge', icon: Globe },
];

export default function SettingsPage() {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState('profile');

    // Form states
    const [profileForm, setProfileForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        department: user?.department || '',
        bio: '',
    });

    const [notificationSettings, setNotificationSettings] = useState({
        email: true,
        push: true,
        desktop: true,
        sound: true,
        mentions: true,
        directMessages: true,
        channelMessages: false,
        projectUpdates: true,
        stockAlerts: true,
        dealUpdates: true,
    });

    const [securitySettings, setSecuritySettings] = useState({
        twoFactor: false,
        sessionTimeout: '30',
        loginNotifications: true,
    });

    const [appearanceSettings, setAppearanceSettings] = useState({
        theme: 'dark',
        fontSize: 'normal',
        compactMode: false,
    });

    return (
        <ShellLayout>
            <div className="flex flex-col h-full bg-background">
                {/* Header */}
                <div className="px-6 py-4 border-b border-border bg-surface/30">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Settings className="h-6 w-6 text-primary" />
                            Ayarlar
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Hesap ve uygulama ayarlarınızı yönetin
                        </p>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-64 border-r border-border bg-surface/30 p-4">
                        <nav className="space-y-1">
                            {SETTINGS_TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                        activeTab === tab.id
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    )}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <ScrollArea className="flex-1">
                        <div className="p-6 max-w-2xl">
                            {/* Profile Settings */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <Card className="bg-surface border-border">
                                        <CardHeader>
                                            <CardTitle>Profil Bilgileri</CardTitle>
                                            <CardDescription>
                                                Kişisel bilgilerinizi güncelleyin
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Avatar */}
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-20 w-20">
                                                    <AvatarImage src={user?.avatar} />
                                                    <AvatarFallback className="text-xl">
                                                        {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <Button variant="outline" size="sm">Fotoğraf Değiştir</Button>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        JPG, PNG veya GIF. Maksimum 2MB.
                                                    </p>
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Form Fields */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Ad Soyad</Label>
                                                    <Input
                                                        id="name"
                                                        value={profileForm.name}
                                                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                        className="bg-background"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="email">E-posta</Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={profileForm.email}
                                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                                        className="bg-background"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Telefon</Label>
                                                    <Input
                                                        id="phone"
                                                        value={profileForm.phone}
                                                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                        className="bg-background"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="department">Departman</Label>
                                                    <Select defaultValue={profileForm.department}>
                                                        <SelectTrigger className="bg-background">
                                                            <SelectValue placeholder="Departman seçin" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Yönetim">Yönetim</SelectItem>
                                                            <SelectItem value="Proje Yönetimi">Proje Yönetimi</SelectItem>
                                                            <SelectItem value="Satış">Satış & Pazarlama</SelectItem>
                                                            <SelectItem value="IT">IT</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="bio">Hakkında</Label>
                                                <Textarea
                                                    id="bio"
                                                    placeholder="Kendinizi kısaca tanıtın..."
                                                    value={profileForm.bio}
                                                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                                                    className="bg-background resize-none"
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="flex justify-end">
                                                <Button className="btn-glow">
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Değişiklikleri Kaydet
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Notification Settings */}
                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <Card className="bg-surface border-border">
                                        <CardHeader>
                                            <CardTitle>Bildirim Ayarları</CardTitle>
                                            <CardDescription>
                                                Hangi bildirimler hakkında uyarılmak istediğinizi seçin
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Channels */}
                                            <div>
                                                <h4 className="text-sm font-medium mb-4">Bildirim Kanalları</h4>
                                                <div className="space-y-4">
                                                    {[
                                                        { key: 'email', label: 'E-posta bildirimleri', desc: 'Önemli güncellemeler için e-posta alın' },
                                                        { key: 'push', label: 'Push bildirimleri', desc: 'Tarayıcı push bildirimleri' },
                                                        { key: 'desktop', label: 'Masaüstü bildirimleri', desc: 'Masaüstü uygulaması bildirimleri' },
                                                        { key: 'sound', label: 'Ses bildirimleri', desc: 'Yeni mesaj geldiğinde ses çal' },
                                                    ].map((item) => (
                                                        <div key={item.key} className="flex items-center justify-between">
                                                            <div>
                                                                <Label className="font-medium">{item.label}</Label>
                                                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                                                            </div>
                                                            <Switch
                                                                checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                                                                onCheckedChange={(checked) =>
                                                                    setNotificationSettings({ ...notificationSettings, [item.key]: checked })
                                                                }
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <Separator />

                                            {/* Event Types */}
                                            <div>
                                                <h4 className="text-sm font-medium mb-4">Olay Türleri</h4>
                                                <div className="space-y-4">
                                                    {[
                                                        { key: 'mentions', label: 'Bahsetmeler', desc: 'Biri sizi etiketlediğinde' },
                                                        { key: 'directMessages', label: 'Direkt mesajlar', desc: 'Özel mesaj aldığınızda' },
                                                        { key: 'channelMessages', label: 'Kanal mesajları', desc: 'Kanallardaki tüm mesajlar' },
                                                        { key: 'projectUpdates', label: 'Proje güncellemeleri', desc: 'ERP projeleri hakkında' },
                                                        { key: 'stockAlerts', label: 'Stok uyarıları', desc: 'Stok seviyesi düştüğünde' },
                                                        { key: 'dealUpdates', label: 'Fırsat güncellemeleri', desc: 'CRM fırsatları hakkında' },
                                                    ].map((item) => (
                                                        <div key={item.key} className="flex items-center justify-between">
                                                            <div>
                                                                <Label className="font-medium">{item.label}</Label>
                                                                <p className="text-xs text-muted-foreground">{item.desc}</p>
                                                            </div>
                                                            <Switch
                                                                checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                                                                onCheckedChange={(checked) =>
                                                                    setNotificationSettings({ ...notificationSettings, [item.key]: checked })
                                                                }
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <Button className="btn-glow">
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Kaydet
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Security Settings */}
                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <Card className="bg-surface border-border">
                                        <CardHeader>
                                            <CardTitle>Güvenlik Ayarları</CardTitle>
                                            <CardDescription>
                                                Hesabınızın güvenliğini yönetin
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label className="font-medium">İki Faktörlü Kimlik Doğrulama</Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Hesabınıza ekstra güvenlik katmanı ekleyin
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={securitySettings.twoFactor}
                                                    onCheckedChange={(checked) =>
                                                        setSecuritySettings({ ...securitySettings, twoFactor: checked })
                                                    }
                                                />
                                            </div>

                                            <Separator />

                                            <div className="space-y-2">
                                                <Label>Oturum Zaman Aşımı</Label>
                                                <Select
                                                    value={securitySettings.sessionTimeout}
                                                    onValueChange={(value) =>
                                                        setSecuritySettings({ ...securitySettings, sessionTimeout: value })
                                                    }
                                                >
                                                    <SelectTrigger className="w-48 bg-background">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="15">15 dakika</SelectItem>
                                                        <SelectItem value="30">30 dakika</SelectItem>
                                                        <SelectItem value="60">1 saat</SelectItem>
                                                        <SelectItem value="120">2 saat</SelectItem>
                                                        <SelectItem value="never">Hiçbir zaman</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label className="font-medium">Giriş Bildirimleri</Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Yeni cihazdan giriş yapıldığında bildir
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={securitySettings.loginNotifications}
                                                    onCheckedChange={(checked) =>
                                                        setSecuritySettings({ ...securitySettings, loginNotifications: checked })
                                                    }
                                                />
                                            </div>

                                            <Separator />

                                            <div className="space-y-3">
                                                <Button variant="outline" className="w-full justify-between">
                                                    Şifre Değiştir
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" className="w-full justify-between">
                                                    Aktif Oturumları Yönet
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" className="w-full justify-between text-destructive hover:text-destructive">
                                                    Hesabı Sil
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Appearance Settings */}
                            {activeTab === 'appearance' && (
                                <div className="space-y-6">
                                    <Card className="bg-surface border-border">
                                        <CardHeader>
                                            <CardTitle>Görünüm Ayarları</CardTitle>
                                            <CardDescription>
                                                Uygulamanın görünümünü özelleştirin
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-3">
                                                <Label>Tema</Label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[
                                                        { value: 'light', label: 'Açık' },
                                                        { value: 'dark', label: 'Koyu' },
                                                        { value: 'system', label: 'Sistem' },
                                                    ].map((theme) => (
                                                        <button
                                                            key={theme.value}
                                                            onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: theme.value })}
                                                            className={cn(
                                                                'p-4 rounded-lg border-2 transition-all text-center',
                                                                appearanceSettings.theme === theme.value
                                                                    ? 'border-primary bg-primary/5'
                                                                    : 'border-border hover:border-primary/50'
                                                            )}
                                                        >
                                                            <span className="text-sm font-medium">{theme.label}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="space-y-2">
                                                <Label>Yazı Boyutu</Label>
                                                <Select
                                                    value={appearanceSettings.fontSize}
                                                    onValueChange={(value) =>
                                                        setAppearanceSettings({ ...appearanceSettings, fontSize: value })
                                                    }
                                                >
                                                    <SelectTrigger className="w-48 bg-background">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="small">Küçük</SelectItem>
                                                        <SelectItem value="normal">Normal</SelectItem>
                                                        <SelectItem value="large">Büyük</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <Label className="font-medium">Kompakt Mod</Label>
                                                    <p className="text-xs text-muted-foreground">
                                                        Daha sıkışık bir düzen kullan
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={appearanceSettings.compactMode}
                                                    onCheckedChange={(checked) =>
                                                        setAppearanceSettings({ ...appearanceSettings, compactMode: checked })
                                                    }
                                                />
                                            </div>

                                            <div className="flex justify-end">
                                                <Button className="btn-glow">
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Kaydet
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Language Settings */}
                            {activeTab === 'language' && (
                                <div className="space-y-6">
                                    <Card className="bg-surface border-border">
                                        <CardHeader>
                                            <CardTitle>Dil & Bölge Ayarları</CardTitle>
                                            <CardDescription>
                                                Dil ve yerelleştirme tercihlerinizi ayarlayın
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-2">
                                                <Label>Dil</Label>
                                                <Select defaultValue="tr">
                                                    <SelectTrigger className="w-64 bg-background">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
                                                        <SelectItem value="en">🇬🇧 English</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Saat Dilimi</Label>
                                                <Select defaultValue="Europe/Istanbul">
                                                    <SelectTrigger className="w-64 bg-background">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Europe/Istanbul">(GMT+3) İstanbul</SelectItem>
                                                        <SelectItem value="Europe/London">(GMT+0) London</SelectItem>
                                                        <SelectItem value="America/New_York">(GMT-5) New York</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Tarih Formatı</Label>
                                                <Select defaultValue="dd/MM/yyyy">
                                                    <SelectTrigger className="w-64 bg-background">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="dd/MM/yyyy">GG/AA/YYYY</SelectItem>
                                                        <SelectItem value="MM/dd/yyyy">AA/GG/YYYY</SelectItem>
                                                        <SelectItem value="yyyy-MM-dd">YYYY-AA-GG</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="flex justify-end">
                                                <Button className="btn-glow">
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Kaydet
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </ShellLayout>
    );
}
