'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, MessageSquare, Building2, Users, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface Notification {
    id: string;
    type: 'message' | 'erp' | 'crm' | 'stock' | 'system';
    title: string;
    description: string;
    isRead: boolean;
    createdAt: Date;
    link?: string;
}

// Mock notifications
const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'message',
        title: 'Yeni Mesaj',
        description: 'Ahmet Yılmaz size bir mesaj gönderdi',
        isRead: false,
        createdAt: new Date(Date.now() - 300000),
        link: '/messages/dm-1',
    },
    {
        id: '2',
        type: 'erp',
        title: 'Proje Güncellemesi',
        description: 'Proje Alpha için yeni milestone eklendi',
        isRead: false,
        createdAt: new Date(Date.now() - 3600000),
        link: '/erp/projects/1',
    },
    {
        id: '3',
        type: 'crm',
        title: 'Yeni Lead',
        description: 'Web sitesinden yeni bir potansiyel müşteri geldi',
        isRead: true,
        createdAt: new Date(Date.now() - 7200000),
        link: '/crm/leads/new',
    },
    {
        id: '4',
        type: 'stock',
        title: 'Stok Uyarısı',
        description: 'Çimento stoğu minimum seviyeye düştü',
        isRead: true,
        createdAt: new Date(Date.now() - 86400000),
        link: '/stock/alerts',
    },
];

interface NotificationBellProps {
    className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
    const [isOpen, setIsOpen] = useState(false);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'message':
                return MessageSquare;
            case 'erp':
                return Building2;
            case 'crm':
                return Users;
            case 'stock':
                return Package;
            default:
                return Bell;
        }
    };

    const getIconColor = (type: Notification['type']) => {
        switch (type) {
            case 'message':
                return 'text-blue-500 bg-blue-500/10';
            case 'erp':
                return 'text-purple-500 bg-purple-500/10';
            case 'crm':
                return 'text-green-500 bg-green-500/10';
            case 'stock':
                return 'text-orange-500 bg-orange-500/10';
            default:
                return 'text-muted-foreground bg-muted';
        }
    };

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    };

    const removeNotification = (id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn('relative', className)}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 text-[10px]"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-80 p-0 bg-surface border-border"
                align="end"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-semibold text-foreground">Bildirimler</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs text-primary h-auto py-1 px-2"
                        >
                            Tümünü Okundu İşaretle
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <ScrollArea className="max-h-96">
                    {notifications.length > 0 ? (
                        <div className="divide-y divide-border">
                            {notifications.map((notification) => {
                                const Icon = getIcon(notification.type);
                                const iconColor = getIconColor(notification.type);

                                return (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            'flex gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer',
                                            !notification.isRead && 'bg-primary/5'
                                        )}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className={cn('p-2 rounded-lg', iconColor)}>
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {notification.title}
                                                </p>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeNotification(notification.id);
                                                    }}
                                                    className="h-6 w-6 shrink-0"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {notification.description}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(notification.createdAt, {
                                                    addSuffix: true,
                                                    locale: tr,
                                                })}
                                            </p>
                                        </div>

                                        {!notification.isRead && (
                                            <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Bell className="h-12 w-12 text-muted-foreground/30 mb-3" />
                            <p className="text-sm text-muted-foreground">
                                Bildiriminiz bulunmuyor
                            </p>
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="border-t border-border p-2">
                        <Button variant="ghost" className="w-full text-sm">
                            Tüm Bildirimleri Gör
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
