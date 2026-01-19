'use client'

import Link from "next/link"
import { useI18n } from "@/lib/i18n/context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Coins, Package, Clock, CheckCircle, ChevronRight, User, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateProfileEmail } from "@/actions/profile"
import { useState } from "react"
import { CheckInButton } from "@/components/checkin-button"

interface ProfileContentProps {
    user: {
        id: string
        name: string
        username: string | null
        avatar: string | null
        email: string | null
    }
    points: number
    checkinEnabled: boolean
    orderStats: {
        total: number
        pending: number
        delivered: number
    }
    recentOrders: Array<{
        orderId: string
        productName: string
        amount: string
        status: string | null
        createdAt: Date | null
    }>
}

export function ProfileContent({ user, points, checkinEnabled, orderStats, recentOrders }: ProfileContentProps) {
    const { t } = useI18n()
    const [email, setEmail] = useState(user.email || '')
    const [savingEmail, setSavingEmail] = useState(false)
    const [pointsValue, setPointsValue] = useState(points)

    const getStatusBadge = (status: string | null) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600">{t('order.status.pending')}</Badge>
            case 'paid':
                return <Badge variant="outline" className="text-blue-600 border-blue-600">{t('order.status.paid')}</Badge>
            case 'delivered':
                return <Badge variant="outline" className="text-green-600 border-green-600">{t('order.status.delivered')}</Badge>
            case 'refunded':
                return <Badge variant="outline" className="text-gray-600 border-gray-600">{t('order.status.refunded')}</Badge>
            case 'cancelled':
                return <Badge variant="outline" className="text-red-600 border-red-600">{t('order.status.cancelled')}</Badge>
            default:
                return <Badge variant="outline">{status || '-'}</Badge>
        }
    }

    return (
        <main className="container py-8 max-w-2xl">
            {/* User Info */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user.avatar || ''} alt={user.name} />
                            <AvatarFallback><User className="h-8 w-8" /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h1 className="text-xl font-bold">{user.name}</h1>
                            {user.username && (
                                <p className="text-sm text-muted-foreground">@{user.username}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">ID: {user.id}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Email */}
            <Card className="mb-6">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">{t('profile.emailTitle')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Label htmlFor="profile-email">{t('profile.emailLabel')}</Label>
                        <Input
                            id="profile-email"
                            type="email"
                            placeholder={t('profile.emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={savingEmail}
                        />
                        <p className="text-xs text-muted-foreground">{t('profile.emailHint')}</p>
                        <Button
                            variant="outline"
                            className="mt-2"
                            disabled={savingEmail}
                            onClick={async () => {
                                setSavingEmail(true)
                                try {
                                    const result = await updateProfileEmail(email)
                                    if (result?.success) {
                                        toast.success(t('profile.emailSaved'))
                                    } else {
                                        toast.error(result?.error ? t(result.error) : t('common.error'))
                                    }
                                } catch {
                                    toast.error(t('common.error'))
                                } finally {
                                    setSavingEmail(false)
                                }
                            }}
                        >
                            {t('profile.emailSave')}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Points Card */}
            <Card className="mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                                <Coins className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{t('common.credits')}</p>
                                <p className="text-2xl font-bold text-amber-600">{pointsValue}</p>
                            </div>
                        </div>
                        <CheckInButton
                            enabled={checkinEnabled}
                            showPoints={false}
                            showCheckedInLabel
                            className="shrink-0"
                            onPointsChange={setPointsValue}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Order Stats */}
            <Card className="mb-6">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                        <span>{t('common.myOrders')}</span>
                        <Link href="/orders">
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
                                {t('common.viewOrders')} <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 rounded-lg bg-muted/50">
                            <Package className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                            <p className="text-2xl font-bold">{orderStats.total}</p>
                            <p className="text-xs text-muted-foreground">{t('admin.stats.total')}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                            <Clock className="h-5 w-5 mx-auto mb-1 text-yellow-600" />
                            <p className="text-2xl font-bold">{orderStats.pending}</p>
                            <p className="text-xs text-muted-foreground">{t('order.status.pending')}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50">
                            <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-600" />
                            <p className="text-2xl font-bold">{orderStats.delivered}</p>
                            <p className="text-xs text-muted-foreground">{t('order.status.delivered')}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Orders */}
            {recentOrders.length > 0 && (
                <Card className="mb-6">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">{t('admin.stats.recentOrders')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentOrders.map((order) => (
                                <Link
                                    key={order.orderId}
                                    href={`/order/${order.orderId}`}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{order.productName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{order.amount}</span>
                                        {getStatusBadge(order.status)}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Logout Button */}
            <Button
                variant="outline"
                className="w-full"
                onClick={() => signOut({ callbackUrl: "/" })}
            >
                <LogOut className="h-4 w-4 mr-2" />
                {t('common.logout')}
            </Button>
        </main>
    )
}
