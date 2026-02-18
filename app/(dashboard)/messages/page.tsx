'use client';

import { ShellLayout } from '@/components/shell/shell-layout';
import { ChatSidebar } from '@/components/modules/messages/chat-sidebar';
import { ChatWindow } from '@/components/modules/messages/chat-window';

export default function MessagesPage() {
    return (
        <ShellLayout sidebar={<ChatSidebar />}>
            <ChatWindow />
        </ShellLayout>
    );
}
