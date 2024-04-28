"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { signInSchema } from "@/schemas/signInSchema"
import { signIn } from "next-auth/react"



function page() {


  const { toast } = useToast()
  const router = useRouter()

  // zod implementation
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier:"",
      password: ''
    }

  })

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn('credentials',{
      redirect: false,
      identifier: data.identifier,
      password: data.password
    })

    if(result?.error){
      if(result?.error == 'CredentialsSignin'){
        toast({
          title: 'Login Failed',
          description: "Incorrect username or password",
          variant: "destructive"
        })
      }else{
        toast({
          title: 'Login Failed',
          description: result.error,
          variant: "destructive"
        })
      }
      
    }
    
    if(result?.url){
      router.replace('/dashboard')
    }
    
  }


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-3 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tighter lg:text-5xl mb-6">
            Join Mystery Message
          </h1>

          <p className="mb4">Sign in to start your anonomous adventure</p>
        </div>

        <Form {...form}>
          <form className='space-y-8' onSubmit={form.handleSubmit(onSubmit)} space-y-6>

            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email / Username</FormLabel>
                  <FormControl>
                    <Input placeholder="email address/username"
                      {...field}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit">Sign in</Button>
          </form>
        </Form>

        <div className="text-center mt-4">
          <p>
            Already a member? {' '}
            <Link href={"/sign-in"} className="text-blue-600 hover:text-blue-800">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default page