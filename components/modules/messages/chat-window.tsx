'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Send, Paperclip, Smile, MoreVertical, Phone, Video,
    Search, Pin, AtSign, Hash, Users, Info, X,
    Mic, Image as ImageIcon, File, Reply, Edit, Trash2,
    ThumbsUp, Heart, Laugh, Check, CheckCheck, Wifi, WifiOff
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
import { useSocketChat } from '@/hooks/use-socket-chat';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ChannelType, Message } from '@/types/messages';

interface ChatWindowProps {
    className?: string;
}

export function ChatWindow({ className }: ChatWindowProps) {
    const {
        activeChannel,
        activeMessages,
        typingUsers,
        isUserOnline,
    } = useChat();

    // Socket.IO gerçek zamanlı hook — Railway'e bağlanır
    const { sendSocketMessage, startTyping, stopTyping, isConnected } = useSocketChat(
        activeChannel?.id ?? null
    );

    const [newMessage, setNewMessage] = useState('');
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auth store'dan gerçek kullanıcı ID'sini al
    const currentUserId = typeof window !== 'undefined'
        ? (() => {
            try {
                const auth = JSON.parse(localStorage.getItem('faonsist-auth') || '{}');
                return auth?.state?.user?.id || null;
            } catch { return null; }
          })()
        : null;

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [activeMessages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Socket.IO üzerinden gönder (Railway → tüm kullanıcılara anlık)
        sendSocketMessage(newMessage.trim());
        setNewMessage('');
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    // Input değişince typing event'i gönder
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewMessage(e.target.value);
        if (e.target.value.trim()) {
            startTyping();
        } else {
            stopTyping();
        }
    };

    const formatMessageTime = (date: Date) => {
        if (isToday(date)) {
            return format(date, 'HH:mm', { locale: tr });
        }
        if (isYesterday(date)) {
            return `Dün ${format(date, 'HH:mm', { locale: tr })}`;
        }
        return format(date, 'dd MMM HH:mm', { locale: tr });
    };

    const formatDateSeparator = (date: Date) => {
        if (isToday(date)) return 'Bugün';
        if (isYesterday(date)) return 'Dün';
        return format(date, 'dd MMMM yyyy', { locale: tr });
    };

    // createdAt'i her zaman Date nesnesine çevir (socket'ten string gelebilir)
    const safeDate = (d: any): Date => {
        if (!d) return new Date();
        if (d instanceof Date) return d;
        return new Date(d);
    };

    // Group messages by date
    const groupedMessages = activeMessages.reduce((groups, message, index) => {
        const msgDate = safeDate(message.createdAt);
        const date = format(msgDate, 'yyyy-MM-dd');
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push({ ...message, createdAt: msgDate, index });
        return groups;
    }, {} as Record<string, (Message & { index: number })[]>);

    if (!activeChannel) {
        return (
            <div className={cn('flex flex-col items-center justify-center h-full bg-background', className)}>
                <div className="text-center space-y-4 p-8">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                        <Hash className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground">FaOn-Connect'e Hoş Geldiniz</h2>
                    <p className="text-muted-foreground max-w-md">
                        Sol panelden bir kanal veya sohbet seçerek mesajlaşmaya başlayın.
                    </p>
                </div>
            </div>
        );
    }

    const memberCount = activeChannel.members.length;
    const onlineCount = activeChannel.members.filter(m => isUserOnline(m.userId)).length;

    return (
        <TooltipProvider>
            <div className={cn('flex h-full bg-background', className)}>
                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface/30">
                        <div className="flex items-center gap-3">
                            {activeChannel.type === ChannelType.DM ? (
                                <div className="relative">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChannel.name}`} />
                                        <AvatarFallback>
                                            {activeChannel.name.slice(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={cn(
                                            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface',
                                            isUserOnline(activeChannel.members[1]?.userId || '') ? 'bg-green-500' : 'bg-muted-foreground'
                                        )}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                                    {activeChannel.type === ChannelType.GROUP ? (
                                        <Users className="h-5 w-5 text-primary" />
                                    ) : (
                                        <Hash className="h-5 w-5 text-primary" />
                                    )}
                                </div>
                            )}

                            <div>
                                <h2 className="font-semibold text-foreground flex items-center gap-2">
                                    {activeChannel.name}
                                    {activeChannel.isPrivate && (
                                        <Badge variant="outline" className="text-[10px] h-4">Özel</Badge>
                                    )}
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {activeChannel.type === ChannelType.DM
                                        ? (isUserOnline(activeChannel.members[1]?.userId || '') ? 'Çevrimiçi' : 'Çevrimdışı')
                                        : `${memberCount} üye, ${onlineCount} çevrimiçi`
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1">
                            {/* Gerçek zamanlı bağlantı göstergesi */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-1 px-2">
                                        {isConnected ? (
                                            <Wifi className="h-3.5 w-3.5 text-green-500" />
                                        ) : (
                                            <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
                                        )}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    {isConnected ? 'Gerçek zamanlı bağlantı aktif' : 'Bağlantı kuruluyor...'}
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-9 w-9">
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Sesli Arama</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-9 w-9">
                                        <Video className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Görüntülü Arama</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button size="icon" variant="ghost" className="h-9 w-9">
                                        <Pin className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Sabitlenmiş Mesajlar</TooltipContent>
                            </Tooltip>

                            <Separator orientation="vertical" className="h-6 mx-1" />

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        variant={isInfoOpen ? 'secondary' : 'ghost'}
                                        className="h-9 w-9"
                                        onClick={() => setIsInfoOpen(!isInfoOpen)}
                                    >
                                        <Info className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Kanal Bilgisi</TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <ScrollArea className="flex-1 px-6" ref={scrollRef}>
                        <div className="py-4 space-y-4">
                            {Object.entries(groupedMessages).map(([date, messages]) => (
                                <div key={date}>
                                    {/* Date Separator */}
                                    <div className="flex items-center gap-4 my-4">
                                        <Separator className="flex-1" />
                                        <span className="text-xs text-muted-foreground font-medium">
                                            {formatDateSeparator(messages[0].createdAt)}
                                        </span>
                                        <Separator className="flex-1" />
                                    </div>

                                    {/* Messages */}
                                    <div className="space-y-2">
                                        {messages.map((message, idx) => {
                                            const isOwnMessage = message.userId === currentUserId;
                                            const showAvatar = idx === 0 || messages[idx - 1].userId !== message.userId;
                                            const showTime = idx === messages.length - 1 || messages[idx + 1].userId !== message.userId;

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={cn(
                                                        'flex gap-3 group relative',
                                                        isOwnMessage && 'flex-row-reverse'
                                                    )}
                                                    onMouseEnter={() => setHoveredMessageId(message.id)}
                                                    onMouseLeave={() => setHoveredMessageId(null)}
                                                >
                                                    {/* Avatar */}
                                                    <div className={cn('flex-shrink-0 w-8', !showAvatar && 'invisible')}>
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.user?.name || (message as any).user}`} />
                                                            <AvatarFallback className="text-xs">
                                                                {(message.user?.name || (message as any).user || 'U').slice(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>

                                                    {/* Message Content */}
                                                    <div className={cn('flex-1 max-w-2xl', isOwnMessage && 'flex flex-col items-end')}>
                                                        {showAvatar && (
                                                            <div className={cn('flex items-center gap-2 mb-1', isOwnMessage && 'flex-row-reverse')}>
                                                                <span className="text-sm font-medium text-foreground">
                                                                    {message.user?.name || (message as any).user || 'Bilinmiyor'}
                                                                </span>
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    {formatMessageTime(message.createdAt)}
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="relative">
                                                            <div
                                                                className={cn(
                                                                    'inline-block px-4 py-2.5 rounded-2xl transition-all duration-150',
                                                                    isOwnMessage
                                                                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                                                        : 'bg-surface text-foreground rounded-tl-sm'
                                                                )}
                                                            >
                                                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                                                                    {(message as any).text || message.content}
                                                                </p>
                                                            </div>

                                                            {/* Message Actions */}
                                                            {hoveredMessageId === message.id && (
                                                                <div
                                                                    className={cn(
                                                                        'absolute top-0 flex items-center gap-0.5 bg-surface border border-border rounded-lg shadow-lg p-0.5',
                                                                        isOwnMessage ? 'right-full mr-2' : 'left-full ml-2'
                                                                    )}
                                                                >
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button size="icon" variant="ghost" className="h-7 w-7">
                                                                                <ThumbsUp className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Beğen</TooltipContent>
                                                                    </Tooltip>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button size="icon" variant="ghost" className="h-7 w-7">
                                                                                <Reply className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Yanıtla</TooltipContent>
                                                                    </Tooltip>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button size="icon" variant="ghost" className="h-7 w-7">
                                                                                <MoreVertical className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="start">
                                                                            <DropdownMenuItem>
                                                                                <Pin className="mr-2 h-4 w-4" />
                                                                                Sabitle
                                                                            </DropdownMenuItem>
                                                                            {isOwnMessage && (
                                                                                <>
                                                                                    <DropdownMenuItem>
                                                                                        <Edit className="mr-2 h-4 w-4" />
                                                                                        Düzenle
                                                                                    </DropdownMenuItem>
                                                                                    <DropdownMenuSeparator />
                                                                                    <DropdownMenuItem className="text-destructive">
                                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                                        Sil
                                                                                    </DropdownMenuItem>
                                                                                </>
                                                                            )}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Read Status */}
                                                        {isOwnMessage && showTime && (
                                                            <div className="flex items-center gap-1 mt-0.5 text-muted-foreground">
                                                                <CheckCheck className="h-3.5 w-3.5 text-primary" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {typingUsers.length > 0 && (
                                <div className="flex items-center gap-2 px-3 py-2">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        {typingUsers.map(t => t.userName).join(', ')} yazıyor...
                                    </span>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 border-t border-border bg-surface/30">
                        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                            <div className="flex-1">
                                <div className="relative">
                                    <Textarea
                                        ref={inputRef}
                                        placeholder={`${activeChannel.name}'e mesaj gönder...`}
                                        value={newMessage}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        onBlur={() => stopTyping()}
                                        rows={1}
                                        className="min-h-11 max-h-32 pr-24 bg-background border-border resize-none"
                                    />
                                    <div className="absolute right-2 bottom-2.5 flex items-center gap-0.5">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button type="button" size="icon" variant="ghost" className="h-7 w-7">
                                                    <Paperclip className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Dosya Ekle</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button type="button" size="icon" variant="ghost" className="h-7 w-7">
                                                    <ImageIcon className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Resim Ekle</TooltipContent>
                                        </Tooltip>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button type="button" size="icon" variant="ghost" className="h-7 w-7">
                                                    <Smile className="h-4 w-4" />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>Emoji</TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                size="icon"
                                className="h-11 w-11 rounded-xl btn-glow shrink-0"
                                disabled={!newMessage.trim()}
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>

                        <p className="text-[10px] text-muted-foreground mt-2 text-center">
                            Enter ile gönder, Shift+Enter ile yeni satır
                        </p>
                    </div>
                </div>

                {/* Info Panel */}
                {isInfoOpen && (
                    <div className="w-80 border-l border-border bg-surface/50 flex flex-col">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                            <h3 className="font-semibold">Kanal Bilgisi</h3>
                            <Button size="icon" variant="ghost" onClick={() => setIsInfoOpen(false)} className="h-8 w-8">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-6">
                                {/* Channel Info */}
                                <div className="text-center space-y-3">
                                    <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-primary/10 mx-auto">
                                        {activeChannel.type === ChannelType.GROUP ? (
                                            <Users className="h-8 w-8 text-primary" />
                                        ) : (
                                            <Hash className="h-8 w-8 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{activeChannel.name}</h4>
                                        {activeChannel.description && (
                                            <p className="text-sm text-muted-foreground mt-1">{activeChannel.description}</p>
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Members */}
                                <div>
                                    <h4 className="text-sm font-medium mb-3">Üyeler ({memberCount})</h4>
                                    <div className="space-y-2">
                                        {activeChannel.members.slice(0, 10).map((member: any) => (
                                            <div key={member.userId} className="flex items-center gap-3">
                                                <div className="relative">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.userId}`} />
                                                        <AvatarFallback className="text-xs">U{member.userId}</AvatarFallback>
                                                    </Avatar>
                                                    <div
                                                        className={cn(
                                                            'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface',
                                                            isUserOnline(member.userId) ? 'bg-green-500' : 'bg-muted-foreground'
                                                        )}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">Kullanıcı {member.userId}</p>
                                                    <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}
