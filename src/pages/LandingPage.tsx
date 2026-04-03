import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  FileText, Mail, Briefcase, BookOpen, Languages, Grid3X3,
  Sparkles, Upload, Download, ArrowRight, Star, Check,
} from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";
import templateCv from "@/assets/template-cv.jpg";
import templateCoverLetter from "@/assets/template-cover-letter.jpg";
import templateCreative from "@/assets/template-creative.jpg";
import templateAcademic from "@/assets/template-academic.jpg";

const templateImages = [templateCv, templateAcademic, templateCoverLetter, templateCreative];

const features = [
  { icon: FileText, title: "CV Builder", desc: "Professional resumes with AI-powered optimization and ATS scoring." },
  { icon: Mail, title: "Cover Letters", desc: "Tailored cover letters generated from job descriptions in seconds." },
  { icon: Briefcase, title: "Job Matching", desc: "Smart keyword extraction and ATS compatibility analysis." },
  { icon: BookOpen, title: "Book Creator", desc: "Write, structure, and publish books with AI assistance." },
  { icon: Languages, title: "Translation", desc: "Professional document translation with tone customization." },
  { icon: Grid3X3, title: "Templates", desc: "Curated gallery of modern, industry-specific templates." },
];

const steps = [
  { num: "01", title: "Choose a Tool", desc: "Select from CV builder, cover letter generator, book creator, or translation tool." },
  { num: "02", title: "Create with AI", desc: "Let AI assist you in crafting professional, polished documents effortlessly." },
  { num: "03", title: "Export & Apply", desc: "Download in PDF, DOCX, or EPUB and share with confidence." },
];

const testimonials = [
  { name: "Sarah K.", role: "Product Designer", text: "DocuAI helped me land my dream job. The CV builder is incredibly intuitive." },
  { name: "Marcus L.", role: "Software Engineer", text: "The job matching feature saved me hours of tailoring applications." },
  { name: "Emma T.", role: "Author", text: "Published my first book using the book creator. The chapter tools are amazing." },
];

const plans = [
  { name: "Free", price: "$0", features: ["3 documents/month", "Basic templates", "PDF export", "AI suggestions"] },
  { name: "Pro", price: "$12", popular: true, features: ["Unlimited documents", "All templates", "All export formats", "Priority AI", "Job matching", "Translation"] },
  { name: "Team", price: "$29", features: ["Everything in Pro", "Team workspace", "Brand kit", "API access", "Priority support"] },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-card">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.06),transparent_60%)]" />
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center lg:py-28">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-surface-hover px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3 text-primary" /> AI-Powered Document Platform
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            AI Career & Publishing
            <br />
            <span className="text-primary">Platform</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Create CVs, cover letters, books, translations and professional documents in minutes.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2">
                Start Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/templates">
              <Button size="lg" variant="outline">
                View Templates
              </Button>
            </Link>
          </div>
          <div className="mx-auto mt-12 max-w-4xl">
            <img
              src={heroImage}
              alt="DocuAI platform showing CV templates, cover letters, book creator, and translation tools"
              width={1920}
              height={1024}
              className="rounded-2xl border shadow-2xl shadow-primary/10"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 lg:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need</h2>
          <p className="mt-2 text-muted-foreground">Professional tools to build your career and publish your work.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="glass-card-hover p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-surface-active">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card">
        <div className="mx-auto max-w-5xl px-4 py-16 lg:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
            <p className="mt-2 text-muted-foreground">Three simple steps to professional documents.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {s.num}
                </div>
                <h3 className="text-sm font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Preview */}
      <section className="mx-auto max-w-6xl px-4 py-16 lg:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Template Gallery</h2>
          <p className="mt-2 text-muted-foreground">Start with professionally designed templates.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {["Modern CV", "Academic CV", "Corporate Letter", "Creative Resume"].map((t, i) => (
            <div key={t} className="glass-card-hover group overflow-hidden">
              <div className="h-40 overflow-hidden bg-secondary">
                <img src={templateImages[i]} alt={t} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              </div>
              <div className="p-4">
                <h3 className="text-sm font-medium">{t}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Professional template</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link to="/templates">
            <Button variant="outline" className="gap-2">
              Browse All Templates <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-card">
        <div className="mx-auto max-w-5xl px-4 py-16 lg:py-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Loved by professionals</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border bg-background p-5">
                <div className="mb-3 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">{t.text}</p>
                <div className="mt-4">
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-5xl px-4 py-16 lg:py-20">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold tracking-tight">Simple pricing</h2>
          <p className="mt-2 text-muted-foreground">Start free, upgrade when you need more.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl border p-6 ${
                p.popular ? "border-primary bg-card shadow-md ring-1 ring-primary/20" : "bg-card"
              }`}
            >
              {p.popular && (
                <span className="mb-3 inline-block rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-1">
                <span className="text-3xl font-bold">{p.price}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </p>
              <ul className="mt-4 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-3.5 w-3.5 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-6 w-full" variant={p.popular ? "default" : "outline"}>
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            DocuAI
          </div>
          <p className="text-xs text-muted-foreground">© 2026 DocuAI. All rights reserved.</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
