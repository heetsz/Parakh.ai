import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, XCircle } from 'lucide-react'

const NotificationContext = createContext({
  notify: (_opts) => {},
  success: (_msg, _title) => {},
  error: (_msg, _title) => {},
})

export const NotificationProvider = ({ children }) => {
  const [items, setItems] = useState([])

  const remove = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const notify = useCallback((opts) => {
    const id = Math.random().toString(36).slice(2)
    const { type = 'info', message = '', title = '' } = opts || {}
    setItems((prev) => [...prev, { id, type, message, title }])
    setTimeout(() => remove(id), 2000) // auto-dismiss in 2s
  }, [remove])

  const success = useCallback((message, title = 'Success') => notify({ type: 'success', message, title }), [notify])
  const error = useCallback((message, title = 'Error') => notify({ type: 'error', message, title }), [notify])

  const value = useMemo(() => ({ notify, success, error }), [notify, success, error])

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
        {items.map((n) => (
          <Card key={n.id} className={
            n.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm' :
            n.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-900 shadow-sm' :
            'border-slate-200 bg-white text-slate-900 shadow-sm'
          }>
            <CardContent className="pointer-events-auto p-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {n.type === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  ) : n.type === 'error' ? (
                    <XCircle className="h-5 w-5 text-rose-600" />
                  ) : (
                    <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  {n.title ? <div className="text-sm font-medium leading-5">{n.title}</div> : null}
                  {n.message ? <div className="mt-0.5 text-xs leading-5 opacity-90">{n.message}</div> : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </NotificationContext.Provider>
  )
}

export const useNotification = () => useContext(NotificationContext)
