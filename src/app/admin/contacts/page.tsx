'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Contact {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'new' | 'read' | 'replied';
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch('/api/admin/contacts');
      const data = await response.json();
      if (response.ok) {
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateContactStatus = async (id: string, status: 'read' | 'replied') => {
    try {
      const response = await fetch(`/api/admin/contacts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setContacts(prev => 
          prev.map(contact => 
            contact.id === id ? { ...contact, status } : contact
          )
        );
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  const newContacts = contacts.filter(contact => contact.status === 'new');
  const readContacts = contacts.filter(contact => contact.status === 'read');
  const repliedContacts = contacts.filter(contact => contact.status === 'replied');

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">お問い合わせ管理</h1>
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">お問い合わせ管理</h1>
      
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new">
            新規 ({newContacts.length})
          </TabsTrigger>
          <TabsTrigger value="read">
            既読 ({readContacts.length})
          </TabsTrigger>
          <TabsTrigger value="replied">
            返信済み ({repliedContacts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="space-y-4">
          {newContacts.length === 0 ? (
            <p className="text-center text-gray-500">新しいお問い合わせはありません</p>
          ) : (
            newContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onStatusUpdate={updateContactStatus}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="read" className="space-y-4">
          {readContacts.length === 0 ? (
            <p className="text-center text-gray-500">既読のお問い合わせはありません</p>
          ) : (
            readContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onStatusUpdate={updateContactStatus}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="replied" className="space-y-4">
          {repliedContacts.length === 0 ? (
            <p className="text-center text-gray-500">返信済みのお問い合わせはありません</p>
          ) : (
            repliedContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                onStatusUpdate={updateContactStatus}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContactCard({ 
  contact, 
  onStatusUpdate 
}: { 
  contact: Contact; 
  onStatusUpdate: (id: string, status: 'read' | 'replied') => void;
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="destructive">新規</Badge>;
      case 'read':
        return <Badge variant="secondary">既読</Badge>;
      case 'replied':
        return <Badge variant="default">返信済み</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '日時不明';
      }
      return date.toLocaleString('ja-JP');
    } catch (error) {
      return '日時不明';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{contact.subject}</CardTitle>
            <CardDescription>
              {contact.name} ({contact.email}) - {formatDate(contact.createdAt)}
            </CardDescription>
          </div>
          {getStatusBadge(contact.status)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.message}</p>
        <div className="flex gap-2 mt-4">
          {contact.status === 'new' && (
            <Button
              size="sm"
              onClick={() => onStatusUpdate(contact.id, 'read')}
            >
              既読にする
            </Button>
          )}
          {contact.status !== 'replied' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusUpdate(contact.id, 'replied')}
            >
              返信済みにする
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
