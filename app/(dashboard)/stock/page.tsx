'use client';

import { useState } from 'react';
import {
    Package, Plus, Search, Filter, MoreVertical,
    Warehouse, ShoppingCart, FileText, AlertTriangle,
    TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
    ChevronRight, BarChart3, Truck, Clock, AlertCircle,
    CheckCircle, Box, Tag, DollarSign, Calendar
} from 'lucide-react';
import { ShellLayout } from '@/components/shell/shell-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Mock Data
const MOCK_INVENTORY = [
    {
        id: '1',
        sku: 'CIM-001',
        name: 'Portland Çimento',
        category: 'Yapı Malzemeleri',
        currentStock: 450,
        unit: 'ton',
        minStock: 200,
        maxStock: 1000,
        unitPrice: 2500,
        totalValue: 1125000,
        status: 'normal',
        lastMovement: '2 saat önce',
        location: 'Depo A - Raf 1',
    },
    {
        id: '2',
        sku: 'DEM-002',
        name: 'Nervürlü Demir (Ø12)',
        category: 'Demir-Çelik',
        currentStock: 85,
        unit: 'ton',
        minStock: 100,
        maxStock: 500,
        unitPrice: 18500,
        totalValue: 1572500,
        status: 'low',
        lastMovement: '5 saat önce',
        location: 'Depo B - Raf 3',
    },
    {
        id: '3',
        sku: 'TUG-003',
        name: 'Tuğla (19x9x5)',
        category: 'Yapı Malzemeleri',
        currentStock: 0,
        unit: 'adet',
        minStock: 5000,
        maxStock: 50000,
        unitPrice: 2.5,
        totalValue: 0,
        status: 'out',
        lastMovement: '1 gün önce',
        location: 'Depo A - Raf 5',
    },
    {
        id: '4',
        sku: 'KUM-004',
        name: 'Kum (0-3mm)',
        category: 'Agrega',
        currentStock: 750,
        unit: 'm³',
        minStock: 200,
        maxStock: 1000,
        unitPrice: 350,
        totalValue: 262500,
        status: 'normal',
        lastMovement: '3 saat önce',
        location: 'Saha Deposu',
    },
    {
        id: '5',
        sku: 'BOR-005',
        name: 'PVC Boru (Ø110)',
        category: 'Tesisat',
        currentStock: 320,
        unit: 'm',
        minStock: 150,
        maxStock: 800,
        unitPrice: 45,
        totalValue: 14400,
        status: 'normal',
        lastMovement: '1 gün önce',
        location: 'Depo C - Raf 2',
    },
];

const MOCK_TENDERS = [
    {
        id: '1',
        number: 'IH-2024-001',
        title: 'Merkez Plaza Malzeme Alımı',
        type: 'purchase',
        status: 'bidding',
        budget: 2500000,
        closeDate: '2024-02-20',
        bidCount: 5,
    },
    {
        id: '2',
        number: 'IH-2024-002',
        title: 'Metro Projesi Çelik Tedariği',
        type: 'purchase',
        status: 'evaluation',
        budget: 8500000,
        closeDate: '2024-02-15',
        bidCount: 8,
    },
    {
        id: '3',
        number: 'IH-2024-003',
        title: 'Vinç Kiralama Hizmeti',
        type: 'service',
        status: 'published',
        budget: 450000,
        closeDate: '2024-02-28',
        bidCount: 2,
    },
];

const MOCK_ALERTS = [
    { id: '1', type: 'out', item: 'Tuğla (19x9x5)', message: 'Stok tamamen tükendi!', severity: 'critical' },
    { id: '2', type: 'low', item: 'Nervürlü Demir (Ø12)', message: 'Minimum stok seviyesinin altında', severity: 'warning' },
    { id: '3', type: 'reorder', item: 'Portland Çimento', message: 'Yeniden sipariş noktasına ulaşıldı', severity: 'info' },
];

const STATS = [
    {
        title: 'Toplam Stok Değeri',
        value: '₺12.4M',
        change: '+5%',
        trend: 'up',
        icon: DollarSign,
        color: 'text-green-500 bg-green-500/10'
    },
    {
        title: 'Aktif Kalemler',
        value: '1,248',
        change: '+24',
        trend: 'up',
        icon: Package,
        color: 'text-blue-500 bg-blue-500/10'
    },
    {
        title: 'Bekleyen Siparişler',
        value: '18',
        change: '-3',
        trend: 'down',
        icon: ShoppingCart,
        color: 'text-purple-500 bg-purple-500/10'
    },
    {
        title: 'Aktif İhaleler',
        value: '6',
        change: '+2',
        trend: 'up',
        icon: FileText,
        color: 'text-orange-500 bg-orange-500/10'
    },
];

const PURCHASE_ORDERS = [
    { id: '1', number: 'PO-2024-156', supplier: 'ABC Çimento A.Ş.', amount: 125000, status: 'approved', date: '2024-02-10' },
    { id: '2', number: 'PO-2024-155', supplier: 'XYZ Demir-Çelik', amount: 340000, status: 'pending', date: '2024-02-09' },
    { id: '3', number: 'PO-2024-154', supplier: 'Mega Yapı Market', amount: 45000, status: 'received', date: '2024-02-08' },
];

export default function StockPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('inventory');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getStockStatusBadge = (status: string) => {
        switch (status) {
            case 'normal':
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Normal</Badge>;
            case 'low':
                return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Düşük</Badge>;
            case 'out':
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Tükendi</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTenderStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Yayında</Badge>;
            case 'bidding':
                return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Teklif Alınıyor</Badge>;
            case 'evaluation':
                return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Değerlendirme</Badge>;
            case 'awarded':
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">İhale Edildi</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPOStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Onaylandı</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Beklemede</Badge>;
            case 'received':
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Teslim Alındı</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <ShellLayout>
            <div className="flex flex-col h-full bg-background">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/30">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Package className="h-6 w-6 text-primary" />
                            Stok & İhale Yönetimi
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Envanter takibi, satın alma ve ihale işlemleri
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Ürün veya ihale ara..."
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
                                    <Package className="h-4 w-4 mr-2" />
                                    Stok Girişi
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Satın Alma Talebi
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Yeni İhale
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Warehouse className="h-4 w-4 mr-2" />
                                    Yeni Ürün Kaydı
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

                        {/* Alerts */}
                        {MOCK_ALERTS.length > 0 && (
                            <Card className="bg-surface border-border border-l-4 border-l-yellow-500">
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-foreground">Stok Uyarıları</h3>
                                            <div className="mt-2 space-y-2">
                                                {MOCK_ALERTS.map((alert) => (
                                                    <div
                                                        key={alert.id}
                                                        className={cn(
                                                            'flex items-center gap-2 text-sm p-2 rounded-lg',
                                                            alert.severity === 'critical' && 'bg-red-500/10 text-red-400',
                                                            alert.severity === 'warning' && 'bg-yellow-500/10 text-yellow-400',
                                                            alert.severity === 'info' && 'bg-blue-500/10 text-blue-400',
                                                        )}
                                                    >
                                                        {alert.severity === 'critical' && <AlertCircle className="h-4 w-4" />}
                                                        {alert.severity === 'warning' && <AlertTriangle className="h-4 w-4" />}
                                                        {alert.severity === 'info' && <Clock className="h-4 w-4" />}
                                                        <span className="font-medium">{alert.item}:</span>
                                                        <span>{alert.message}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">Tümünü Gör</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Main Content */}
                        <div className="grid grid-cols-3 gap-6">
                            {/* Inventory Table */}
                            <div className="col-span-2">
                                <Card className="bg-surface border-border">
                                    <CardHeader className="pb-4">
                                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                            <div className="flex items-center justify-between">
                                                <TabsList className="bg-muted">
                                                    <TabsTrigger value="inventory">Envanter</TabsTrigger>
                                                    <TabsTrigger value="orders">Siparişler</TabsTrigger>
                                                    <TabsTrigger value="movements">Hareketler</TabsTrigger>
                                                </TabsList>
                                                <Button variant="outline" size="sm">
                                                    <BarChart3 className="h-4 w-4 mr-2" />
                                                    Rapor
                                                </Button>
                                            </div>

                                            <TabsContent value="inventory" className="mt-4">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>SKU</TableHead>
                                                            <TableHead>Ürün Adı</TableHead>
                                                            <TableHead>Kategori</TableHead>
                                                            <TableHead className="text-right">Stok</TableHead>
                                                            <TableHead className="text-right">Değer</TableHead>
                                                            <TableHead>Durum</TableHead>
                                                            <TableHead></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {MOCK_INVENTORY.map((item) => (
                                                            <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                                                                <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                                                                <TableCell className="font-medium">{item.name}</TableCell>
                                                                <TableCell className="text-muted-foreground text-sm">{item.category}</TableCell>
                                                                <TableCell className="text-right">
                                                                    <span className="font-semibold">{item.currentStock.toLocaleString()}</span>
                                                                    <span className="text-muted-foreground text-xs ml-1">{item.unit}</span>
                                                                </TableCell>
                                                                <TableCell className="text-right font-medium">
                                                                    {formatCurrency(item.totalValue)}
                                                                </TableCell>
                                                                <TableCell>{getStockStatusBadge(item.status)}</TableCell>
                                                                <TableCell>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                                <MoreVertical className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem>Detay</DropdownMenuItem>
                                                                            <DropdownMenuItem>Stok Girişi</DropdownMenuItem>
                                                                            <DropdownMenuItem>Stok Çıkışı</DropdownMenuItem>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem>Hareket Geçmişi</DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TabsContent>

                                            <TabsContent value="orders" className="mt-4">
                                                <div className="space-y-3">
                                                    {PURCHASE_ORDERS.map((order) => (
                                                        <div
                                                            key={order.id}
                                                            className="p-4 rounded-lg bg-background border border-border hover:border-primary/30 transition-all cursor-pointer"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-mono text-sm font-medium">{order.number}</span>
                                                                        {getPOStatusBadge(order.status)}
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground mt-1">{order.supplier}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-semibold">{formatCurrency(order.amount)}</p>
                                                                    <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString('tr-TR')}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="movements" className="mt-4">
                                                <div className="space-y-3">
                                                    {[
                                                        { id: '1', type: 'in', product: 'Portland Çimento 50kg', qty: 200, unit: 'Torba', from: 'ABC Tedarik', to: 'Ana Depo', date: '2024-02-14', user: 'Mehmet K.' },
                                                        { id: '2', type: 'out', product: 'Nervürlü Demir 12mm', qty: 50, unit: 'Ton', from: 'Ana Depo', to: 'Proje-A Sahası', date: '2024-02-14', user: 'Ali Y.' },
                                                        { id: '3', type: 'in', product: 'Kum (İnce)', qty: 30, unit: 'm³', from: 'XYZ Kum Ocağı', to: 'Saha Deposu', date: '2024-02-13', user: 'Mehmet K.' },
                                                        { id: '4', type: 'transfer', product: 'Tuğla (19x19x13.5)', qty: 5000, unit: 'Adet', from: 'Ana Depo', to: 'Saha Deposu B', date: '2024-02-13', user: 'Zeynep A.' },
                                                        { id: '5', type: 'out', product: 'Boya (Beyaz) 20L', qty: 15, unit: 'Kova', from: 'Ana Depo', to: 'Proje-B Sahası', date: '2024-02-12', user: 'Ali Y.' },
                                                        { id: '6', type: 'in', product: 'Alçı (25kg)', qty: 100, unit: 'Torba', from: 'Demir Yapı', to: 'Ana Depo', date: '2024-02-12', user: 'Mehmet K.' },
                                                    ].map((movement) => (
                                                        <div key={movement.id} className="p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-all">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn(
                                                                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                                                                        movement.type === 'in' && 'bg-green-500/10 text-green-600',
                                                                        movement.type === 'out' && 'bg-red-500/10 text-red-600',
                                                                        movement.type === 'transfer' && 'bg-blue-500/10 text-blue-600',
                                                                    )}>
                                                                        {movement.type === 'in' ? '↓' : movement.type === 'out' ? '↑' : '↔'}
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-medium text-foreground">{movement.product}</p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {movement.from} → {movement.to}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm font-semibold">
                                                                        {movement.type === 'in' ? '+' : movement.type === 'out' ? '-' : ''}{movement.qty} {movement.unit}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">{movement.date} • {movement.user}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </CardHeader>
                                </Card>
                            </div>

                            {/* Right Sidebar */}
                            <div className="space-y-6">
                                {/* Active Tenders */}
                                <Card className="bg-surface border-border">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-primary" />
                                            Aktif İhaleler
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {MOCK_TENDERS.map((tender) => (
                                            <div
                                                key={tender.id}
                                                className="p-3 rounded-lg bg-background border border-border hover:border-primary/30 transition-all cursor-pointer"
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <p className="text-sm font-medium text-foreground">{tender.title}</p>
                                                        <p className="text-xs text-muted-foreground font-mono">{tender.number}</p>
                                                    </div>
                                                    {getTenderStatusBadge(tender.status)}
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <DollarSign className="h-3 w-3" />
                                                        {formatCurrency(tender.budget)}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(tender.closeDate).toLocaleDateString('tr-TR')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 mt-2 text-xs">
                                                    <Truck className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-muted-foreground">{tender.bidCount} teklif</span>
                                                </div>
                                            </div>
                                        ))}
                                        <Button variant="ghost" className="w-full text-sm">
                                            Tüm İhaleleri Gör
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Quick Actions */}
                                <Card className="bg-surface border-border">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Hızlı İşlemler</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button variant="outline" className="w-full justify-start">
                                            <Package className="h-4 w-4 mr-2" />
                                            Sayım Başlat
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start">
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            Toplu Sipariş
                                        </Button>
                                        <Button variant="outline" className="w-full justify-start">
                                            <BarChart3 className="h-4 w-4 mr-2" />
                                            Stok Raporu
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
