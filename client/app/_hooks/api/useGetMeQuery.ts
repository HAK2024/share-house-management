import { useQuery } from '@tanstack/react-query'
import { getMeApi } from '@/_api'
import { UserType } from '@/_types'
import { useAuthStore } from '../../_stores'

export const useGetMeQuery = () => {
  const csrfToken = useAuthStore((state) => state.csrfToken)
  const accessToken = useAuthStore((state) => state.accessToken)

  const getMe = async () => {
    const response = await getMeApi()
    return response
  }

  const { data, isLoading, isError } = useQuery<UserType>({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
    enabled: !!csrfToken && !!accessToken,
  })

  return {
    data,
    isLoading,
    isError,
  }
}
