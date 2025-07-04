
"use client";

import { useState } from 'react';
import type { Customer, CustomerStatus } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Mail, Phone, Tag, Edit2, Save, MessageSquare, CalendarDays, Edit3, Clock } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { formatDistanceToNow, parseISO, format } from 'date-fns';
import { CustomerEditForm } from '@/components/shared/CustomerEditForm';

const statusColors: Record<CustomerStatus, string> = {
  hot: "bg-green-100 text-green-800 border-green-300 dark:bg-green-800/30 dark:text-green-300 dark:border-green-700",
  cold: "bg-red-100 text-red-800 border-red-300 dark:bg-red-800/30 dark:text-red-300 dark:border-red-700",
  neutral: "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-800/30 dark:text-yellow-300 dark:border-yellow-700",
};

interface CustomerCardProps {
  customer: Customer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  const { updateCustomerStatus } = useData();
  const [newStatus, setNewStatus] = useState<CustomerStatus>(customer.status);
  const [newNote, setNewNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleStatusChange = (status: CustomerStatus) => {
    setNewStatus(status);
    if (!isEditingNote || !newNote.trim()) {
      updateCustomerStatus(customer.id, status, newNote.trim() || undefined);
      setNewNote(''); 
    }
  };

  const handleSaveNoteAndStatus = () => {
    if (newNote.trim() || newStatus !== customer.status) {
      updateCustomerStatus(customer.id, newStatus, newNote.trim() || undefined);
      setNewNote('');
    }
    setIsEditingNote(false);
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }
  
  const lastContactedDate = customer.lastContacted ? parseISO(customer.lastContacted) : null;
  const createdAtDate = customer.createdAt ? parseISO(customer.createdAt) : null;

  const formatDate = (date: Date | null, includeTime = false) => {
    if (!date) return 'N/A';
    return includeTime ? format(date, 'MMM d, yyyy h:mm a') : format(date, 'MMM d, yyyy');
  };

  const formatRelativeDate = (date: Date | null) => {
     if (!date) return 'N/A';
     return formatDistanceToNow(date, { addSuffix: true });
  }

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-3">
        <Avatar className="h-12 w-12 border-2 border-primary/50">
          <AvatarImage src={`https://placehold.co/80x80/E5EAF7/2962FF?text=${getInitials(customer.name)}`} alt={customer.name} data-ai-hint="customer avatar" />
          <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="font-headline text-xl text-primary">{customer.name}</CardTitle>
          <CardDescription className="flex items-center text-sm text-muted-foreground">
            <Badge variant="outline" className={`capitalize ${statusColors[customer.status]} mr-2`}>{customer.status}</Badge>
            {customer.category && <><Tag className="h-3 w-3 mr-1" /> {customer.category}</>}
          </CardDescription>
        </div>
        <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => setIsEditModalOpen(isOpen)}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit customer details">
                    <Edit3 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px] p-0">
                {isEditModalOpen && (
                     <CustomerEditForm 
                        customer={customer} 
                        onFormSubmit={() => setIsEditModalOpen(false)} 
                    />
                )}
            </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3 text-sm flex-grow">
        <div className="flex items-center text-foreground">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          <a href={`mailto:${customer.email}`} className="hover:underline truncate" title={customer.email}>{customer.email}</a>
        </div>
        <div className="flex items-center text-foreground">
          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
          <span>{customer.phoneNumber}</span>
        </div>
         <div className="flex items-center text-xs text-muted-foreground">
            <CalendarDays className="h-3 w-3 mr-1.5" />
            Added: {formatDate(createdAtDate)}
        </div>
        {lastContactedDate && (
             <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="h-3 w-3 mr-1.5" />
                Last activity: {formatRelativeDate(lastContactedDate)}
            </div>
        )}
        {customer.notes && !isEditingNote && (
          <div className="mt-2 p-3 bg-muted/50 rounded-md">
            <h4 className="text-xs font-semibold text-muted-foreground mb-1 flex items-center">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> Latest Note:
            </h4>
            <p className="text-xs text-foreground whitespace-pre-wrap max-h-20 overflow-y-auto">{customer.notes.split('\n').pop()}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 pt-4 border-t mt-auto">
        <div className="flex-1 w-full sm:w-auto">
          <Select value={newStatus} onValueChange={(value) => handleStatusChange(value as CustomerStatus)}>
            <SelectTrigger className="w-full" aria-label="Change customer status">
              <SelectValue placeholder="Change status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hot">Mark as Hot</SelectItem>
              <SelectItem value="cold">Mark as Cold</SelectItem>
              <SelectItem value="neutral">Mark as Neutral</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 w-full sm:w-auto">
            {isEditingNote ? (
                <div className="space-y-2 w-full">
                    <Textarea 
                        placeholder="Add a new note..." 
                        value={newNote} 
                        onChange={(e) => setNewNote(e.target.value)}
                        className="text-sm"
                        rows={2}
                    />
                    <div className="flex gap-2">
                        <Button onClick={handleSaveNoteAndStatus} size="sm" className="w-full">
                            <Save className="h-4 w-4 mr-2"/> Save Note & Status
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => { setIsEditingNote(false); setNewNote(''); setNewStatus(customer.status);}} className="w-full">
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : (
                 <Button variant="outline" onClick={() => setIsEditingNote(true)} className="w-full">
                    <Edit2 className="h-4 w-4 mr-2" /> Add/Edit Note
                </Button>
            )}
        </div>
      </CardFooter>
    </Card>
  );
}
