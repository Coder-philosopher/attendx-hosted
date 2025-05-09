import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { createEvent } from '../lib/events';
import { InsertEvent } from '@shared/schema';
import { useSolana } from '../providers/SolanaProvider';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Rocket, Sparkle, Calendar, Image as ImageIcon, Users } from 'lucide-react';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Event name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  date: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: "Please enter a valid date.",
  }),
  imageUrl: z.string().optional(),
  maxAttendees: z.string().optional().transform(val => (val === "" ? undefined : parseInt(val, 10))),
});

type FormValues = z.infer<typeof formSchema>;

const CreateEvent: React.FC = () => {
  const [, navigate] = useLocation();
  const { publicKey, connected } = useSolana();
  const { toast } = useToast();

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      imageUrl: "",
      maxAttendees: "",
    },
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (!connected || !publicKey) {
        throw new Error("Please connect your wallet first.");
      }
      const eventData: Omit<InsertEvent, "tokenMintAddress" | "qrCodeData" | "creator"> = {
        name: values.name,
        description: values.description,
        date: new Date(values.date),
        imageUrl: values.imageUrl || undefined,
        maxAttendees: values.maxAttendees || undefined,
      };
      return await createEvent(eventData, publicKey.toString());
    },
    onSuccess: (data) => {
      toast({
        title: "Event created successfully!",
        description: "Your event has been created and a token has been minted.",
        variant: "default",
      });
      navigate(`/event-success/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to create event",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const onSubmit = async (values: FormValues) => {
    createEventMutation.mutate(values);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <span className="inline-flex items-center justify-center mb-4 p-3 rounded-full bg-primary/90 shadow-lg animate-fade-in">
          <Rocket className="h-8 w-8 text-white animate-bounce" />
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground animate-gradient-x bg-gradient-to-r from-primary via-[#14F195] to-primary bg-clip-text text-transparent">Create an Event</h1>
        <p className="mt-3 max-w-2xl mx-auto text-xl text-muted-foreground sm:mt-4">
          Fill out the form below to create an event and mint a compressed token (cToken) for attendees.
        </p>
      </div>
      <div className="max-w-3xl mx-auto">
        <Card className="glass-card">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Sparkle className="h-4 w-4 text-primary" /> Event Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Solana Hackathon 2023"
                            {...field}
                            disabled={createEventMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Event Date</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            disabled={createEventMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Sparkle className="h-4 w-4 text-primary" /> Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your event..."
                          {...field}
                          rows={3}
                          disabled={createEventMutation.isPending}
                        />
                      </FormControl>
                      <FormDescription>
                        Brief description of your event. This will be stored in the token metadata.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-primary" /> Image URL (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/image.jpg"
                            {...field}
                            disabled={createEventMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter a URL for the event image. This will be displayed with the token.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxAttendees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Maximum Attendees (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Leave blank for unlimited"
                            {...field}
                            disabled={createEventMutation.isPending}
                          />
                        </FormControl>
                        <FormDescription>
                          Limit the number of cTokens that can be claimed.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {(!connected || createEventMutation.isError) && (
                  <Alert variant="destructive" className="glass-card">
                    <AlertCircle className="h-5 w-5" />
                    <AlertTitle>{!connected ? 'Wallet not connected' : 'Failed to create event'}</AlertTitle>
                    <AlertDescription>
                      {!connected
                        ? 'Please connect your Solana wallet to create an event.'
                        : createEventMutation.error instanceof Error
                        ? createEventMutation.error.message
                        : 'An unexpected error occurred.'}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size="lg"
                    className="gap-2 rounded-full shadow-lg text-lg"
                    disabled={createEventMutation.isPending || !connected}
                  >
                    <Rocket className="h-5 w-5" />
                    {createEventMutation.isPending ? 'Creating Event...' : 'Create Event & Mint Token'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateEvent;
