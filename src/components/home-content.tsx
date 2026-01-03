'use client'

import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Product {
    id: string
    name: string
    description: string | null
    price: string
    image: string | null
    category: string | null
    stockCount: number
    soldCount: number
}

export function HomeContent({ products }: { products: Product[] }) {
    const { t } = useI18n()

    return (
        <main className="container py-8 md:py-16">
            {/* Hero Section */}
            <section className="mb-16 space-y-4 text-center relative">
                <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent rounded-3xl" />
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl gradient-text py-2">
                    {t('common.appName')}
                </h1>
                <p className="mx-auto max-w-[600px] text-muted-foreground text-sm md:text-base">
                    {t('home.subtitle')}
                </p>
                <div className="flex justify-center gap-2 pt-2">
                    <div className="h-1 w-12 rounded-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                </div>
            </section>

            {products.length === 0 ? (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-muted/50 mb-4">
                        <svg className="w-8 h-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                    </div>
                    <p className="text-muted-foreground font-medium">{t('home.noProducts')}</p>
                    <p className="text-sm text-muted-foreground/60 mt-2">{t('home.checkBackLater')}</p>
                </div>
            ) : (
                <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product, index) => (
                        <Card
                            key={product.id}
                            className="group overflow-hidden flex flex-col tech-card animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            {/* Image Section */}
                            <div className="aspect-[4/3] bg-gradient-to-br from-muted/30 to-muted/10 relative overflow-hidden">
                                <img
                                    src={product.image || `https://api.dicebear.com/7.x/shapes/svg?seed=${product.id}`}
                                    alt={product.name}
                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                />
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                {product.category && product.category !== 'general' && (
                                    <Badge className="absolute top-3 right-3 capitalize bg-background/80 backdrop-blur-sm border-border/50 text-foreground">
                                        {product.category}
                                    </Badge>
                                )}
                            </div>

                            {/* Content Section */}
                            <CardContent className="flex-1 p-5">
                                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors duration-300">
                                    {product.name}
                                </h3>
                                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                                    {product.description || t('buy.noDescription')}
                                </p>
                            </CardContent>

                            {/* Footer Section */}
                            <CardFooter className="p-5 pt-0 flex items-end justify-between gap-4">
                                <div>
                                    <span className="text-3xl font-bold gradient-text">{Number(product.price)}</span>
                                    <span className="text-muted-foreground text-sm ml-1.5">{t('common.credits')}</span>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="flex gap-1.5">
                                        <Badge variant="outline" className="text-xs text-muted-foreground border-border/50">
                                            {t('common.sold')}: {product.soldCount}
                                        </Badge>
                                        <Badge
                                            variant={product.stockCount > 0 ? "secondary" : "destructive"}
                                            className={product.stockCount > 0 ? "text-xs" : "text-xs"}
                                        >
                                            {product.stockCount > 0 ? `${t('common.stock')}: ${product.stockCount}` : t('common.outOfStock')}
                                        </Badge>
                                    </div>
                                    <Link href={`/buy/${product.id}`}>
                                        <Button
                                            size="sm"
                                            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                                        >
                                            {t('common.viewDetails')}
                                        </Button>
                                    </Link>
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </section>
            )}
        </main>
    )
}
