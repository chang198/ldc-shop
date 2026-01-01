import { db } from "@/lib/db";
import { orders, cards } from "@/lib/db/schema";
import { md5 } from "@/lib/crypto";
import { eq, sql } from "drizzle-orm";

export async function POST(request: Request) {
    console.log("[Notify] Received payment callback");

    try {
        const formData = await request.formData();
        const params: Record<string, any> = {};
        formData.forEach((value, key) => {
            params[key] = value;
        });

        console.log("[Notify] Params received:", JSON.stringify(params));

        // Verify Sign
        const sign = params.sign;
        const sorted = Object.keys(params)
            .filter(k => k !== 'sign' && k !== 'sign_type' && params[k] !== '' && params[k] !== null && params[k] !== undefined)
            .sort()
            .map(k => `${k}=${params[k]}`)
            .join('&');

        const mySign = md5(`${sorted}${process.env.MERCHANT_KEY}`);

        console.log("[Notify] Signature check - received:", sign, "computed:", mySign);

        if (sign !== mySign) {
            console.log("[Notify] Signature mismatch!");
            return new Response('fail', { status: 400 });
        }

        console.log("[Notify] Signature verified OK. trade_status:", params.trade_status);

        if (params.trade_status === 'TRADE_SUCCESS') {
            const orderId = params.out_trade_no;
            const tradeNo = params.trade_no;

            console.log("[Notify] Processing order:", orderId);

            // Find Order
            const order = await db.query.orders.findFirst({
                where: eq(orders.orderId, orderId)
            });

            console.log("[Notify] Order found:", order ? "YES" : "NO", "status:", order?.status);

            if (order && order.status === 'pending') {
                // Find Unused Card
                const card = await db.query.cards.findFirst({
                    where: sql`${cards.productId} = ${order.productId} AND ${cards.isUsed} = false`
                });

                console.log("[Notify] Available card:", card ? "YES" : "NO");

                if (card) {
                    await db.transaction(async (tx) => {
                        await tx.update(cards)
                            .set({ isUsed: true, usedAt: new Date() })
                            .where(eq(cards.id, card.id));

                        await tx.update(orders)
                            .set({
                                status: 'delivered',
                                paidAt: new Date(),
                                deliveredAt: new Date(),
                                tradeNo: tradeNo,
                                cardKey: card.cardKey
                            })
                            .where(eq(orders.orderId, orderId));
                    });
                    console.log("[Notify] Order delivered successfully!");
                } else {
                    // Paid but no stock
                    await db.update(orders)
                        .set({ status: 'paid', paidAt: new Date(), tradeNo: tradeNo })
                        .where(eq(orders.orderId, orderId));
                    console.log("[Notify] Order marked as paid (no stock)");
                }
            }
        }

        return new Response('success');
    } catch (e) {
        console.error("[Notify] Error:", e);
        return new Response('error', { status: 500 });
    }
}

// Also handle GET requests for debugging
export async function GET(request: Request) {
    return new Response('Notify endpoint is working. Use POST for callbacks.', { status: 200 });
}
