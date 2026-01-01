'use client'

import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, EyeOff } from "lucide-react"
import { deleteProduct, toggleProductStatus } from "@/actions/admin"
import { toast } from "sonner"

interface Product {
    id: string
    name: string
    price: string
    category: string | null
    stockCount: number
    isActive: boolean
}

export function AdminProductsContent({ products }: { products: Product[] }) {
    const { t } = useI18n()

    const handleDelete = async (id: string) => {
        if (!confirm(t('admin.products.confirmDelete'))) return
        try {
            await deleteProduct(id)
            toast.success(t('common.success'))
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            await toggleProductStatus(id, !currentStatus)
            toast.success(t('common.success'))
        } catch (e: any) {
            toast.error(e.message)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{t('admin.products.title')}</h1>
                <Link href="/admin/product/new">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('admin.products.addNew')}
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('admin.products.name')}</TableHead>
                            <TableHead>{t('admin.products.price')}</TableHead>
                            <TableHead>{t('admin.products.category')}</TableHead>
                            <TableHead>{t('admin.products.stock')}</TableHead>
                            <TableHead>{t('admin.products.status')}</TableHead>
                            <TableHead className="text-right">{t('admin.products.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map(product => (
                            <TableRow key={product.id} className={!product.isActive ? 'opacity-50' : ''}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{Number(product.price)}</TableCell>
                                <TableCell className="capitalize">{product.category || 'general'}</TableCell>
                                <TableCell>{product.stockCount}</TableCell>
                                <TableCell>
                                    <Badge variant={product.isActive ? 'default' : 'secondary'}>
                                        {product.isActive ? t('admin.products.active') : t('admin.products.inactive')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleToggle(product.id, product.isActive)}
                                        title={product.isActive ? t('admin.products.hide') : t('admin.products.show')}
                                    >
                                        {product.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                    <Link href={`/admin/cards/${product.id}`}>
                                        <Button variant="outline" size="sm">{t('admin.products.manageCards')}</Button>
                                    </Link>
                                    <Link href={`/admin/product/edit/${product.id}`}>
                                        <Button variant="outline" size="sm">{t('common.edit')}</Button>
                                    </Link>
                                    <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                                        {t('common.delete')}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

