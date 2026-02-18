import Link from 'next/link';
import {
  MessageSquare, Building2, Users, Package,
  ArrowRight, Check, Star, Shield, Zap,
  Globe, BarChart3, Clock, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const MODULES = [
  {
    id: 'messages',
    name: 'FaOn-Connect',
    description: 'Kurumsal mesajlaşma, kanal yönetimi ve gerçek zamanlı iletişim',
    icon: MessageSquare,
    color: 'text-blue-500 bg-blue-500/10',
    borderColor: 'hover:border-blue-500/50',
    href: '/messages',
    features: ['Gerçek zamanlı mesajlaşma', 'Kanal ve gruplar', 'Dosya paylaşımı', 'Arama ve arşiv'],
    status: 'active',
  },
  {
    id: 'erp',
    name: 'İnşaat ERP',
    description: 'Proje yönetimi, bütçe takibi, hakediş ve kaynak planlaması',
    icon: Building2,
    color: 'text-purple-500 bg-purple-500/10',
    borderColor: 'hover:border-purple-500/50',
    href: '/erp',
    features: ['Proje takibi', 'Bütçe yönetimi', 'Hakediş hesaplama', 'Gantt şeması'],
    status: 'active',
  },
  {
    id: 'crm',
    name: 'Müşteri İlişkileri',
    description: 'Lead yönetimi, satış pipeline, müşteri takibi ve raporlama',
    icon: Users,
    color: 'text-green-500 bg-green-500/10',
    borderColor: 'hover:border-green-500/50',
    href: '/crm',
    features: ['Lead yönetimi', 'Satış pipeline', 'Müşteri 360°', 'Aktivite takibi'],
    status: 'active',
  },
  {
    id: 'stock',
    name: 'Stok & İhale',
    description: 'Envanter yönetimi, satın alma, ihale süreçleri ve tedarikçi ilişkileri',
    icon: Package,
    color: 'text-orange-500 bg-orange-500/10',
    borderColor: 'hover:border-orange-500/50',
    href: '/stock',
    features: ['Stok takibi', 'Satın alma', 'İhale yönetimi', 'Tedarikçi portalı'],
    status: 'active',
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'Hızlı ve Güçlü',
    description: 'Modern teknolojilerle geliştirilmiş, yüksek performanslı platform',
  },
  {
    icon: Shield,
    title: 'Güvenli',
    description: 'Kurumsal düzeyde güvenlik ve veri koruma',
  },
  {
    icon: Globe,
    title: 'Her Yerden Erişim',
    description: 'Web, mobil ve masaüstü uygulamalarıyla her yerden erişin',
  },
  {
    icon: BarChart3,
    title: 'Gelişmiş Raporlama',
    description: 'Özelleştirilebilir dashboardlar ve detaylı raporlar',
  },
  {
    icon: Clock,
    title: 'Gerçek Zamanlı',
    description: 'Anlık güncellemeler ve bildirimlere sahip dinamik platform',
  },
  {
    icon: Star,
    title: 'Kullanıcı Dostu',
    description: 'Sezgisel arayüz ve kolay öğrenilebilir yapı',
  },
];

const TESTIMONIALS = [
  {
    quote: 'FaOnSisT ile projelerimizi çok daha verimli yönetiyoruz. Tüm süreçler tek platformda.',
    author: 'Mehmet Yılmaz',
    title: 'Proje Müdürü, ABC İnşaat',
  },
  {
    quote: 'Müşteri ilişkilerimiz çok daha organize. Satış ekibimizin verimliliği %40 arttı.',
    author: 'Ayşe Demir',
    title: 'Satış Direktörü, XYZ Holding',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">F</span>
              </div>
              <span className="text-xl font-bold text-foreground">FaOnSisT</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="#modules" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Modüller
              </Link>
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Özellikler
              </Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Fiyatlandırma
              </Link>
              <Link href="#contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                İletişim
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Giriş Yap</Link>
              </Button>
              <Button asChild className="btn-glow">
                <Link href="/register">Ücretsiz Başla</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-50" />

        <div className="container relative mx-auto px-6 text-center">
          <Badge variant="outline" className="mb-6 py-1.5 px-4 text-sm border-primary/30 bg-primary/5">
            <Star className="h-3.5 w-3.5 mr-1.5 text-primary" />
            Yeni: FaOn-Connect ile gerçek zamanlı iletişim
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            İşletmenizi Tek Platformda
            <br />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
              Entegre Yönetin
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            İletişim, proje yönetimi, müşteri ilişkileri ve stok takibini tek bir platformda birleştirin.
            İşlerinizi daha verimli yönetin.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Button size="lg" asChild className="btn-glow h-12 px-8">
              <Link href="/messages">
                Başlayın
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8">
              Demo İzle
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: '500+', label: 'Aktif Kullanıcı' },
              { value: '%99.9', label: 'Uptime' },
              { value: '4.9/5', label: 'Kullanıcı Puanı' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-20 bg-surface/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Entegre Modüllerimiz
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              İşletmenizin tüm ihtiyaçlarını karşılayan, birbirleriyle entegre çalışan modüller
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {MODULES.map((module) => (
              <Link key={module.id} href={module.href}>
                <Card className={`bg-surface border-border h-full transition-all duration-300 hover:shadow-xl ${module.borderColor} cursor-pointer group`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-xl ${module.color}`}>
                        <module.icon className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        Aktif
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mt-4 group-hover:text-primary transition-colors">
                      {module.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {module.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {module.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-foreground">
                          <Check className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                      Keşfet <ChevronRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Neden FaOnSisT?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              İşletmenizi geleceğe taşıyacak özellikler
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <Card key={index} className="bg-surface border-border">
                <CardContent className="p-6">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-surface/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Müşterilerimiz Ne Diyor?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="bg-surface border-border">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Card className="bg-gradient-to-r from-primary/10 via-surface to-accent/10 border-primary/20">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Hemen Başlayın
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                14 gün ücretsiz deneme. Kredi kartı gerektirmez.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button size="lg" asChild className="btn-glow h-12 px-8">
                  <Link href="/register">
                    Ücretsiz Dene
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8">
                  Satış Ekibiyle Görüş
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-surface/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <span className="font-bold text-primary-foreground">F</span>
                </div>
                <span className="font-bold text-foreground">FaOnSisT</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Entegre iş yönetim platformu. Tüm iş süreçlerinizi tek çatı altında yönetin.
              </p>
            </div>

            {[
              {
                title: 'Ürün',
                links: ['Özellikler', 'Fiyatlandırma', 'Entegrasyonlar', 'API'],
              },
              {
                title: 'Şirket',
                links: ['Hakkımızda', 'Blog', 'Kariyer', 'İletişim'],
              },
              {
                title: 'Destek',
                links: ['Yardım Merkezi', 'Dokümantasyon', 'Topluluk', 'Durum'],
              },
            ].map((column, index) => (
              <div key={index}>
                <h4 className="font-semibold text-foreground mb-4">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 FaOnSisT. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Gizlilik Politikası
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Kullanım Şartları
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
