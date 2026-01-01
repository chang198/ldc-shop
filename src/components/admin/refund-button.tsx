'use client'

import { Button } from "@/components/ui/button"
import { getRefundParams, markOrderRefunded } from "@/actions/refund"
import { useState } from "react"
import { toast } from "sonner"
import { Loader2, ExternalLink, CheckCircle } from "lucide-react"

export function RefundButton({ order }: { order: any }) {
    const [loading, setLoading] = useState(false)
    const [showMarkDone, setShowMarkDone] = useState(false)

    if (order.status !== 'delivered' && order.status !== 'paid') return null
    if (!order.tradeNo) return null

    const handleRefund = async () => {
        if (!confirm(`This will open the refund page in a new tab. After completing the refund, return here and click "Mark as Refunded". Continue?`)) return

        setLoading(true)
        try {
            const params = await getRefundParams(order.orderId)

            // Create and submit form in new tab
            const form = document.createElement('form')
            form.method = 'POST'
            form.action = 'https://credit.linux.do/epay/api.php'
            form.target = '_blank'

            Object.entries(params).forEach(([k, v]) => {
                const input = document.createElement('input')
                input.type = 'hidden'
                input.name = k
                input.value = String(v)
                form.appendChild(input)
            })

            document.body.appendChild(form)
            form.submit()
            document.body.removeChild(form)

            // Show the "Mark as Refunded" button
            setShowMarkDone(true)
            toast.info("Complete the refund in the new tab, then click 'Mark as Refunded'")
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkDone = async () => {
        setLoading(true)
        try {
            await markOrderRefunded(order.orderId)
            toast.success("Order marked as refunded")
            setShowMarkDone(false)
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefund} disabled={loading || showMarkDone}>
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <><ExternalLink className="h-3 w-3 mr-1" />Refund</>}
            </Button>
            {showMarkDone && (
                <Button variant="default" size="sm" onClick={handleMarkDone} disabled={loading}>
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <><CheckCircle className="h-3 w-3 mr-1" />Mark as Refunded</>}
                </Button>
            )}
        </div>
    )
}
