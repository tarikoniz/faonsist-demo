'use client';

import { useState } from 'react';
import {
  Users,
  Phone,
  FileText,
  Handshake,
  Home,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  MoreVertical,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Deal {
  id: string;
  customerName: string;
  projectName: string;
  value: number;
  probability: number;
  stage: 'lead' | 'meeting' | 'proposal' | 'negotiation' | 'contract';
  assignee: string;
  lastContact: string;
  nextAction: string;
  daysInStage: number;
}

const PIPELINE_STAGES = [
  {
    id: 'lead',
    name: 'Potansiyel',
    icon: Users,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
  },
  {
    id: 'meeting',
    name: 'Görüşme',
    icon: Phone,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  {
    id: 'proposal',
    name: 'Teklif',
    icon: FileText,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  {
    id: 'negotiation',
    name: 'Müzakere',
    icon: Handshake,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  {
    id: 'contract',
    name: 'Sözleşme',
    icon: Home,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
  },
];

const MOCK_DEALS: Deal[] = [
  {
    id: '1',
    customerName: 'Zeynep Yılmaz',
    projectName: 'Çengelköy Villa',
    value: 4500000,
    probability: 20,
    stage: 'lead',
    assignee: 'Ahmet K.',
    lastContact: '2 gün önce',
    nextAction: 'İlk görüşme planla',
    daysInStage: 3,
  },
  {
    id: '2',
    customerName: 'Mehmet Öz',
    projectName: 'Kadıköy Daire',
    value: 1800000,
    probability: 35,
    stage: 'meeting',
    assignee: 'Ayşe D.',
    lastContact: '5 saat önce',
    nextAction: 'Vaziyet planı gönder',
    daysInStage: 7,
  },
  {
    id: '3',
    customerName: 'Elif Şahin',
    projectName: 'Ataşehir Residence',
    value: 2200000,
    probability: 40,
    stage: 'meeting',
    assignee: 'Mehmet Y.',
    lastContact: '1 gün önce',
    nextAction: 'Şantiye gezisi ayarla',
    daysInStage: 5,
  },
  {
    id: '4',
    customerName: 'Can Demir',
    projectName: 'Etiler Plaza',
    value: 8500000,
    probability: 60,
    stage: 'proposal',
    assignee: 'Fatma S.',
    lastContact: 'Bugün',
    nextAction: 'Revize teklif hazırla',
    daysInStage: 12,
  },
  {
    id: '5',
    customerName: 'Selin Kaya',
    projectName: 'Nişantaşı Ofis',
    value: 3200000,
    probability: 75,
    stage: 'negotiation',
    assignee: 'Ali R.',
    lastContact: '3 saat önce',
    nextAction: 'Fiyat görüşmesi yap',
    daysInStage: 8,
  },
  {
    id: '6',
    customerName: 'Burak Arslan',
    projectName: 'Beşiktaş Penthouse',
    value: 5800000,
    probability: 90,
    stage: 'contract',
    assignee: 'Zeynep T.',
    lastContact: '1 saat önce',
    nextAction: 'Kat karşılığı sözleşmesi',
    daysInStage: 4,
  },
];

export function SalesPipeline() {
  const [deals] = useState<Deal[]>(MOCK_DEALS);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStageDeals = (stageId: string) => {
    return deals.filter((deal) => deal.stage === stageId);
  };

  const getTotalValue = (stageId: string) => {
    return getStageDeals(stageId).reduce((sum, deal) => sum + deal.value, 0);
  };

  const getWeightedValue = (stageId: string) => {
    return getStageDeals(stageId).reduce(
      (sum, deal) => sum + (deal.value * deal.probability) / 100,
      0
    );
  };

  const totalPipelineValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const weightedPipelineValue = deals.reduce(
    (sum, deal) => sum + (deal.value * deal.probability) / 100,
    0
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Toplam Pipeline Değeri</CardDescription>
            <CardTitle className="text-2xl text-blue-400">{formatCurrency(totalPipelineValue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span>{deals.length} aktif fırsat</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Ağırlıklı Değer</CardDescription>
            <CardTitle className="text-2xl text-green-400">{formatCurrency(weightedPipelineValue)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Gerçekleşme tahmini</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Ortalama Fırsat Değeri</CardDescription>
            <CardTitle className="text-2xl text-purple-400">
              {formatCurrency(totalPipelineValue / deals.length)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>Müşteri başına</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Sözleşme Aşamasında</CardDescription>
            <CardTitle className="text-2xl text-cyan-400">
              {formatCurrency(getTotalValue('contract'))}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={90} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {PIPELINE_STAGES.map((stage) => {
          const stageDeals = getStageDeals(stage.id);
          const stageValue = getTotalValue(stage.id);
          const StageIcon = stage.icon;

          return (
            <div key={stage.id} className="space-y-3">
              {/* Stage Header */}
              <Card className={cn('glass border', stage.borderColor)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn('p-2 rounded-lg', stage.bgColor)}>
                      <StageIcon className={cn('h-4 w-4', stage.color)} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm text-foreground">{stage.name}</h3>
                      <p className="text-xs text-muted-foreground">{stageDeals.length} fırsat</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">Toplam Değer</p>
                    <p className={cn('font-bold text-sm', stage.color)}>{formatCurrency(stageValue)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Deal Cards */}
              <div className="space-y-2">
                {stageDeals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="glass border-border/50 hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <CardContent className="p-4">
                      {/* Deal Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-foreground truncate">{deal.customerName}</h4>
                          <p className="text-xs text-muted-foreground truncate">{deal.projectName}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Düzenle</DropdownMenuItem>
                            <DropdownMenuItem>Taşı</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Sil</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Value */}
                      <div className="mb-3">
                        <p className="text-lg font-bold text-primary">{formatCurrency(deal.value)}</p>
                      </div>

                      {/* Probability */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Olasılık</span>
                          <span className="font-semibold text-cyan-400">{deal.probability}%</span>
                        </div>
                        <Progress value={deal.probability} className="h-1.5" />
                      </div>

                      {/* Details */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>{deal.assignee}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{deal.lastContact}</span>
                        </div>
                      </div>

                      {/* Next Action */}
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Sonraki Adım</p>
                        <p className="text-xs font-medium text-foreground">{deal.nextAction}</p>
                      </div>

                      {/* Days in Stage Badge */}
                      <div className="mt-2">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            deal.daysInStage > 10 ? 'border-orange-500/30 text-orange-400' : ''
                          )}
                        >
                          {deal.daysInStage} gündür bu aşamada
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {stageDeals.length === 0 && (
                  <div className="p-4 text-center text-xs text-muted-foreground border border-dashed border-border/50 rounded-xl">
                    Henüz fırsat yok
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
