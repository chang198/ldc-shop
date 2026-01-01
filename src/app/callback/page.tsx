import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function CallbackPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams

    // Try to get order ID from query params first
    let orderId = params.out_trade_no;

    // If not in params, try to get from cookie (set during checkout)
    if (!orderId) {
        const cookieStore = await cookies();
        orderId = cookieStore.get('ldc_pending_order')?.value;
        // Note: Cannot delete cookie in Server Component, it will expire naturally or be overwritten on next order
    }

    if (orderId && typeof orderId === 'string') {
        redirect(`/order/${orderId}`);
    }

    // Fallback to home if no order ID found
    redirect('/');
}
