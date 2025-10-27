"use client"

import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Heart, MapPin, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '@radix-ui/react-select'

interface AboutContentProps {
    locale: string
}

export function AboutContent({ locale }: AboutContentProps) {
    const t = useTranslations('about')
    const isRTL = locale === 'ar'

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
            {/* Hero Section */}
            <section className="relative py-16 bg-gradient-to-r from-primary to-primary/80 text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        {isRTL ? "من نحن" : "About Us"}
                    </h1>
                    <p className="text-xl mb-8 leading-relaxed">
                        {isRTL
                            ? "منصة العقارات الرائدة في سوريا، نساعدك في العثور على العقار المثالي أو بيع عقارك بأفضل الأسعار"
                            : "Syria's leading real estate platform, helping you find the perfect property or sell your property at the best prices"
                        }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
                            <Link href={`/${locale}`}>
                                {isRTL ? "تصفح العقارات" : "Browse Properties"}
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            {isRTL ? "رؤيتنا ورسالتنا" : "Our Vision & Mission"}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <Card className="p-6 border-0 shadow-md">
                            <CardContent className="p-0">
                                <h3 className="text-xl font-semibold text-primary mb-4">
                                    {isRTL ? "رؤيتنا" : "Our Vision"}
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {isRTL
                                        ? "أن نكون المنصة العقارية الأولى في سوريا، ونقدم أفضل الخدمات لعملائنا مع ضمان الشفافية والموثوقية في كل معاملة."
                                        : "To be Syria's leading real estate platform, providing the best services to our clients while ensuring transparency and reliability in every transaction."
                                    }
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="p-6 border-0 shadow-md">
                            <CardContent className="p-0">
                                <h3 className="text-xl font-semibold text-primary mb-4">
                                    {isRTL ? "رسالتنا" : "Our Mission"}
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {isRTL
                                        ? "تسهيل عملية البحث عن العقارات وبيعها وإيجارها من خلال منصة تقنية متطورة، مع توفير دعم فني متميز وخدمة عملاء على أعلى مستوى."
                                        : "Facilitate the process of searching, selling, and renting properties through an advanced technological platform, while providing excellent technical support and top-tier customer service."
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Love Message */}
                    <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-white text-center">
                        <Heart className="w-12 h-12 mx-auto mb-4 text-white/80" />
                        <h3 className="text-2xl font-bold mb-4">
                            {isRTL ? "صنع بكل ❤️ في سوريا" : "Made with ❤️ in Syria"}
                        </h3>
                        <p className="text-white/90 leading-relaxed mb-4">
                            {isRTL
                                ? "نحن فخورون بأن نكون جزءاً من المجتمع السوري، ونساهم في تطوير قطاع العقارات في بلدنا الحبيب."
                                : "We are proud to be part of the Syrian community, contributing to the development of the real estate sector in our beloved country."
                            }
                        </p>
                        <div className="text-3xl">🇸🇾</div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {isRTL ? "تواصل معنا" : "Contact Us"}
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        {isRTL
                            ? "نحن هنا لمساعدتك في كل خطوة من رحلتك العقارية"
                            : "We're here to help you every step of your real estate journey"
                        }
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse gap-2">
                            <Phone className="w-5 h-5 text-primary" />
                            <span className="text-gray-700" dir="ltr">+963 999 999 999</span>
                        </div>
                        <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse gap-2">
                            <Mail className="w-5 h-5 text-primary" />
                            <span className="text-gray-700">info@ajar.com</span>
                        </div>
                        <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            <span className="text-gray-700">{isRTL ? "دمشق، سوريا" : "Damascus, Syria"}</span>
                        </div>
                    </div>

                    <Button size="lg" className="bg-primary hover:bg-primary/80 text-white">
                        <Link href={`/${locale}`}>
                            {isRTL ? "ابدأ الآن" : "Get Started"}
                        </Link>
                    </Button>
                </div>
                <div className="h-4 w-full bg-gray-100" />
            </section>
        </div>
    )
}
