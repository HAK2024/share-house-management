'use client'

import Image from 'next/image'
// import { FcGoogle } from 'react-icons/fc'
import logo from '@public/images/logo/logo.png'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  RouterLink,
  Input,
  Button,
} from '@/_components/ui'
import { useRegister } from '../hooks'

const RegisterForm = () => {
  const { form, onSubmit, isPending } = useRegister()

  return (
    <div className='flex w-full flex-col items-center bg-amber-50 md:w-[680px] md:p-10'>
      <Image src={logo} alt='Fairy Share logo' className='h-auto w-[200px]' />

      <div className='w-full md:max-w-[360px]'>
        <h1 className='mt-7 text-center text-3xl font-bold'>
          Create you account
        </h1>

        <Form {...form}>
          <form onSubmit={onSubmit} className='mx-auto mt-8 w-full'>
            <div className='space-y-5'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder='Your name' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder='example@gmail.com' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder='password' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className='mt-7 text-center'>
              <Button
                type='submit'
                className='min-w-[98px]'
                isLoading={isPending}
              >
                Continue
              </Button>
            </div>
          </form>
        </Form>

        {/* TODO Implement Google Auth when we have time */}
        {/* <div className='mt-7 flex items-center'>
          <div className='h-[1px] flex-grow bg-slate-300' />
          <span className='px-3 text-slate-600'>or</span>

          <div className='h-[1px] flex-grow bg-slate-300' />
        </div>

        <div className='mt-7 text-center'>
          <Button variant='secondaryOutline'>
            <FcGoogle className='mr-2' size={20} />
            Continue with Google
          </Button>
        </div> */}

        <div className='mt-10 flex flex-col items-center gap-2'>
          <span className='text-sm md:text-base'>Already have an account?</span>
          <RouterLink href='/login' className='text-sm'>
            Login
          </RouterLink>
        </div>
      </div>
    </div>
  )
}

export { RegisterForm }
