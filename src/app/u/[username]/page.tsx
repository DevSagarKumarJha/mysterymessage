"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useCompletion } from 'ai/react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { messageSchema } from '@/schemas/messageSchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod';

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split("||");
};

// Initial message string according to the prompt 
const initialMsgString = "How are you?||What is you next project-idea?||Are you interested in start-ups?"

const page = () => {
  const params = useParams<{ username: string }>();
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const { complete, completion, isLoading: isSuggestLoading, error } = useCompletion({
    api: '/api/suggest-messages',
    initialCompletion: initialMsgString
  });

  console.log();
  const [isLoading, setIsLoading] = useState(false);
  const messageContent = form.watch('content');

  

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    try {
      setIsLoading(true)
      const response = await axios.post(`/api/send-message`, {
        username: params.username,
        content: data.content
      })
      toast({
        title: response.data.message,
        variant: "default"
      })
    } catch (error) {
      console.error("Error in code verification ", error);
      const axiosError = error as AxiosError<ApiResponse>;

      let errMsg = axiosError.response?.data.message

      toast({
        title: "Message sending failed",
        description: errMsg,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const suggestMessage = async () => {
    try {
      complete('')
    } catch (error) {
      console.log(error)
    }
  }

  const { toast } = useToast();
  return (
    <div className='container mx-auto my-8 p-6 bg-white rounded max-w-4xl'>
      <h1 className='text-center text-4xl mb-6 font-bold'>Public Profile Link</h1>
      <Form {...form}>
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className='mb-6'>Send Anonymous Message to @{params.username}</FormLabel>
                <FormControl>
                  <Textarea placeholder='Write your anonymous message here' className='resize-none'{...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            <Button type="submit" disabled={isLoading || !messageContent}>Send It</Button>
          </div>
        </form>
      </Form>


      <div className='space-y-4 my-8'>
        <div className="space-y-2">
          <Button
            onClick={suggestMessage}
            className='my-4'
            disabled={isSuggestLoading}
          >
            Suggest Messages
          </Button>
          <p>Click on any message below to select it.</p>
        </div>
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Messages</h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {error ? (
              <p className="text-red-500">{error.message}</p>
            ) : (
              parseStringMessages(completion).map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="mb-2"
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6" />
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={'/sign-up'}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </div>
  )
}

export default page