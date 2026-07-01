import { useState } from "react";
import type { FormEvent } from "react";
import {
  useGetContacts,
  getGetContactsQueryKey,
  useCreateContact,
  useDeleteContact,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", relationship: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: contacts, isLoading } = useGetContacts();

  const createContact = useCreateContact({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetContactsQueryKey() });
        setShowForm(false);
        setForm({ name: "", phone: "", email: "", relationship: "" });
        toast({ title: "Contact added" });
      },
      onError: () => toast({ title: "Failed to add contact", variant: "destructive" }),
    },
  });

  const deleteContact = useDeleteContact({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetContactsQueryKey() });
        toast({ title: "Contact removed" });
      },
    },
  });

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.relationship.trim()) e.relationship = "Relationship is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    createContact.mutate({ data: form });
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Emergency Contacts</h1>
          <p className="text-muted-foreground text-sm mt-1">People to notify when an alert is triggered</p>
        </div>
        <button
          data-testid="button-add-contact"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-card border border-card-border rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-sm">New Contact</h2>
            <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Name *</label>
              <input
                data-testid="input-contact-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Jane Doe"
              />
              {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Phone *</label>
              <input
                data-testid="input-contact-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="+1 555 000 0000"
              />
              {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Email</label>
              <input
                data-testid="input-contact-email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="jane@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Relationship *</label>
              <input
                data-testid="input-contact-relationship"
                value={form.relationship}
                onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Spouse, Parent, Friend..."
              />
              {errors.relationship && <p className="text-xs text-destructive mt-1">{errors.relationship}</p>}
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                data-testid="button-submit-contact"
                type="submit"
                disabled={createContact.isPending}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {createContact.isPending ? "Saving..." : "Save Contact"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contacts list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-card border border-card-border rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      ) : !contacts?.length ? (
        <div className="bg-card border border-card-border rounded-xl py-16 text-center">
          <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium text-sm">No emergency contacts</p>
          <p className="text-xs text-muted-foreground mt-1">Add contacts to notify during an emergency</p>
        </div>
      ) : (
        <div className="bg-card border border-card-border rounded-xl divide-y divide-border">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              data-testid={`card-contact-${contact.id}`}
              className="px-5 py-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold text-sm">{contact.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{contact.name}</p>
                <p className="text-xs text-muted-foreground">{contact.phone}</p>
                {contact.email && <p className="text-xs text-muted-foreground">{contact.email}</p>}
                <p className="text-xs text-muted-foreground capitalize">{contact.relationship}</p>
              </div>
              <button
                data-testid={`button-delete-contact-${contact.id}`}
                onClick={() => deleteContact.mutate({ contactId: contact.id })}
                disabled={deleteContact.isPending}
                className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
