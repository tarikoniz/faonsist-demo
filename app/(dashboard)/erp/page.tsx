'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Building2, Plus, Search, Filter, MoreVertical,
    FolderKanban, Calendar, DollarSign, Users, MapPin,
    TrendingUp, Clock, AlertCircle, CheckCircle2,
    ChevronRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { ShellLayout } from '@/components/shell/shell-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Mock Data
const MOCK_PROJECTS = [
    {
        id: '1',
        name: 'Merkez Plaza',
        code: 'MP-2024',
        type: 'commercial',
        status: 'active',
        progress: 67,
        budget: 25000000,
        spent: 16750000,
        startDate: '2024-01-15',
        endDate: '2024-12-31',
        location: 'İstanbul, Şişli',
        manager: { name: 'Ahmet Yılmaz', avatar: '' },
        team: 12,
        tasks: { total: 156, completed: 104 },
    },
    {
        id: '2',
        name: 'Sahil Residence',
        code: 'SR-2024',
        type: 'residential',
        status: 'active',
        progress: 45,
        budget: 18500000,
        spent: 8325000,
        startDate: '2024-03-01',
        endDate: '2025-06-30',
        location: 'İzmir, Karşıyaka',
        manager: { name: 'Ayşe Demir', avatar: '' },
        team: 8,
        tasks: { total: 120, completed: 54 },
    },
    {
        id: '3',
        name: 'Metro Hattı Projesi',
        code: 'MH-2023',
        type: 'infrastructure',
        status: 'active',
        progress: 82,
        budget: 150000000,
        spent: 123000000,
        startDate: '2023-06-01',
        endDate: '2025-12-31',
        location: 'İstanbul, Üsküdar',
        manager: { name: 'Mehmet Kaya', avatar: '' },
        team: 45,
        tasks: { total: 450, completed: 369 },
    },
    {
        id: '4',
        name: 'Stadyum Renovasyonu',
        code: 'STD-2024',
        type: 'renovation',
        status: 'planning',
        progress: 15,
        budget: 35000000,
        spent: 5250000,
        startDate: '2024-06-01',
        endDate: '2025-03-31',
        location: 'Ankara, Eryaman',
        manager: { name: 'Zeynep Öztürk', avatar: '' },
        team: 6,
        tasks: { total: 80, completed: 12 },
    },
];

const STATS = [
    {
        title: 'Aktif Projeler',
        value: '12',
        change: '+3',
        trend: 'up',
        icon: FolderKanban,
        color: 'text-blue-500 bg-blue-500/10'
    },
    {
        title: 'Toplam Bütçe',
        value: '₺228.5M',
        change: '+12%',
        trend: 'up',
        icon: DollarSign,
        color: 'text-green-500 bg-green-500/10'
    },
    {
        title: 'Aktif İş Gücü',
        value: '156',
        change: '+8',
        trend: 'up',
        icon: Users,
        color: 'text-purple-500 bg-purple-500/10'
    },
    {
        title: 'Ortalama İlerleme',
        value: '%52',
        change: '+5%',
        trend: 'up',
        icon: TrendingUp,
        color: 'text-orange-500 bg-orange-500/10'
    },
];

const UPCOMING_MILESTONES = [
    { project: 'Merkez Plaza', milestone: 'Kaba İnşaat Tamamlanması', date: '2024-02-15', status: 'on-track' },
    { project: 'Metro Hattı', milestone: 'Tünel Kazısı Bitişi', date: '2024-02-20', status: 'at-risk' },
    { project: 'Sahil Residence', milestone: 'Temel Atma', date: '2024-02-28', status: 'on-track' },
];

export default function ERPPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('projects');

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Aktif</Badge>;
            case 'planning':
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Planlama</Badge>;
            case 'on-hold':
                return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Beklemede</Badge>;
            case 'completed':
                return <Badge className="bg-muted text-muted-foreground">Tamamlandı</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <ShellLayout>
            <div className="flex flex-col h-full bg-background">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/30">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-primary" />
                            İnşaat ERP
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Proje yönetimi, bütçe takibi ve kaynak planlaması
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Proje ara..."
                                className="pl-9 bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                        <Button className="btn-glow">
                            <Plus className="h-4 w-4 mr-2" />
                            Yeni Proje
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-4">
                            {STATS.map((stat, index) => (
                                <Card key={index} className="bg-surface border-border">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className={cn('p-2 rounded-lg', stat.color)}>
                                                <stat.icon className="h-5 w-5" />
                                            </div>
                                            <div className={cn(
                                                'flex items-center gap-1 text-sm font-medium',
                                                stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                                            )}>
                                                {stat.trend === 'up' ? (
                                                    <ArrowUpRight className="h-4 w-4" />
                                                ) : (
                                                    <ArrowDownRight className="h-4 w-4" />
                                                )}
                                                {stat.change}
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                            <p className="text-sm text-muted-foreground">{stat.title}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Main Content */}
                        <div className="grid grid-cols-3 gap-6">
                            {/* Projects List */}
                            <div className="col-span-2">
                                <Card className="bg-surface border-border">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">Projeler</CardTitle>
                                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                                <TabsList className="bg-muted">
                                                    <TabsTrigger value="projects">Aktif</TabsTrigger>
                                                    <TabsTrigger value="planning">Planlanan</TabsTrigger>
                                                    <TabsTrigger value="completed">Tamamlanan</TabsTrigger>
                                                </TabsList>
                                            </Tabs>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {MOCK_PROJECTS.map((project) => (
                                            <div
                                                key={project.id}
                                                className="p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                                {project.name}
                                                            </h3>
                                                            <Badge variant="outline" className="text-[10px]">{project.code}</Badge>
                                                        </div>
                                                        <div className="flex items-center gap-3 mt-1.5 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="h-3 w-3" />
                                                                {project.location}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                {project.team} kişi
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusBadge(project.status)}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem>Görüntüle</DropdownMenuItem>
                                                                <DropdownMenuItem>Düzenle</DropdownMenuItem>
                                                                <DropdownMenuItem>Rapor Al</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    {/* Progress */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <span className="text-xs text-muted-foreground">İlerleme</span>
                                                            <span className="text-sm font-semibold text-foreground">{project.progress}%</span>
                                                        </div>
                                                        <Progress value={project.progress} className="h-2" />
                                                    </div>

                                                    {/* Budget */}
                                                    <div className="text-right">
                                                        <p className="text-xs text-muted-foreground">Bütçe</p>
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {formatCurrency(project.budget)}
                                                        </p>
                                                    </div>

                                                    {/* Tasks */}
                                                    <div className="text-right">
                                                        <p className="text-xs text-muted-foreground">Görevler</p>
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {project.tasks.completed}/{project.tasks.total}
                                                        </p>
                                                    </div>

                                                    {/* Manager */}
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={project.manager.avatar} />
                                                            <AvatarFallback className="text-xs">
                                                                {project.manager.name.split(' ').map(n => n[0]).join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <Button variant="ghost" className="w-full mt-2">
                                            Tüm Projeleri Gör
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Sidebar */}
                            <div className="space-y-6">
                                {/* Upcoming Milestones */}
                                <Card className="bg-surface border-border">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            Yaklaşan Kilometre Taşları
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {UPCOMING_MILESTONES.map((item, index) => (
                                            <div key={index} className="p-3 rounded-lg bg-background border border-border">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{item.milestone}</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">{item.project}</p>
                                                    </div>
                                                    {item.status === 'on-track' ? (
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(item.date).toLocaleDateString('tr-TR', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Quick Actions */}
                                <Card className="bg-surface border-border">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Hızlı İşlemler</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button variant="outline" className="w-full justify-start">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Yeni Görev Ekle
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            Toplantı Planla
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start">
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            Hakediş Oluştur
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>
        </ShellLayout>
    );
}
