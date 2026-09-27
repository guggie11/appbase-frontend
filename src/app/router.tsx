import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: async () => {
      const { HomePage } = await import('../pages/home')
      return { Component: HomePage }
    },
  },
  {
    path: '*',
    lazy: async () => {
      const { NotFoundPage } = await import('../pages/not-found')
      return { Component: NotFoundPage }
    },
  },
])
