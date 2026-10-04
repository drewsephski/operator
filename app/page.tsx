'use client';

import * as React from 'react';
import { Sidebar } from '@/components/operator/Sidebar';
import { OperatorChat } from '@/components/operator/OperatorChat';
import { ActivityDrawer } from '@/components/operator/ActivityDrawer';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
  testConnection,
  db,
} from '@/lib/firebase';
import {
  ChatMessage,
  ApprovalItem,
  ActivityLogItem,
} from '@/lib/types';
import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';

interface ConversationMeta {
  id: string;
  title: string;
  updatedAt: string;
}

export default function OperatorPage() {
  // Auth state
  const [user, setUser] = React.useState<User | null>(null);
  const [liveToken, setLiveToken] = React.useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = React.useState(false);

  // Layout state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isActivityOpen, setIsActivityOpen] = React.useState(false);

  // Conversations state
  const [conversations, setConversations] = React.useState<ConversationMeta[]>([]);
  const [activeConversationId, setActiveConversationId] = React.useState<string>('conv-default');
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  // Audit activities
  const [activities, setActivities] = React.useState<ActivityLogItem[]>([]);

  const loadConversationMessages = React.useCallback(async (userId: string, convoId: string) => {
    try {
      setActiveConversationId(convoId);
      const msgsRef = collection(db, 'users', userId, 'conversations', convoId, 'messages');
      const snap = await getDocs(msgsRef);
      const msgs: ChatMessage[] = [];
      snap.forEach((d) => {
        const data = d.data();
        msgs.push({
          id: d.id,
          role: data.role,
          content: data.content,
          createdAt: data.createdAt,
          approval: data.approval,
          calendarResults: data.calendarResults,
          emailResults: data.emailResults,
          fileResults: data.fileResults,
          taskResults: data.taskResults,
          briefingResult: data.briefingResult,
        });
      });

      msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      setMessages(msgs);
    } catch (err) {
      console.warn('Error loading conversation messages:', err);
    }
  }, []);

  const loadUserData = React.useCallback(async (userId: string) => {
    try {
      // Load conversations
      const convosRef = collection(db, 'users', userId, 'conversations');
      const convosSnap = await getDocs(convosRef);
      const loadedConvos: ConversationMeta[] = [];
      convosSnap.forEach((docSnap) => {
        const data = docSnap.data();
        loadedConvos.push({
          id: docSnap.id,
          title: data.title || 'Untitled Chat',
          updatedAt: data.updatedAt || new Date().toISOString(),
        });
      });

      if (loadedConvos.length > 0) {
        setConversations(loadedConvos);
        // Load messages for the most recent conversation
        loadConversationMessages(userId, loadedConvos[0].id);
      }

      // Load activities
      const actRef = collection(db, 'users', userId, 'activity');
      const actSnap = await getDocs(actRef);
      const loadedActs: ActivityLogItem[] = [];
      actSnap.forEach((docSnap) => {
        const d = docSnap.data();
        loadedActs.push({
          id: docSnap.id,
          action: d.action,
          details: d.details,
          status: d.status,
          timestamp: d.timestamp,
          actor: d.actor || 'Operator AI',
        });
      });
      setActivities(loadedActs);
    } catch (err) {
      console.warn('Firestore load note:', err);
    }
  }, [loadConversationMessages]);

  // 1. Initialize Auth and verify connection
  React.useEffect(() => {
    testConnection();

    const unsubscribe = initAuth(
      (authedUser, token) => {
        setUser(authedUser);
        setLiveToken(token);
        loadUserData(authedUser.uid);
      },
      () => {
        setUser(null);
        setLiveToken(null);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [loadUserData]);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setLiveToken(res.accessToken);
        loadUserData(res.user.uid);
      }
    } catch (err) {
      console.error('Sign in error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setLiveToken(null);
    setMessages([]);
    setConversations([]);
    setActiveConversationId(`conv-${Date.now()}`);
  };

  // Helper to append and persist activity
  const logActivity = async (action: string, details: string, status: ActivityLogItem['status']) => {
    const newAct: ActivityLogItem = {
      id: `act-${Date.now()}`,
      action,
      details,
      status,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: 'Operator AI',
    };
    setActivities((prev) => [newAct, ...prev]);

    if (user?.uid) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'activity', newAct.id), {
          ...newAct,
          userId: user.uid,
        });
      } catch (err) {
        console.warn('Firestore activity sync note:', err);
      }
    }
  };

  // Send message to Operator Reasoning Agent
  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    // Check for any currently pending approval that might be refined conversationally
    const latestApproval = [...messages]
      .reverse()
      .find((m) => m.approval && m.approval.status === 'pending')?.approval;

    try {
      const res = await fetch('/api/gemini/operator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          pendingApproval: latestApproval,
          accessToken: liveToken || getAccessToken(),
          userEmail: user?.email,
          currentLocalTime: new Date().toISOString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.text || '',
        createdAt: new Date().toISOString(),
        approval: data.approval || undefined,
        calendarResults: data.calendarResults || undefined,
        emailResults: data.emailResults || undefined,
        fileResults: data.fileResults || undefined,
        taskResults: data.taskResults || undefined,
        briefingResult: data.briefingResult || undefined,
      };

      const updatedAll = [...newMessages, assistantMessage];
      setMessages(updatedAll);

      // Persist to Firestore if user signed in
      if (user?.uid) {
        const convoId = activeConversationId;
        // Save conversation metadata
        const firstMessage = updatedAll[0]?.content || 'New Conversation';
        const convoTitle = firstMessage.length > 32 ? firstMessage.slice(0, 32) + '...' : firstMessage;

        await setDoc(doc(db, 'users', user.uid, 'conversations', convoId), {
          title: convoTitle,
          updatedAt: new Date().toISOString(),
          userId: user.uid,
        });

        // Update local conversations list
        setConversations((prev) => {
          const filtered = prev.filter((c) => c.id !== convoId);
          return [{ id: convoId, title: convoTitle, updatedAt: new Date().toISOString() }, ...filtered];
        });

        // Save messages in subcollection
        await setDoc(doc(db, 'users', user.uid, 'conversations', convoId, 'messages', userMessage.id), userMessage);
        await setDoc(doc(db, 'users', user.uid, 'conversations', convoId, 'messages', assistantMessage.id), assistantMessage);
      }
    } catch (err: any) {
      console.error('Operator Agent call error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Operator encountered an issue: ${err.message || 'Please check your connection and try again.'}`,
        createdAt: new Date().toISOString(),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // When an approval is executed
  const handleApprovalExecuted = async (updatedApproval: ApprovalItem) => {
    // Update local state in messages
    setMessages((prev) =>
      prev.map((m) => (m.approval?.id === updatedApproval.id ? { ...m, approval: updatedApproval } : m))
    );

    // Log in audit log
    const desc =
      updatedApproval.actionType === 'send_email'
        ? `Sent email to ${updatedApproval.payload.recipient} ("${updatedApproval.payload.subject}")`
        : updatedApproval.actionType === 'create_task'
        ? `Created task "${updatedApproval.payload.taskTitle}"`
        : updatedApproval.actionType === 'update_calendar_event'
        ? `Rescheduled calendar event "${updatedApproval.payload.title}"`
        : `Executed ${updatedApproval.actionType}`;

    await logActivity('Approved Action Executed', desc, 'approved');

    // Update in Firestore
    if (user?.uid) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'approvals', updatedApproval.id), {
          ...updatedApproval,
          userId: user.uid,
          executedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore approval update note:', err);
      }
    }
  };

  // When user cancels a pending approval
  const handleApprovalCancelled = async (approvalId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.approval?.id === approvalId
          ? { ...m, approval: { ...m.approval, status: 'rejected' } }
          : m
      )
    );
    await logActivity('Action Cancelled', `User dismissed proposal ${approvalId}`, 'dismissed');
  };

  // Start new conversation
  const handleNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    setActiveConversationId(newId);
    setMessages([]);
  };

  // Delete conversation
  const handleDeleteConversation = async (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      handleNewConversation();
    }
    if (user?.uid) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'conversations', id));
      } catch (err) {
        console.warn('Firestore delete convo error:', err);
      }
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-black text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white">
      {/* 1. Minimalist Sidebar */}
      <Sidebar
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isSigningIn={isSigningIn}
        hasLiveToken={!!liveToken}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => {
          if (user?.uid) loadConversationMessages(user.uid, id);
        }}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onOpenActivity={() => setIsActivityOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Conversation Stream (The Application) */}
      <main className="flex flex-1 flex-col h-full overflow-hidden bg-black">
        <OperatorChat
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          accessToken={liveToken}
          user={user}
          onSignIn={handleSignIn}
          onApprovalExecuted={handleApprovalExecuted}
          onApprovalCancelled={handleApprovalCancelled}
        />
      </main>

      {/* 3. Audit & Activity Slide-out Drawer */}
      <ActivityDrawer
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
        activities={activities}
        onClearHistory={() => setActivities([])}
      />
    </div>
  );
}
