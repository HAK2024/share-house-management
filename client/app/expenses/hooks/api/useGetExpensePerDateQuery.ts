import { useQuery } from '@tanstack/react-query'
import { getExpensePerDateApi } from './../../api'

export const useGetExpensePerDateQuery = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => getExpensePerDateApi(),
    throwOnError: true,
  })

  return { data, isLoading }
}
