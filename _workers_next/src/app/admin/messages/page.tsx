import { db } from "@/lib/db"
import { adminMessages } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { AdminMessagesContent } from "@/components/admin/messages-content"

export const dynamic = 'force-dynamic'

function isMissingTable(error: any) {
  const errorString = JSON.stringify(error)
  return (
    error?.message?.includes('does not exist') ||
    error?.cause?.message?.includes('does not exist') ||
    errorString.includes('42P01') ||
    (errorString.includes('relation') && errorString.includes('does not exist'))
  )
}

export default async function AdminMessagesPage() {
  let rows: any[] = []
  try {
    rows = await db
      .select({
        id: adminMessages.id,
        targetType: adminMessages.targetType,
        targetValue: adminMessages.targetValue,
        title: adminMessages.title,
        body: adminMessages.body,
        sender: adminMessages.sender,
        createdAt: adminMessages.createdAt
      })
      .from(adminMessages)
      .orderBy(desc(adminMessages.createdAt))
      .limit(200)
  } catch (e: any) {
    if (!isMissingTable(e)) throw e
    rows = []
  }

  return <AdminMessagesContent history={rows} />
}
