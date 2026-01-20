"use server"

import { db } from "@/lib/db"
import { adminMessages, loginUsers, userNotifications } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"
import { checkAdmin } from "@/actions/admin"
import { revalidatePath } from "next/cache"

type TargetType = "all" | "username" | "userId"

async function ensureAdminMessagesTable() {
    await db.run(sql`
        CREATE TABLE IF NOT EXISTS admin_messages(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            target_type TEXT NOT NULL,
            target_value TEXT,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            sender TEXT,
            created_at INTEGER DEFAULT (unixepoch() * 1000)
        )
    `)
}

async function ensureUserNotificationsTable() {
    await db.run(sql`
        CREATE TABLE IF NOT EXISTS user_notifications(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL REFERENCES login_users(user_id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            title_key TEXT NOT NULL,
            content_key TEXT NOT NULL,
            data TEXT,
            is_read INTEGER DEFAULT 0,
            created_at INTEGER DEFAULT (unixepoch() * 1000)
        )
    `)
}

export async function sendAdminMessage(params: {
    targetType: TargetType
    targetValue?: string
    title: string
    body: string
}) {
    await checkAdmin()

    const title = (params.title || '').trim()
    const body = (params.body || '').trim()
    if (!title || !body) {
        return { success: false, error: "admin.messages.missing" }
    }

    const targetType = params.targetType
    const targetValue = (params.targetValue || '').trim()
    if (!["all", "username", "userId"].includes(targetType)) {
        return { success: false, error: "admin.messages.invalidTarget" }
    }
    if (targetType !== "all" && !targetValue) {
        return { success: false, error: "admin.messages.invalidTarget" }
    }

    await ensureAdminMessagesTable()
    await ensureUserNotificationsTable()

    let userIds: string[] = []
    if (targetType === "all") {
        const rows = await db.select({ id: loginUsers.userId }).from(loginUsers)
        userIds = rows.map((r) => r.id).filter(Boolean)
    } else if (targetType === "username") {
        const username = targetValue.toLowerCase()
        const rows = await db
            .select({ id: loginUsers.userId })
            .from(loginUsers)
            .where(sql`LOWER(${loginUsers.username}) = ${username}`)
            .limit(1)
        userIds = rows.map((r) => r.id).filter(Boolean)
    } else {
        const rows = await db
            .select({ id: loginUsers.userId })
            .from(loginUsers)
            .where(eq(loginUsers.userId, targetValue))
            .limit(1)
        userIds = rows.map((r) => r.id).filter(Boolean)
    }

    if (userIds.length === 0) {
        return { success: false, error: "admin.messages.userNotFound" }
    }

    const session = await import("@/lib/auth").then((m) => m.auth())
    const sender = session?.user?.username || session?.user?.name || null

    await db.insert(adminMessages).values({
        targetType,
        targetValue: targetType === "all" ? null : targetValue,
        title,
        body,
        sender,
        createdAt: new Date()
    })

    const payload = JSON.stringify({ title, body })
    const now = new Date()
    const chunkSize = 200
    for (let i = 0; i < userIds.length; i += chunkSize) {
        const chunk = userIds.slice(i, i + chunkSize)
        await db.insert(userNotifications).values(
            chunk.map((id) => ({
                userId: id,
                type: "admin_message",
                titleKey: "profile.notifications.adminMessageTitle",
                contentKey: "profile.notifications.adminMessageBody",
                data: payload,
                isRead: false,
                createdAt: now
            }))
        )
    }

    revalidatePath("/admin/messages")
    return { success: true, count: userIds.length }
}

export async function deleteAdminMessage(id: number) {
    await checkAdmin()
    await ensureAdminMessagesTable()
    await db.delete(adminMessages).where(eq(adminMessages.id, id))
    revalidatePath("/admin/messages")
    return { success: true }
}
