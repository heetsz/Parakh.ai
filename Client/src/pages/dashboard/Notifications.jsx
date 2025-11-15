import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Bell, Check, Trash2 } from 'lucide-react'
import { useNotification } from '@/components/ui/notification'
import { Link } from 'react-router-dom'

export default function Notifications() {
  const { inbox, unread, markAllRead, clearInbox, markRead } = useNotification()

  const sorted = useMemo(() => [...inbox].sort((a,b) => b.createdAt - a.createdAt), [inbox])

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          Notifications
          {unread > 0 && <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-red-500" />}
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={markAllRead} disabled={unread === 0} className="flex-1 sm:flex-none text-xs sm:text-sm">
            <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Mark all read
          </Button>
          <Button variant="destructive" onClick={clearInbox} className="flex-1 sm:flex-none text-xs sm:text-sm">
            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" /> Clear all
          </Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <Card className="border-0 shadow-none">
          <CardContent className="py-8 sm:py-12 text-center text-sm sm:text-base text-muted-foreground">
            No notifications yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {sorted.map(n => (
            <Card key={n.id} className={`border ${n.read ? 'opacity-80' : ''}`}>
              <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  {!n.read && <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />}
                  {n.title || 'Notification'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 text-muted-foreground">{n.message}</div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {n.action?.href && (
                      <Button asChild size="sm" variant="outline">
                        <Link to={n.action.href}>{n.action.label || 'Open'}</Link>
                      </Button>
                    )}
                    {!n.read && (
                      <Button size="sm" variant="secondary" onClick={() => markRead(n.id)}>
                        <Check className="h-4 w-4 mr-1" /> Read
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
