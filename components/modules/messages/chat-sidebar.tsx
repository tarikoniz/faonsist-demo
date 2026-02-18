'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Search, Plus, Hash, Users, MessageSquare,
    ChevronDown, ChevronRight, Settings, MoreVertical
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useChat } from '@/hooks/use-chat';
import { ChannelType } from '@/types/messages';

interface ChatSidebarProps {
    className?: string;
}

export function ChatSidebar({ className }: ChatSidebarProps) {
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');
    const [isChannelsOpen, setIsChannelsOpen] = useState(true);
    const [isDMsOpen, setIsDMsOpen] = useState(true);
    const [isGroupsOpen, setIsGroupsOpen] = useState(true);

    const {
        filteredChannels,
        activeChannel,
        setActiveChannel,
        totalUnreadCount,
        isUserOnline,
    } = useChat();

    // Filter channels by search
    const searchedChannels = filteredChannels.filter((ch) =>
        ch.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group channels by type
    const channels = searchedChannels.filter((ch) => ch.type === ChannelType.CHANNEL);
    const dms = searchedChannels.filter((ch) => ch.type === ChannelType.DM);
    const groups = searchedChannels.filter((ch) => ch.type === ChannelType.GROUP);

    const getStatusColor = (userId: string) => {
        return isUserOnline(userId) ? 'bg-green-500' : 'bg-muted-foreground';
    };

    return (
        <TooltipProvider>
            <div className={cn('flex flex-col h-full', className)}>
                {/* Header */}
                <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-foreground">FaOn-Connect</h2>
                            {totalUnreadCount > 0 && (
                                <Badge variant="default" className="h-5 px-1.5 text-[10px]">
                                    {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
                                </Badge>
                            )}
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg">
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem>
                                    <Hash className="mr-2 h-4 w-4" />
                                    Yeni Kanal
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Users className="mr-2 h-4 w-4" />
                                    Yeni Grup
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Yeni Mesaj
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-9 bg-background border-border"
                        />
                    </div>
                </div>

                {/* Channel Lists */}
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-4">
                        {/* Channels Section */}
                        {channels.length > 0 && (
                            <div>
                                <button
                                    onClick={() => setIsChannelsOpen(!isChannelsOpen)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground w-full"
                                >
                                    {isChannelsOpen ? (
                                        <ChevronDown className="h-3 w-3" />
                                    ) : (
                                        <ChevronRight className="h-3 w-3" />
                                    )}
                                    Kanallar
                                    {channels.reduce((sum, ch) => sum + (ch.unreadCount || 0), 0) > 0 && (
                                        <Badge variant="secondary" className="ml-auto h-4 px-1 text-[10px]">
                                            {channels.reduce((sum, ch) => sum + (ch.unreadCount || 0), 0)}
                                        </Badge>
                                    )}
                                </button>

                                {isChannelsOpen && (
                                    <div className="mt-1 space-y-0.5">
                                        {channels.map((channel) => (
                                            <ChannelItem
                                                key={channel.id}
                                                channel={channel}
                                                isActive={activeChannel?.id === channel.id}
                                                onClick={() => setActiveChannel(channel)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Direct Messages Section */}
                        {dms.length > 0 && (
                            <div>
                                <button
                                    onClick={() => setIsDMsOpen(!isDMsOpen)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground w-full"
                                >
                                    {isDMsOpen ? (
                                        <ChevronDown className="h-3 w-3" />
                                    ) : (
                                        <ChevronRight className="h-3 w-3" />
                                    )}
                                    Direkt Mesajlar
                                </button>

                                {isDMsOpen && (
                                    <div className="mt-1 space-y-0.5">
                                        {dms.map((channel) => (
                                            <DMItem
                                                key={channel.id}
                                                channel={channel}
                                                isActive={activeChannel?.id === channel.id}
                                                isOnline={isUserOnline(channel.members[1]?.userId || '')}
                                                onClick={() => setActiveChannel(channel)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Groups Section */}
                        {groups.length > 0 && (
                            <div>
                                <button
                                    onClick={() => setIsGroupsOpen(!isGroupsOpen)}
                                    className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground w-full"
                                >
                                    {isGroupsOpen ? (
                                        <ChevronDown className="h-3 w-3" />
                                    ) : (
                                        <ChevronRight className="h-3 w-3" />
                                    )}
                                    Gruplar
                                </button>

                                {isGroupsOpen && (
                                    <div className="mt-1 space-y-0.5">
                                        {groups.map((channel) => (
                                            <ChannelItem
                                                key={channel.id}
                                                channel={channel}
                                                isActive={activeChannel?.id === channel.id}
                                                onClick={() => setActiveChannel(channel)}
                                                icon={Users}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Empty State */}
                    {searchedChannels.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                            <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-3" />
                            <p className="text-sm text-muted-foreground">
                                {searchQuery ? 'Sonuç bulunamadı' : 'Henüz sohbet yok'}
                            </p>
                        </div>
                    )}
                </ScrollArea>
            </div>
        </TooltipProvider>
    );
}

// Channel Item Component
function ChannelItem({
    channel,
    isActive,
    onClick,
    icon: Icon = Hash
}: {
    channel: any;
    isActive: boolean;
    onClick: () => void;
    icon?: any;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors group',
                'hover:bg-muted',
                isActive && 'bg-primary/10 text-primary hover:bg-primary/15'
            )}
        >
            <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
            <span className="flex-1 text-sm font-medium truncate text-left">
                {channel.name}
            </span>
            {channel.unreadCount > 0 && (
                <Badge variant="default" className="h-5 min-w-5 px-1.5 text-[10px] bg-primary">
                    {channel.unreadCount > 9 ? '9+' : channel.unreadCount}
                </Badge>
            )}
        </button>
    );
}

// DM Item Component
function DMItem({
    channel,
    isActive,
    isOnline,
    onClick
}: {
    channel: any;
    isActive: boolean;
    isOnline: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors',
                'hover:bg-muted',
                isActive && 'bg-primary/10 text-primary hover:bg-primary/15'
            )}
        >
            <div className="relative">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${channel.name}`} />
                    <AvatarFallback className="text-[10px]">
                        {channel.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div
                    className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface',
                        isOnline ? 'bg-green-500' : 'bg-muted-foreground'
                    )}
                />
            </div>
            <span className="flex-1 text-sm font-medium truncate text-left">
                {channel.name}
            </span>
            {channel.unreadCount > 0 && (
                <Badge variant="default" className="h-5 min-w-5 px-1.5 text-[10px] bg-primary">
                    {channel.unreadCount > 9 ? '9+' : channel.unreadCount}
                </Badge>
            )}
        </button>
    );
}
