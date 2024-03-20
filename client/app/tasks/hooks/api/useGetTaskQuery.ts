import { useQuery } from '@tanstack/react-query'
import { TaskType } from '@/_types'
import { getTaskApi } from '@/tasks/api/getTaskApi'

export const useGetTaskQuery = (taskId: number) => {
  const { data, isLoading, isError } = useQuery<TaskType>({
    queryKey: ['tasks', taskId],
    queryFn: () => getTaskApi(taskId),
    enabled: !!taskId,
  })

  return { data, isLoading, isError }
}
