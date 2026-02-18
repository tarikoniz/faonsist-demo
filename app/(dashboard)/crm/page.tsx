'use client';

import { useState } from 'react';
import {
    Users, Plus, Search, Filter, MoreVertical,
    UserPlus, Target, DollarSign, TrendingUp,
    Mail, Phone, Calendar, Building, Tag,
    ArrowUpRight, ArrowDownRight, ChevronRight,
    Star, Clock, CheckCircle, XCircle, Activity
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Mock Data
const PIPELINE_STAGES = [
    { id: 'prospecting', name: 'Prospecting', color: 'bg-slate-500', count: 8, value: 450000 },
    { id: 'qualification', name: 'Değerlendirme', color: 'bg-blue-500', count: 5, value: 680000 },
    { id: 'proposal', name: 'Teklif', color: 'bg-purple-500', count: 4, value: 920000 },
    { id: 'negotiation', name: 'Müzakere', color: 'bg-orange-500', count: 3, value: 750000 },
    { id: 'closed', name: 'Kapanış', color: 'bg-green-500', count: 2, value: 480000 },
];

const MOCK_DEALS = [
    {
        id: '1',
        title: 'Merkez Plaza Projesi',
        customer: 'ABC Holding',
        value: 2500000,
        stage: 'proposal',
        probability: 60,
        expectedClose: '2024-02-15',
        owner: { name: 'Ahmet Yılmaz', avatar: '' },
        lastActivity: '2 saat önce',
    },
    {
        id: '2',
        title: 'Sahil Konutları',
        customer: 'XYZ İnşaat',
        value: 1800000,
        stage: 'negotiation',
        probability: 75,
        expectedClose: '2024-02-28',
        owner: { name: 'Ayşe Demir', avatar: '' },
        lastActivity: '5 saat önce',
    },
    {
        id: '3',
        title: 'Endüstriyel Tesis',
        customer: 'Mega Fabrika A.Ş.',
        value: 4200000,
        stage: 'qualification',
        probability: 40,
        expectedClose: '2024-03-15',
        owner: { name: 'Mehmet Kaya', avatar: '' },
        lastActivity: 'Dün',
    },
];

const MOCK_LEADS = [
    {
        id: '1',
        name: 'Emre Yıldırım',
        company: 'Tech Solutions',
        email: 'emre@tech.com',
        phone: '+90 532 555 1234',
        source: 'website',
        score: 85,
        status: 'hot',
        createdAt: '3 saat önce'
    },
    {
        id: '2',
        name: 'Selin Arslan',
        company: 'Global Trade Ltd.',
        email: 'selin@global.com',
        phone: '+90 535 555 5678',
        source: 'referral',
        score: 65,
        status: 'warm',
        createdAt: '1 gün önce'
    },
    {
        id: '3',
        name: 'Can Öztürk',
        company: 'New Era Yapı',
        email: 'can@newera.com',
        phone: '+90 542 555 9012',
        source: 'campaign',
        score: 45,
        status: 'cold',
        createdAt: '3 gün önce'
    },
];

const STATS = [
    {
        title: 'Aktif Fırsatlar',
        value: '24',
        change: '+5',
        trend: 'up',
        icon: Target,
        color: 'text-blue-500 bg-blue-500/10'
    },
    {
        title: 'Pipeline Değeri',
        value: '₺3.28M',
        change: '+18%',
        trend: 'up',
        icon: DollarSign,
        color: 'text-green-500 bg-green-500/10'
    },
    {
        title: 'Yeni Lead\'ler',
        value: '42',
        change: '+12',
        trend: 'up',
        icon: UserPlus,
        color: 'text-purple-500 bg-purple-500/10'
    },
    {
        title: 'Dönüşüm Oranı',
        value: '%28',
        change: '+3%',
        trend: 'up',
        icon: TrendingUp,
        color: 'text-orange-500 bg-orange-500/10'
    },
];

const RECENT_ACTIVITIES = [
    { type: 'call', user: 'Ahmet Yılmaz', action: 'ABC Holding ile görüştü', time: '10 dk önce' },
    { type: 'email', user: 'Ayşe Demir', action: 'XYZ İnşaat\'a teklif gönderdi', time: '1 saat önce' },
    { type: 'meeting', user: 'Mehmet Kaya', action: 'Mega Fabrika ile toplantı yaptı', time: '2 saat önce' },
    { type: 'deal', user: 'Zeynep Öztürk', action: 'Yeni fırsat oluşturdu', time: '3 saat önce' },
];

export default function CRMPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('deals');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getLeadStatusBadge = (status: string) => {
        switch (status) {
            case 'hot':
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Sıcak</Badge>;
            case 'warm':
                return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Ilık</Badge>;
            case 'cold':
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Soğuk</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'website': return '🌐';
            case 'referral': return '🤝';
            case 'campaign': return '📢';
            default: return '📧';
        }
    };

    return (
        <ShellLayout>
            <div className="flex flex-col h-full bg-background">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/30">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Users className="h-6 w-6 text-primary" />
                            Müşteri İlişkileri (CRM)
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Lead yönetimi, fırsat takibi ve satış pipeline
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Müşteri veya fırsat ara..."
                                className="pl-9 bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button className="btn-glow">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Yeni Ekle
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Yeni Lead
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Target className="h-4 w-4 mr-2" />
                                    Yeni Fırsat
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Building className="h-4 w-4 mr-2" />
                                    Yeni Müşteri
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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

                        {/* Pipeline Visual */}
                        <Card className="bg-surface border-border">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Satış Pipeline</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    {PIPELINE_STAGES.map((stage, index) => (
                                        <div key={stage.id} className="flex-1">
                                            <div className={cn('h-2 rounded-full', stage.color)} />
                                            <div className="mt-2 text-center">
                                                <p className="text-xs font-medium text-foreground">{stage.name}</p>
                                                <p className="text-lg font-bold text-foreground">{stage.count}</p>
                                                <p className="text-[10px] text-muted-foreground">{formatCurrency(stage.value)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Main Content */}
                        <div className="grid grid-cols-3 gap-6">
                            {/* Deals & Leads */}
                            <div className="col-span-2">
                                <Card className="bg-surface border-border">
                                    <CardHeader className="pb-4">
                                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                            <div className="flex items-center justify-between">
                                                <TabsList className="bg-muted">
                                                    <TabsTrigger value="deals">Fırsatlar</TabsTrigger>
                                                    <TabsTrigger value="leads">Lead'ler</TabsTrigger>
                                                    <TabsTrigger value="customers">Müşteriler</TabsTrigger>
                                                </TabsList>
                                            </div>

                                            <TabsContent value="deals" className="mt-4 space-y-3">
                                                {MOCK_DEALS.map((deal) => (
                                                    <div
                                                        key={deal.id}
                                                        className="p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-all cursor-pointer group"
                                                    >
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div>
                                                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                                    {deal.title}
                                                                </h3>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Building className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-sm text-muted-foreground">{deal.customer}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-lg font-bold text-foreground">
                                                                    {formatCurrency(deal.value)}
                                                                </p>
                                                                <Badge variant="outline" className="text-[10px]">
                                                                    {deal.probability}% olasılık
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {new Date(deal.expectedClose).toLocaleDateString('tr-TR')}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {deal.lastActivity}
                                                                </span>
                                                            </div>
                                                            <Avatar className="h-7 w-7">
                                                                <AvatarImage src={deal.owner.avatar} />
                                                                <AvatarFallback className="text-[10px]">
                                                                    {deal.owner.name.split(' ').map(n => n[0]).join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                        </div>
                                                    </div>
                                                ))}
                                            </TabsContent>

                                            <TabsContent value="leads" className="mt-4 space-y-3">
                                                {MOCK_LEADS.map((lead) => (
                                                    <div
                                                        key={lead.id}
                                                        className="p-4 rounded-xl bg-background border border-border hover:border-primary/30 transition-all cursor-pointer group"
                                                    >
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-10 w-10">
                                                                    <AvatarImage src="" />
                                                                    <AvatarFallback>
                                                                        {lead.name.split(' ').map(n => n[0]).join('')}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                                        {lead.name}
                                                                    </h3>
                                                                    <p className="text-sm text-muted-foreground">{lead.company}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                {getLeadStatusBadge(lead.status)}
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem>Görüntüle</DropdownMenuItem>
                                                                        <DropdownMenuItem>Fırsata Dönüştür</DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem className="text-destructive">Sil</DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                                            <span className="flex items-center gap-1">
                                                                <Mail className="h-3 w-3" />
                                                                {lead.email}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Phone className="h-3 w-3" />
                                                                {lead.phone}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                {getSourceIcon(lead.source)} {lead.source}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center justify-between mt-3">
                                                            <div className="flex items-center gap-2">
                                                                <Star className="h-4 w-4 text-yellow-500" />
                                                                <span className="text-sm font-medium">Skor: {lead.score}</span>
                                                            </div>
                                                            <span className="text-xs text-muted-foreground">{lead.createdAt}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </TabsContent>

                                            <TabsContent value="customers" className="mt-4">
                                                <div className="space-y-3">
                                                    {[
                                                        { id: '1', name: 'ABC Holding', contact: 'Mehmet Yılmaz', email: 'mehmet@abc.com', phone: '+90 532 111 2233', projects: 3, revenue: 7500000, status: 'active' },
                                                        { id: '2', name: 'XYZ İnşaat', contact: 'Ayşe Demir', email: 'ayse@xyz.com', phone: '+90 535 444 5566', projects: 2, revenue: 3200000, status: 'active' },
                                                        { id: '3', name: 'Mega Fabrika A.Ş.', contact: 'Ali Kaya', email: 'ali@mega.com', phone: '+90 538 777 8899', projects: 1, revenue: 4200000, status: 'prospect' },
                                                        { id: '4', name: 'Star Gayrimenkul', contact: 'Zeynep Öz', email: 'zeynep@star.com', phone: '+90 531 222 3344', projects: 4, revenue: 9100000, status: 'active' },
                                                        { id: '5', name: 'Doğu Enerji Ltd.', contact: 'Hasan Çelik', email: 'hasan@dogu.com', phone: '+90 537 666 7788', projects: 0, revenue: 0, status: 'inactive' },
                                                    ].map((customer) => (
                                                        <div key={customer.id} className="p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-all cursor-pointer">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-10 w-10">
                                                                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                                                            {customer.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-foreground">{customer.name}</p>
                                                                        <p className="text-xs text-muted-foreground">{customer.contact} • {customer.email}</p>
                                                                    </div>
                                                                </div>
                                                                <Badge variant={customer.status === 'active' ? 'default' : customer.status === 'prospect' ? 'secondary' : 'outline'} className="text-xs">
                                                                    {customer.status === 'active' ? 'Aktif' : customer.status === 'prospect' ? 'Aday' : 'Pasif'}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-center gap-4 mt-2 ml-13">
                                                                <span className="text-xs text-muted-foreground"><Building className="h-3 w-3 inline mr-1" />{customer.projects} proje</span>
                                                                <span className="text-xs text-muted-foreground"><DollarSign className="h-3 w-3 inline mr-1" />{(customer.revenue / 1000000).toFixed(1)}M ₺</span>
                                                                <span className="text-xs text-muted-foreground"><Phone className="h-3 w-3 inline mr-1" />{customer.phone}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </CardHeader>
                                </Card>
                            </div>

                            {/* Recent Activities */}
                            <div>
                                <Card className="bg-surface border-border">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <Activity className="h-4 w-4 text-primary" />
                                            Son Aktiviteler
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {RECENT_ACTIVITIES.map((activity, index) => (
                                            <div key={index} className="flex gap-3">
                                                <div className={cn(
                                                    'w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0',
                                                    activity.type === 'call' && 'bg-green-500/10 text-green-500',
                                                    activity.type === 'email' && 'bg-blue-500/10 text-blue-500',
                                                    activity.type === 'meeting' && 'bg-purple-500/10 text-purple-500',
                                                    activity.type === 'deal' && 'bg-orange-500/10 text-orange-500',
                                                )}>
                                                    {activity.type === 'call' && <Phone className="h-4 w-4" />}
                                                    {activity.type === 'email' && <Mail className="h-4 w-4" />}
                                                    {activity.type === 'meeting' && <Calendar className="h-4 w-4" />}
                                                    {activity.type === 'deal' && <Target className="h-4 w-4" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-foreground">
                                                        <span className="font-medium">{activity.user}</span> {activity.action}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                {/* Quick Stats */}
                                <Card className="bg-surface border-border mt-6">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Bu Ay</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Kazanılan</span>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                <span className="font-semibold">8 fırsat</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Kaybedilen</span>
                                            <div className="flex items-center gap-2">
                                                <XCircle className="h-4 w-4 text-red-500" />
                                                <span className="font-semibold">3 fırsat</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Kazanılan Değer</span>
                                            <span className="font-semibold text-green-500">₺1.24M</span>
                                        </div>
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
