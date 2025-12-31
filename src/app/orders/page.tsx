import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Search } from "lucide-react"

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const session = await auth()
    if (!session?.user) redirect('/api/auth/signin')

    const userOrders = await db.query.orders.findMany({
        where: eq(orders.userId, session.user.id || ''),
        orderBy: [desc(orders.createdAt)]
    })

    return (
        <main className="container py-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
                <p className="text-muted-foreground">{userOrders.length} orders found</p>
            </div>

            <div className="grid gap-4">
                {userOrders.length > 0 ? (
                    userOrders.map(order => (
                        <Link href={`/order/${order.orderId}`} key={order.orderId}>
                            <Card className="hover:border-primary/50 transition-colors">
                                <div className="flex items-center p-6 gap-4">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <Package className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold truncate">{order.productName}</h3>
                                            <span className="font-bold">{Number(order.amount)} pts</span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span className="font-mono">{order.orderId}</span>
                                            <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</span>
                                        </div>
                                    </div>
                                    <Badge variant={
                                        order.status === 'delivered' ? 'default' :
                                            order.status === 'paid' ? 'secondary' : 'outline'
                                    } className="ml-2 capitalize">
                                        {order.status}
                                    </Badge>
                                </div>
                            </Card>
                        </Link>
                    ))
                ) : (
                    <div className="text-center py-20 rounded-lg border border-dashed">
                        <div className="flex justify-center mb-4">
                            <Search className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                        <h3 className="font-semibold text-lg">No orders yet</h3>
                        <p className="text-muted-foreground mb-6">Start shopping to see your orders here.</p>
                        <Link href="/" className="text-primary hover:underline">Browse Products</Link>
                    </div>
                )}
            </div>
        </main>
    )
}
