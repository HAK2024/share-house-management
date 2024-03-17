'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { INVITED_HOUSE_ID } from '@/_consts'
import { useAuthStore } from '@/_stores'
import { RegisterForm } from '../components'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accessToken = useAuthStore((state) => state.accessToken)
  const invitedHouseId = searchParams.get(INVITED_HOUSE_ID)

  useEffect(() => {
    // Redirect to home if the user has token when accessing auth pages.
    if (accessToken) {
      router.push(
        `/${invitedHouseId ? `?${INVITED_HOUSE_ID}=${invitedHouseId}` : ''}`,
      )
    }
  }, [accessToken, router, invitedHouseId])

  return (
    <div className='flex min-h-svh flex-col items-center bg-amber-50 px-4 py-10 md:bg-gradient-to-tr md:from-amber-100 md:to-amber-500 lg:justify-center lg:py-10'>
      <RegisterForm />
    </div>
  )
}
