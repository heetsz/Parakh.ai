import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Bell, Check, Trash2 } from 'lucide-react'
import { useNotification } from '@/components/ui/notification'

export default function Notifications() {
  const { inbox, unread, markAllRead, clearInbox, markRead } = useNotification()

  const sorted = useMemo(() => [...inbox].sort((a,b) => b.createdAt - a.createdAt), [inbox])

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          Notifications
          {unread > 0 && <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-red-500" />}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={markAllRead} disabled={unread === 0}>
            <Check className="h-4 w-4 mr-2" /> Mark all read
          </Button>
          <Button variant="destructive" onClick={clearInbox}>
            <Trash2 className="h-4 w-4 mr-2" /> Clear all
          </Button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <Card className="border-0 shadow-none">
          <CardContent className="py-12 text-center text-muted-foreground">
            No notifications yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map(n => (
            <Card key={n.id} className={`border ${n.read ? 'opacity-80' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  {!n.read && <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />}
                  {n.title || 'Notification'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 text-muted-foreground">{n.message}</div>
                  {!n.read && (
                    <Button size="sm" variant="secondary" onClick={() => markRead(n.id)}>
                      <Check className="h-4 w-4 mr-1" /> Read
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
