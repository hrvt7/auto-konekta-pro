import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Car, FileText, Users, Check } from "lucide-react";

const features = [
  {
    icon: Car,
    title: "Készletkezelés",
    desc: "Teljes jármű nyilvántartás képekkel, státusszal és részletes adatokkal.",
  },
  {
    icon: FileText,
    title: "Automatikus szerződés",
    desc: "Adásvételi, üzembentartói és meghatalmazási szerződések egy kattintással.",
  },
  {
    icon: Users,
    title: "Vevőnyilvántartás",
    desc: "Magánszemélyek és cégek adatai, vásárlási előzmények egy helyen.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "15 000",
    features: ["50 jármű", "Korlátlan vevő", "Alapszerződések", "Email támogatás"],
  },
  {
    name: "Pro",
    price: "25 000",
    popular: true,
    features: ["Korlátlan jármű", "Korlátlan vevő", "Összes szerződéstípus", "Prioritás támogatás", "Exportálás"],
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Car className="h-7 w-7 text-accent" />
            <span className="text-xl font-bold text-primary">AutoDok</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Bejelentkezés</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Kipróbálom</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
          Gyorsabb autóeladás,
          <br />
          <span className="text-accent">hibamentes szerződéskötés</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Egy adatbevitel — minden dokumentum automatikus. Kezelje készletét, vevőit és szerződéseit egyetlen felületen.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link to="/register">Ingyenes próba</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link to="/login">Bejelentkezés</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-primary">Minden, amire szüksége van</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="border-0 shadow-lg">
              <CardContent className="pt-8 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                  <f.icon className="h-7 w-7 text-accent" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-primary">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-secondary/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-primary">Árazás</h2>
          <div className="mx-auto grid max-w-3xl gap-8 md:grid-cols-2">
            {plans.map((p) => (
              <Card key={p.name} className={`relative ${p.popular ? "border-2 border-accent shadow-xl" : "shadow-lg"}`}>
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-bold text-accent-foreground">
                    Népszerű
                  </div>
                )}
                <CardContent className="pt-8 text-center">
                  <h3 className="text-xl font-bold text-primary">{p.name}</h3>
                  <div className="my-4">
                    <span className="text-4xl font-bold text-primary">{p.price}</span>
                    <span className="text-muted-foreground"> Ft/hó</span>
                  </div>
                  <ul className="mb-6 space-y-2 text-left">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-accent" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" variant={p.popular ? "default" : "outline"} asChild>
                    <Link to="/register">Kipróbálom</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© 2026 AutoDok. Minden jog fenntartva.</p>
      </footer>
    </div>
  );
}
