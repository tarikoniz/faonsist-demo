'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface HakedisItem {
  id: string;
  projectName: string;
  projectCode: string;
  period: string;
  plannedBudget: number;
  actualCost: number;
  completionRate: number;
  variance: number;
  status: 'on-track' | 'warning' | 'critical' | 'completed';
  category: string;
}

const MOCK_HAKEDIS: HakedisItem[] = [
  {
    id: 'H-2024-001',
    projectName: 'Ataşehir Rezidans A Blok',
    projectCode: 'PRJ-2024-001',
    period: 'Ocak 2024',
    plannedBudget: 2500000,
    actualCost: 2350000,
    completionRate: 45,
    variance: -150000,
    status: 'on-track',
    category: 'Konut',
  },
  {
    id: 'H-2024-002',
    projectName: 'Maslak Plaza AVM',
    projectCode: 'PRJ-2023-045',
    period: 'Ocak 2024',
    plannedBudget: 5800000,
    actualCost: 6200000,
    completionRate: 62,
    variance: 400000,
    status: 'warning',
    category: 'Ticari',
  },
  {
    id: 'H-2024-003',
    projectName: 'Kadıköy Metro Hattı',
    projectCode: 'PRJ-2023-089',
    period: 'Ocak 2024',
    plannedBudget: 8500000,
    actualCost: 9100000,
    completionRate: 78,
    variance: 600000,
    status: 'critical',
    category: 'Altyapı',
  },
  {
    id: 'H-2023-125',
    projectName: 'Beylikdüzü Konut Sitesi',
    projectCode: 'PRJ-2023-012',
    period: 'Aralık 2023',
    plannedBudget: 4200000,
    actualCost: 4150000,
    completionRate: 100,
    variance: -50000,
    status: 'completed',
    category: 'Konut',
  },
];

export function HakedisTable() {
  const [selectedItem, setSelectedItem] = useState<HakedisItem | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusConfig = (status: HakedisItem['status']) => {
    switch (status) {
      case 'on-track':
        return {
          label: 'Hedefte',
          color: 'bg-green-500/10 text-green-500 border-green-500/20',
          icon: CheckCircle2,
        };
      case 'warning':
        return {
          label: 'Dikkat',
          color: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
          icon: AlertTriangle,
        };
      case 'critical':
        return {
          label: 'Kritik',
          color: 'bg-red-500/10 text-red-500 border-red-500/20',
          icon: AlertTriangle,
        };
      case 'completed':
        return {
          label: 'Tamamlandı',
          color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          icon: CheckCircle2,
        };
    }
  };

  const totalPlanned = MOCK_HAKEDIS.reduce((sum, item) => sum + item.plannedBudget, 0);
  const totalActual = MOCK_HAKEDIS.reduce((sum, item) => sum + item.actualCost, 0);
  const totalVariance = totalActual - totalPlanned;
  const avgCompletion = MOCK_HAKEDIS.reduce((sum, item) => sum + item.completionRate, 0) / MOCK_HAKEDIS.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Planlanan Bütçe</CardDescription>
            <CardTitle className="text-2xl text-blue-400">{formatCurrency(totalPlanned)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>Toplam {MOCK_HAKEDIS.length} proje</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Gerçekleşen Maliyet</CardDescription>
            <CardTitle className="text-2xl text-purple-400">{formatCurrency(totalActual)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Ocak 2024 sonu</span>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          'glass border-border/50',
          totalVariance > 0 ? 'border-red-500/30' : 'border-green-500/30'
        )}>
          <CardHeader className="pb-2">
            <CardDescription>Fark Analizi</CardDescription>
            <CardTitle className={cn(
              'text-2xl flex items-center gap-2',
              totalVariance > 0 ? 'text-red-400' : 'text-green-400'
            )}>
              {totalVariance > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {formatCurrency(Math.abs(totalVariance))}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs">
              <span className={totalVariance > 0 ? 'text-red-400' : 'text-green-400'}>
                {totalVariance > 0 ? 'Aşım' : 'Tasarruf'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Ortalama Tamamlanma</CardDescription>
            <CardTitle className="text-2xl text-cyan-400">{avgCompletion.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={avgCompletion} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Hakediş Table */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Hakediş Raporu - Detaylı Görünüm
          </CardTitle>
          <CardDescription>
            Proje bazında planlanan bütçe, gerçekleşen maliyet ve tamamlanma oranları
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {MOCK_HAKEDIS.map((item) => {
              const statusConfig = getStatusConfig(item.status);
              const StatusIcon = statusConfig.icon;
              const variancePercentage = ((item.variance / item.plannedBudget) * 100).toFixed(1);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={cn(
                    'p-4 rounded-xl border transition-all cursor-pointer',
                    'hover:shadow-lg hover:scale-[1.01]',
                    selectedItem?.id === item.id
                      ? 'bg-primary/5 border-primary/50 shadow-lg'
                      : 'bg-surface/30 border-border/50 hover:border-primary/30'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Project Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-xs">
                          {item.projectCode}
                        </Badge>
                        <Badge className={cn('text-xs', statusConfig.color)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.period}</span>
                      </div>
                      <h4 className="font-semibold text-foreground">{item.projectName}</h4>
                      <p className="text-xs text-muted-foreground">{item.category}</p>
                    </div>

                    {/* Financial Data */}
                    <div className="grid grid-cols-3 gap-6 text-right">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Planlanan</p>
                        <p className="text-sm font-semibold text-blue-400">{formatCurrency(item.plannedBudget)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Gerçekleşen</p>
                        <p className="text-sm font-semibold text-purple-400">{formatCurrency(item.actualCost)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Fark</p>
                        <p className={cn(
                          'text-sm font-semibold',
                          item.variance > 0 ? 'text-red-400' : 'text-green-400'
                        )}>
                          {item.variance > 0 ? '+' : ''}{formatCurrency(item.variance)}
                          <span className="text-xs ml-1">({variancePercentage}%)</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Tamamlanma Oranı</span>
                      <span className="font-semibold text-cyan-400">{item.completionRate}%</span>
                    </div>
                    <Progress value={item.completionRate} className="h-2" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
