'use client';

import { useState } from 'react';
import {
  TrendingDown,
  Award,
  Calendar,
  Truck,
  Shield,
  Star,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BidItem {
  id: string;
  itemName: string;
  unit: string;
  quantity: number;
  specifications: string;
}

interface Supplier {
  id: string;
  name: string;
  rating: number;
  onTimeDelivery: number;
  qualityScore: number;
  location: string;
}

interface Bid {
  supplierId: string;
  supplier: Supplier;
  unitPrice: number;
  totalPrice: number;
  deliveryDays: number;
  warranty: string;
  paymentTerms: string;
  notes?: string;
}

const TENDER_ITEMS: BidItem[] = [
  {
    id: '1',
    itemName: 'Demir Çubuk Φ14',
    unit: 'ton',
    quantity: 50,
    specifications: 'ASTM A615 Grade 60, 12m uzunluk',
  },
  {
    id: '2',
    itemName: 'Çimento CEM II 42.5',
    unit: 'ton',
    quantity: 200,
    specifications: 'TS EN 197-1, torba',
  },
  {
    id: '3',
    itemName: 'Kum 0-4mm',
    unit: 'm³',
    quantity: 150,
    specifications: 'Yıkanmış, toz oranı <%3',
  },
];

const SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Demir A.Ş.',
    rating: 4.8,
    onTimeDelivery: 95,
    qualityScore: 92,
    location: 'İstanbul',
  },
  {
    id: 'SUP-002',
    name: 'İnşaat Malzeme Ltd.',
    rating: 4.2,
    onTimeDelivery: 88,
    qualityScore: 85,
    location: 'Kocaeli',
  },
  {
    id: 'SUP-003',
    name: 'Ticaret Yapı San.',
    rating: 3.9,
    onTimeDelivery: 78,
    qualityScore: 80,
    location: 'Bursa',
  },
];

const BIDS: Record<string, Bid[]> = {
  '1': [
    {
      supplierId: 'SUP-001',
      supplier: SUPPLIERS[0],
      unitPrice: 28500,
      totalPrice: 1425000,
      deliveryDays: 7,
      warranty: '1 yıl',
      paymentTerms: '60 gün vadeli',
    },
    {
      supplierId: 'SUP-002',
      supplier: SUPPLIERS[1],
      unitPrice: 27200,
      totalPrice: 1360000,
      deliveryDays: 10,
      warranty: '6 ay',
      paymentTerms: '30 gün vadeli',
    },
    {
      supplierId: 'SUP-003',
      supplier: SUPPLIERS[2],
      unitPrice: 26800,
      totalPrice: 1340000,
      deliveryDays: 14,
      warranty: '3 ay',
      paymentTerms: 'Peşin',
    },
  ],
  '2': [
    {
      supplierId: 'SUP-001',
      supplier: SUPPLIERS[0],
      unitPrice: 3200,
      totalPrice: 640000,
      deliveryDays: 5,
      warranty: '-',
      paymentTerms: '45 gün vadeli',
    },
    {
      supplierId: 'SUP-002',
      supplier: SUPPLIERS[1],
      unitPrice: 2980,
      totalPrice: 596000,
      deliveryDays: 7,
      warranty: '-',
      paymentTerms: '30 gün vadeli',
    },
    {
      supplierId: 'SUP-003',
      supplier: SUPPLIERS[2],
      unitPrice: 3100,
      totalPrice: 620000,
      deliveryDays: 10,
      warranty: '-',
      paymentTerms: 'Peşin',
    },
  ],
  '3': [
    {
      supplierId: 'SUP-001',
      supplier: SUPPLIERS[0],
      unitPrice: 450,
      totalPrice: 67500,
      deliveryDays: 3,
      warranty: '-',
      paymentTerms: '30 gün vadeli',
    },
    {
      supplierId: 'SUP-002',
      supplier: SUPPLIERS[1],
      unitPrice: 420,
      totalPrice: 63000,
      deliveryDays: 5,
      warranty: '-',
      paymentTerms: '15 gün vadeli',
    },
    {
      supplierId: 'SUP-003',
      supplier: SUPPLIERS[2],
      unitPrice: 410,
      totalPrice: 61500,
      deliveryDays: 7,
      warranty: '-',
      paymentTerms: 'Peşin',
    },
  ],
};

export function BidComparison() {
  const [selectedItem, setSelectedItem] = useState<BidItem>(TENDER_ITEMS[0]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const bids = BIDS[selectedItem.id] || [];
  const lowestBid = bids.reduce((min, bid) => (bid.totalPrice < min.totalPrice ? bid : min), bids[0]);

  const calculateSavings = (bid: Bid) => {
    if (bid.totalPrice === lowestBid.totalPrice) return 0;
    return bid.totalPrice - lowestBid.totalPrice;
  };

  const getWeightedScore = (bid: Bid) => {
    const priceScore = (1 - (bid.totalPrice - lowestBid.totalPrice) / lowestBid.totalPrice) * 40;
    const supplierScore = (bid.supplier.rating / 5) * 30;
    const deliveryScore = (1 - bid.deliveryDays / 30) * 20;
    const qualityScore = (bid.supplier.qualityScore / 100) * 10;
    return (priceScore + supplierScore + deliveryScore + qualityScore).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Teklif Karşılaştırma Tablosu
          </CardTitle>
          <CardDescription>
            İhale: <span className="font-semibold">İHALE-2024-001</span> - İnşaat Malzemeleri Alımı
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Item Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TENDER_ITEMS.map((item) => (
          <Card
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className={cn(
              'cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]',
              selectedItem.id === item.id
                ? 'glass border-primary/50 shadow-lg shadow-primary/20'
                : 'glass border-border/50'
            )}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{item.itemName}</CardTitle>
              <CardDescription className="text-xs">{item.specifications}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {item.quantity} {item.unit}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bid Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bids.map((bid, index) => {
          const isLowest = bid.totalPrice === lowestBid.totalPrice;
          const savings = calculateSavings(bid);
          const weightedScore = parseFloat(getWeightedScore(bid));

          return (
            <Card
              key={bid.supplierId}
              className={cn(
                'relative overflow-hidden transition-all',
                isLowest
                  ? 'glass border-green-500/50 shadow-lg shadow-green-500/20 ring-2 ring-green-500/30'
                  : 'glass border-border/50'
              )}
            >
              {/* Best Offer Badge */}
              {isLowest && (
                <div className="absolute top-0 right-0">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white px-3 py-1 rounded-bl-xl text-xs font-semibold flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" />
                    EN UYGUN
                  </div>
                </div>
              )}

              <CardHeader className="pb-3">
                {/* Supplier Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{bid.supplier.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">{bid.supplier.location}</CardDescription>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold">{bid.supplier.rating}</span>
                  <Badge variant="outline" className="text-xs ml-auto">
                    Puan: {weightedScore}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price */}
                <div className="text-center py-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Toplam Fiyat</p>
                  <p className={cn(
                    'text-2xl font-bold',
                    isLowest ? 'text-green-400' : 'text-foreground'
                  )}>
                    {formatCurrency(bid.totalPrice)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Birim: {formatCurrency(bid.unitPrice)}
                  </p>
                  {savings > 0 && (
                    <p className="text-xs text-red-400 mt-2">
                      +{formatCurrency(savings)} daha pahalı
                    </p>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Teslimat:</span>
                    <span className="font-semibold ml-auto">{bid.deliveryDays} gün</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Garanti:</span>
                    <span className="font-semibold ml-auto">{bid.warranty}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Teslimat %:</span>
                    <span className="font-semibold ml-auto text-cyan-400">{bid.supplier.onTimeDelivery}%</span>
                  </div>
                </div>

                {/* Payment Terms */}
                <div className="pt-3 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-1">Ödeme Şartları</p>
                  <p className="text-sm font-semibold">{bid.paymentTerms}</p>
                </div>

                {/* Action Button */}
                <Button
                  className={cn(
                    'w-full',
                    isLowest && 'bg-green-600 hover:bg-green-700'
                  )}
                  variant={isLowest ? 'default' : 'outline'}
                >
                  {isLowest ? 'Seç ve Onayla' : 'Detayları Görüntüle'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <Card className="glass border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-sm">
            <AlertCircle className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-foreground">
                <span className="font-semibold text-green-400">{lowestBid.supplier.name}</span> en uygun teklifi sundu.
                <span className="ml-2">
                  Toplam tasarruf potansiyeli:{' '}
                  <span className="font-semibold text-green-400">
                    {formatCurrency(bids.reduce((sum, bid) => sum + calculateSavings(bid), 0) / 2)}
                  </span>
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
