"use client"

import { useMemo, useState } from "react"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"
import { deleteAdminMessage, sendAdminMessage } from "@/actions/admin-messages"
import { useRouter } from "next/navigation"

type TargetType = "all" | "username" | "userId"

export function AdminMessagesContent({ history }: { history: any[] }) {
    const { t } = useI18n()
    const router = useRouter()
    const [targetType, setTargetType] = useState<TargetType>("all")
    const [targetValue, setTargetValue] = useState("")
    const [title, setTitle] = useState("")
    const [body, setBody] = useState("")
    const [sending, setSending] = useState(false)
    const [deleting, setDeleting] = useState<number | null>(null)

    const targetPlaceholder = useMemo(() => {
        if (targetType === "username") return t('admin.messages.usernamePlaceholder')
        if (targetType === "userId") return t('admin.messages.userIdPlaceholder')
        return ""
    }, [targetType, t])

    const targetLabel = useMemo(() => {
        if (targetType === "username") return t('admin.messages.usernameLabel')
        if (targetType === "userId") return t('admin.messages.userIdLabel')
        return t('admin.messages.allUsers')
    }, [targetType, t])

    const formatTarget = (row: any) => {
        if (row.targetType === "all") return t('admin.messages.allUsers')
        if (row.targetType === "username") return `@${row.targetValue}`
        if (row.targetType === "userId") return `ID: ${row.targetValue}`
        return row.targetValue || '-'
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">{t('admin.messages.title')}</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('admin.messages.compose')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>{t('admin.messages.targetType')}</Label>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant={targetType === "all" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTargetType("all")}
                                >
                                    {t('admin.messages.allUsers')}
                                </Button>
                                <Button
                                    type="button"
                                    variant={targetType === "username" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTargetType("username")}
                                >
                                    {t('admin.messages.byUsername')}
                                </Button>
                                <Button
                                    type="button"
                                    variant={targetType === "userId" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTargetType("userId")}
                                >
                                    {t('admin.messages.byUserId')}
                                </Button>
                            </div>
                        </div>
                        {targetType !== "all" && (
                            <div className="space-y-2">
                                <Label>{targetLabel}</Label>
                                <Input
                                    value={targetValue}
                                    onChange={(e) => setTargetValue(e.target.value)}
                                    placeholder={targetPlaceholder}
                                />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>{t('admin.messages.titleLabel')}</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('admin.messages.titlePlaceholder')} />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('admin.messages.bodyLabel')}</Label>
                        <Textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder={t('admin.messages.bodyPlaceholder')}
                            rows={5}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button
                            disabled={sending}
                            onClick={async () => {
                                if (sending) return
                                setSending(true)
                                try {
                                    const res = await sendAdminMessage({
                                        targetType,
                                        targetValue,
                                        title,
                                        body
                                    })
                                    if (res?.success) {
                                        toast.success(t('admin.messages.sent', { count: res.count ?? 0 }))
                                        setTitle("")
                                        setBody("")
                                        if (targetType !== "all") setTargetValue("")
                                        router.refresh()
                                    } else {
                                        toast.error(res?.error ? t(res.error) : t('common.error'))
                                    }
                                } catch (e: any) {
                                    toast.error(e.message || t('common.error'))
                                } finally {
                                    setSending(false)
                                }
                            }}
                        >
                            {sending ? t('common.processing') : t('admin.messages.send')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">{t('admin.messages.history')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {history.length === 0 ? (
                        <div className="text-sm text-muted-foreground">{t('admin.messages.empty')}</div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('admin.messages.target')}</TableHead>
                                        <TableHead>{t('admin.messages.titleLabel')}</TableHead>
                                        <TableHead>{t('admin.messages.bodyLabel')}</TableHead>
                                        <TableHead>{t('admin.messages.sender')}</TableHead>
                                        <TableHead>{t('admin.messages.date')}</TableHead>
                                        <TableHead className="text-right">{t('common.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {history.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="text-xs text-muted-foreground">{formatTarget(row)}</TableCell>
                                            <TableCell className="font-medium">{row.title}</TableCell>
                                            <TableCell className="max-w-[320px]">
                                                <div className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">{row.body}</div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{row.sender || '-'}</TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {row.createdAt ? new Date(row.createdAt).toLocaleString() : '-'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={deleting === row.id}
                                                    onClick={async () => {
                                                        if (deleting === row.id) return
                                                        setDeleting(row.id)
                                                        try {
                                                            await deleteAdminMessage(row.id)
                                                            toast.success(t('common.success'))
                                                            router.refresh()
                                                        } catch (e: any) {
                                                            toast.error(e.message || t('common.error'))
                                                        } finally {
                                                            setDeleting(null)
                                                        }
                                                    }}
                                                >
                                                    {t('common.delete')}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
