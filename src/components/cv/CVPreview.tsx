import { Separator } from "@/components/ui/separator";
import type { TemplateStyle } from "@/data/templateDefinitions";

interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
}

interface CVData {
  name: string;
  title: string;
  email: string;
  phone: string;
  summary: string;
  skills: string;
  experiences: ExperienceItem[];
  education: string;
  certifications: string;
  languages: string;
}

interface CVPreviewProps {
  data: CVData;
  style: TemplateStyle;
  templateName?: string;
}

function SectionTitle({ label, style }: { label: string; style: TemplateStyle }) {
  const base = "text-xs font-semibold uppercase tracking-wider mb-1";

  switch (style.sectionStyle) {
    case "bold-underline":
      return (
        <h3 className="text-xs font-bold mb-1 pb-1" style={{ color: style.sectionTitleColor, borderBottom: `2px solid ${style.primaryColor}` }}>
          {label}
        </h3>
      );
    case "accent-border":
      return (
        <h3 className={base} style={{ color: style.sectionTitleColor, borderLeft: `3px solid ${style.primaryColor}`, paddingLeft: 8 }}>
          {label}
        </h3>
      );
    case "icon-prefix":
      return (
        <h3 className={base} style={{ color: style.sectionTitleColor }}>
          <span style={{ color: style.primaryColor, marginRight: 6 }}>●</span>{label}
        </h3>
      );
    case "minimal-dot":
      return (
        <h3 className={base} style={{ color: style.sectionTitleColor }}>
          {label} <span style={{ color: style.primaryColor }}>·</span>
        </h3>
      );
    default:
      return <h3 className={base} style={{ color: style.sectionTitleColor }}>{label}</h3>;
  }
}

function SectionDivider({ style }: { style: TemplateStyle }) {
  switch (style.sectionDivider) {
    case "line":
      return <hr className="my-2 border-t" style={{ borderColor: style.accentColor }} />;
    case "dots":
      return <div className="my-2 text-center tracking-[0.5em] text-xs" style={{ color: style.primaryColor }}>···</div>;
    case "gradient":
      return <div className="my-2 h-px" style={{ background: `linear-gradient(to right, ${style.primaryColor}, transparent)` }} />;
    case "thick-accent":
      return <div className="my-2 h-1 w-12 rounded" style={{ backgroundColor: style.accentColor !== style.primaryColor ? style.accentColor : style.primaryColor }} />;
    default:
      return <div className="my-2" />;
  }
}

function HeaderBlock({ data, style }: { data: CVData; style: TemplateStyle }) {
  const isGradient = style.headerBg.includes("gradient");
  const hasBg = style.headerBg !== "transparent";

  return (
    <div
      className={`${hasBg ? "p-4 rounded-t-lg" : ""}`}
      style={{
        background: hasBg ? style.headerBg : undefined,
        color: hasBg ? style.headerText : style.headerText,
      }}
    >
      {style.avatarShape !== "none" && (
        <div
          className={`w-14 h-14 mb-2 flex items-center justify-center text-lg font-bold ${
            style.avatarShape === "circle" ? "rounded-full" : style.avatarShape === "rounded" ? "rounded-lg" : "rounded-none"
          }`}
          style={{ backgroundColor: hasBg ? "rgba(255,255,255,0.2)" : style.primaryColor, color: hasBg ? style.headerText : "#fff" }}
        >
          {data.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </div>
      )}
      <h2 className={`${style.nameSize} font-bold ${style.titleFont}`}>{data.name}</h2>
      <p className="text-sm font-medium mt-0.5" style={{ color: hasBg ? "rgba(255,255,255,0.85)" : style.primaryColor }}>{data.title}</p>
      <p className="text-xs mt-1 opacity-75">{data.email} • {data.phone}</p>
    </div>
  );
}

function SidebarContent({ data, style }: { data: CVData; style: TemplateStyle }) {
  return (
    <div className="space-y-3">
      <div>
        <SectionTitle label="Contact" style={style} />
        <p className="text-xs break-all">{data.email}</p>
        <p className="text-xs">{data.phone}</p>
      </div>
      <SectionDivider style={style} />
      <div>
        <SectionTitle label="Skills" style={style} />
        <div className="flex flex-wrap gap-1">
          {data.skills.split(",").map(s => s.trim()).filter(Boolean).map(s => (
            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: style.skillBadgeBg, color: style.skillBadgeText }}>{s}</span>
          ))}
        </div>
      </div>
      <SectionDivider style={style} />
      <div>
        <SectionTitle label="Languages" style={style} />
        <p className="text-xs">{data.languages}</p>
      </div>
      <SectionDivider style={style} />
      <div>
        <SectionTitle label="Education" style={style} />
        <p className="text-xs">{data.education}</p>
      </div>
    </div>
  );
}

function MainContent({ data, style, includeSideSections }: { data: CVData; style: TemplateStyle; includeSideSections: boolean }) {
  return (
    <div className={`space-y-3 ${style.bodyFont}`}>
      <div>
        <SectionTitle label="Summary" style={style} />
        <p className="text-xs" style={{ color: style.bodyText }}>{data.summary}</p>
      </div>
      <SectionDivider style={style} />
      {includeSideSections && (
        <>
          <div>
            <SectionTitle label="Skills" style={style} />
            <div className="flex flex-wrap gap-1">
              {data.skills.split(",").map(s => s.trim()).filter(Boolean).map(s => (
                <span key={s} className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: style.skillBadgeBg, color: style.skillBadgeText }}>{s}</span>
              ))}
            </div>
          </div>
          <SectionDivider style={style} />
        </>
      )}
      <div>
        <SectionTitle label="Experience" style={style} />
        {data.experiences.map(exp => (
          <div key={exp.id} className="mb-2">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-semibold" style={{ color: style.sectionTitleColor }}>{exp.title || "Untitled"}</p>
              <p className="text-[10px]" style={{ color: style.bodyText }}>{exp.period}</p>
            </div>
            <p className="text-[10px]" style={{ color: style.primaryColor }}>{exp.company}</p>
            <p className="text-[10px] mt-0.5" style={{ color: style.bodyText }}>{exp.description}</p>
          </div>
        ))}
      </div>
      <SectionDivider style={style} />
      {includeSideSections && (
        <>
          <div>
            <SectionTitle label="Education" style={style} />
            <p className="text-xs" style={{ color: style.bodyText }}>{data.education}</p>
          </div>
          <SectionDivider style={style} />
        </>
      )}
      <div>
        <SectionTitle label="Certifications" style={style} />
        <p className="text-xs" style={{ color: style.bodyText }}>{data.certifications}</p>
      </div>
      {includeSideSections && (
        <>
          <SectionDivider style={style} />
          <div>
            <SectionTitle label="Languages" style={style} />
            <p className="text-xs" style={{ color: style.bodyText }}>{data.languages}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function CVPreview({ data, style, templateName }: CVPreviewProps) {
  const hasSidebar = style.layout === "sidebar-left" || style.layout === "sidebar-right";
  const isLeft = style.layout === "sidebar-left";

  if (hasSidebar) {
    const isGradient = style.headerBg.includes("gradient");
    const sidebarBg = isGradient ? style.headerBg : style.headerBg !== "transparent" ? style.headerBg : style.primaryColor;
    const sidebarText = style.headerText;

    return (
      <div className="rounded-lg overflow-hidden border" style={{ backgroundColor: style.bodyBg }}>
        <div className={`flex ${isLeft ? "" : "flex-row-reverse"}`}>
          <div className="w-[38%] p-4 text-xs" style={{ background: sidebarBg, color: sidebarText }}>
            {style.avatarShape !== "none" && (
              <div
                className={`w-14 h-14 mb-3 mx-auto flex items-center justify-center text-lg font-bold ${
                  style.avatarShape === "circle" ? "rounded-full" : style.avatarShape === "rounded" ? "rounded-lg" : ""
                }`}
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                {data.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
            )}
            <h2 className={`${style.nameSize} font-bold ${style.titleFont} leading-tight`}>{data.name}</h2>
            <p className="text-xs mt-0.5 opacity-85">{data.title}</p>
            <div className="mt-4">
              <SidebarContent data={data} style={{ ...style, sectionTitleColor: "rgba(255,255,255,0.7)", bodyText: "rgba(255,255,255,0.9)", skillBadgeBg: "rgba(255,255,255,0.15)", skillBadgeText: "#fff" }} />
            </div>
          </div>
          <div className="flex-1 p-4">
            <MainContent data={data} style={style} includeSideSections={false} />
          </div>
        </div>
      </div>
    );
  }

  if (style.layout === "two-column") {
    return (
      <div className="rounded-lg overflow-hidden border" style={{ backgroundColor: style.bodyBg }}>
        <HeaderBlock data={data} style={style} />
        <div className="grid grid-cols-2 gap-4 p-4">
          <div className={style.bodyFont}>
            <SectionTitle label="Summary" style={style} />
            <p className="text-xs mb-3" style={{ color: style.bodyText }}>{data.summary}</p>
            <SectionDivider style={style} />
            <SectionTitle label="Experience" style={style} />
            {data.experiences.map(exp => (
              <div key={exp.id} className="mb-2">
                <p className="text-xs font-semibold" style={{ color: style.sectionTitleColor }}>{exp.title}</p>
                <p className="text-[10px]" style={{ color: style.primaryColor }}>{exp.company} · {exp.period}</p>
                <p className="text-[10px]" style={{ color: style.bodyText }}>{exp.description}</p>
              </div>
            ))}
          </div>
          <div className={style.bodyFont}>
            <SectionTitle label="Skills" style={style} />
            <div className="flex flex-wrap gap-1 mb-3">
              {data.skills.split(",").map(s => s.trim()).filter(Boolean).map(s => (
                <span key={s} className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: style.skillBadgeBg, color: style.skillBadgeText }}>{s}</span>
              ))}
            </div>
            <SectionDivider style={style} />
            <SectionTitle label="Education" style={style} />
            <p className="text-xs mb-3" style={{ color: style.bodyText }}>{data.education}</p>
            <SectionDivider style={style} />
            <SectionTitle label="Certifications" style={style} />
            <p className="text-xs mb-3" style={{ color: style.bodyText }}>{data.certifications}</p>
            <SectionDivider style={style} />
            <SectionTitle label="Languages" style={style} />
            <p className="text-xs" style={{ color: style.bodyText }}>{data.languages}</p>
          </div>
        </div>
      </div>
    );
  }

  // single-column & top-header
  return (
    <div className="rounded-lg overflow-hidden border" style={{ backgroundColor: style.bodyBg }}>
      <HeaderBlock data={data} style={style} />
      <div className="p-4">
        <MainContent data={data} style={style} includeSideSections={true} />
      </div>
    </div>
  );
}
