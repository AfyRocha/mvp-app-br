import { useState } from "react";
import {
  Sparkles, Hammer, Calculator, Scissors, Camera, UtensilsCrossed,
  Truck, FileCheck2, Home, Megaphone, Search, MapPin, Star,
  BadgeCheck, ChevronRight, ChevronLeft, MessageCircle, PartyPopper,
} from "lucide-react";

/* ============================================================
   TEM BRASILEIRO — protótipo MVP · v2
   Ícones SVG (lucide) + toques de glassmorphism
   Paleta: verde-mata #14634B · tinta #101B16 · amarelo #FFC942
   ============================================================ */

const CATEGORIAS = [
  { id: "limpeza", nome: "Limpeza", Icone: Sparkles },
  { id: "reforma", nome: "Reforma & Handyman", Icone: Hammer },
  { id: "taxes", nome: "Taxes & Contabilidade", Icone: Calculator },
  { id: "beleza", nome: "Beleza", Icone: Scissors },
  { id: "foto", nome: "Fotografia", Icone: Camera },
  { id: "comida", nome: "Comida & Eventos", Icone: UtensilsCrossed },
  { id: "transporte", nome: "Transporte", Icone: Truck },
  { id: "imigracao", nome: "Imigração", Icone: FileCheck2 },
];

const PRESTADORES = [
  {
    id: 1, nome: "Márcia Oliveira", categoria: "limpeza", cidade: "Orlando, FL",
    atende: "Orlando · Kissimmee · Winter Garden", nota: 4.9, avaliacoes: 87,
    verificado: true, desde: "2019", cor: "#2E7D5B", iniciais: "MO",
    bio: "Limpeza residencial e comercial. Deep cleaning, move-in/move-out. Equipe própria, produtos inclusos.",
    servicos: ["Limpeza residencial", "Deep cleaning", "Move-out cleaning", "Escritórios"],
    depoimento: { texto: "Contratei pra limpeza de mudança e ficou impecável. Super pontual e caprichosa!", autor: "Fernanda R.", quando: "há 2 semanas" },
  },
  {
    id: 2, nome: "Rafael Santos", categoria: "reforma", cidade: "Orlando, FL",
    atende: "Orlando · Lake Nona · Sanford", nota: 4.8, avaliacoes: 64,
    verificado: true, desde: "2017", cor: "#8A5A2B", iniciais: "RS",
    bio: "Handyman licenciado. Pintura, drywall, pisos, montagem de móveis e pequenos reparos em geral.",
    servicos: ["Pintura", "Drywall", "Instalação de pisos", "Montagem de móveis"],
    depoimento: { texto: "Fez a pintura da casa toda em 3 dias, orçamento justo e trabalho de primeira.", autor: "Carlos M.", quando: "há 1 mês" },
  },
  {
    id: 3, nome: "Juliana Costa, CPA", categoria: "taxes", cidade: "Boston, MA",
    atende: "Atende todos os EUA (online)", nota: 5.0, avaliacoes: 132,
    verificado: true, desde: "2015", cor: "#3D4E8A", iniciais: "JC",
    bio: "Contadora com CPA. Tax return pessoa física e empresa, abertura de LLC, ITIN e planejamento fiscal.",
    servicos: ["Tax return", "Abertura de LLC", "ITIN", "Bookkeeping"],
    depoimento: { texto: "Ela resolveu meu ITIN e meus taxes atrasados sem dor de cabeça. Explica tudo em português!", autor: "Paulo A.", quando: "há 3 dias" },
  },
  {
    id: 4, nome: "Aline Ferreira", categoria: "beleza", cidade: "Danbury, CT",
    atende: "Danbury · Bethel · Newtown", nota: 4.9, avaliacoes: 51,
    verificado: false, desde: "2021", cor: "#9C3D62", iniciais: "AF",
    bio: "Cabeleireira especializada em progressiva, mechas e corte. Atendimento em salão ou domicílio.",
    servicos: ["Progressiva", "Mechas & luzes", "Corte feminino", "Atendimento a domicílio"],
    depoimento: { texto: "Melhor progressiva que já fiz aqui nos EUA, do jeitinho do Brasil.", autor: "Bruna L.", quando: "há 1 semana" },
  },
  {
    id: 5, nome: "Diego Almeida", categoria: "foto", cidade: "Orlando, FL",
    atende: "Orlando · Disney · Miami (sob consulta)", nota: 4.7, avaliacoes: 38,
    verificado: true, desde: "2020", cor: "#54428A", iniciais: "DA",
    bio: "Fotógrafo de família e eventos. Ensaios na Disney, casamentos, aniversários e fotos profissionais.",
    servicos: ["Ensaio na Disney", "Casamentos", "Eventos", "Retrato profissional"],
    depoimento: { texto: "As fotos do nosso ensaio na Disney ficaram um sonho. Ele dirige super bem as poses!", autor: "Camila e João", quando: "há 2 meses" },
  },
];

const T = {
  verde: "#14634B",
  verdeEscuro: "#0C3D2E",
  tinta: "#101B16",
  amarelo: "#FFC942",
  papel: "#FFFFFF",
  cinza: "#5E6B64",
  linha: "#E4E9E6",
  fundo: "#F2F4F0",
  whats: "#1FAF54",
};

/* Superfícies de vidro */
const glass = {
  claro: {
    background: "rgba(255,255,255,0.62)",
    backdropFilter: "blur(16px) saturate(1.4)",
    WebkitBackdropFilter: "blur(16px) saturate(1.4)",
    border: "1px solid rgba(255,255,255,0.65)",
  },
  sobreVerde: {
    background: "rgba(255,255,255,0.14)",
    backdropFilter: "blur(14px) saturate(1.3)",
    WebkitBackdropFilter: "blur(14px) saturate(1.3)",
    border: "1px solid rgba(255,255,255,0.28)",
  },
};

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap');`;

function Estrelas({ nota }) {
  return (
    <span style={{ display: "inline-flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={13}
          fill={i <= Math.round(nota) ? T.amarelo : "none"}
          color={i <= Math.round(nota) ? T.amarelo : T.linha}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

function Avatar({ p, size = 52 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.36,
      background: `linear-gradient(140deg, ${p.cor}, ${p.cor}CC)`,
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: size * 0.36,
      flexShrink: 0, boxShadow: "inset 0 1px 0 rgba(255,255,255,.35)",
    }}>{p.iniciais}</div>
  );
}

function SeloVerificado({ mini }) {
  return (
    <span style={{
      background: T.amarelo, color: T.tinta, fontSize: mini ? 10 : 11, fontWeight: 700,
      padding: mini ? "2px 8px" : "3px 10px", borderRadius: 99, display: "inline-flex",
      alignItems: "center", gap: 3, verticalAlign: "middle",
    }}>
      <BadgeCheck size={mini ? 11 : 13} strokeWidth={2.4} /> Verificado
    </span>
  );
}

/* ---------- TELA: INÍCIO ---------- */
function TelaInicio({ busca, setBusca, catAtiva, setCatAtiva, abrirPerfil }) {
  const filtrados = PRESTADORES.filter((p) => {
    const okCat = !catAtiva || p.categoria === catAtiva;
    const q = busca.trim().toLowerCase();
    const okBusca = !q || p.nome.toLowerCase().includes(q) || p.bio.toLowerCase().includes(q) ||
      p.cidade.toLowerCase().includes(q) ||
      (CATEGORIAS.find((c) => c.id === p.categoria)?.nome.toLowerCase().includes(q));
    return okCat && okBusca;
  });

  return (
    <div>
      {/* Cabeçalho com vidro sobre o verde */}
      <div style={{
        background: `radial-gradient(120% 140% at 85% -20%, #1E7F62 0%, ${T.verde} 45%, ${T.verdeEscuro} 100%)`,
        padding: "20px 20px 26px", borderRadius: "0 0 28px 28px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 22, color: "#fff" }}>
            tem<span style={{ color: T.amarelo }}>brasileiro</span>
          </div>
          <div style={{
            ...glass.sobreVerde, borderRadius: 99, padding: "5px 12px",
            fontSize: 12, color: "#EAF5F0", fontWeight: 600,
            display: "inline-flex", alignItems: "center", gap: 5,
          }}>
            <MapPin size={13} /> Orlando, FL
          </div>
        </div>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 26, lineHeight: 1.15, color: "#fff", margin: "14px 0 16px" }}>
          Gente, tem brasileiro que faz…?
        </div>
        <div style={{
          ...glass.sobreVerde, borderRadius: 16, display: "flex",
          alignItems: "center", padding: "0 14px", height: 50,
        }}>
          <Search size={17} color="#EAF5F0" style={{ marginRight: 9, flexShrink: 0 }} />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="limpeza, taxes, fotógrafo…"
            style={{
              border: "none", outline: "none", flex: 1, fontSize: 15,
              fontFamily: "Inter, sans-serif", color: "#fff", background: "transparent",
            }}
          />
          <style>{`input::placeholder{color:rgba(255,255,255,.65)}`}</style>
        </div>
      </div>

      {/* Categorias */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", padding: "16px 20px 4px", scrollbarWidth: "none" }}>
        {CATEGORIAS.map((c) => {
          const ativa = catAtiva === c.id;
          return (
            <button key={c.id} onClick={() => setCatAtiva(ativa ? null : c.id)} style={{
              border: `1.5px solid ${ativa ? T.verde : "rgba(255,255,255,.7)"}`,
              ...(ativa ? { background: T.verde } : glass.claro),
              color: ativa ? "#fff" : T.tinta,
              borderRadius: 99, padding: "8px 14px", fontSize: 13, fontWeight: 600,
              whiteSpace: "nowrap", cursor: "pointer", fontFamily: "Inter, sans-serif",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <c.Icone size={14} strokeWidth={2.2} /> {c.nome}
            </button>
          );
        })}
      </div>

      {/* Lista */}
      <div style={{ padding: "12px 20px 20px" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.cinza, textTransform: "uppercase", letterSpacing: 0.8, margin: "6px 0 10px" }}>
          {filtrados.length} prestador{filtrados.length !== 1 ? "es" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}
        </div>
        {filtrados.map((p) => (
          <button key={p.id} onClick={() => abrirPerfil(p)} style={{
            width: "100%", textAlign: "left",
            ...glass.claro,
            borderRadius: 18, padding: 14, marginBottom: 10, cursor: "pointer",
            display: "flex", gap: 12, alignItems: "center", fontFamily: "Inter, sans-serif",
            boxShadow: "0 4px 18px rgba(16,27,22,.05)",
          }}>
            <Avatar p={p} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 15, color: T.tinta }}>{p.nome}</span>
                {p.verificado && <SeloVerificado mini />}
              </div>
              <div style={{ fontSize: 12.5, color: T.cinza, margin: "3px 0" }}>
                {CATEGORIAS.find((c) => c.id === p.categoria)?.nome} · {p.cidade}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Estrelas nota={p.nota} />
                <span style={{ fontSize: 12, color: T.cinza }}>{p.nota} ({p.avaliacoes})</span>
              </div>
            </div>
            <ChevronRight size={18} color={T.cinza} />
          </button>
        ))}
        {filtrados.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px", color: T.cinza, fontSize: 14 }}>
            Nenhum prestador ainda nessa busca.<br />
            <b style={{ color: T.verde }}>Conhece alguém? Convide para se cadastrar!</b>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- TELA: PERFIL ---------- */
function TelaPerfil({ p, voltar }) {
  const [avisou, setAvisou] = useState(false);
  return (
    <div>
      <div style={{
        background: `radial-gradient(120% 160% at 80% -30%, #1E7F62 0%, ${T.verde} 50%, ${T.verdeEscuro} 100%)`,
        padding: "16px 20px 56px", borderRadius: "0 0 28px 28px", position: "relative",
      }}>
        <button onClick={voltar} style={{
          ...glass.sobreVerde, color: "#fff", borderRadius: 99, padding: "7px 14px",
          fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif",
          display: "inline-flex", alignItems: "center", gap: 4,
        }}>
          <ChevronLeft size={15} /> Voltar
        </button>
      </div>
      <div style={{ padding: "0 20px", marginTop: -40 }}>
        {/* Cartão flutuante de vidro */}
        <div style={{ ...glass.claro, borderRadius: 22, padding: 18, boxShadow: "0 12px 32px rgba(16,27,22,.10)" }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <Avatar p={p} size={64} />
            <div>
              <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 19, color: T.tinta, lineHeight: 1.2 }}>{p.nome}</div>
              <div style={{ fontSize: 13, color: T.cinza, margin: "3px 0 5px" }}>{CATEGORIAS.find((c) => c.id === p.categoria)?.nome} · desde {p.desde}</div>
              {p.verificado && <SeloVerificado />}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 14, paddingTop: 14, borderTop: `1px solid rgba(16,27,22,.08)` }}>
            {[
              [p.nota, "nota média"],
              [p.avaliacoes, "avaliações"],
              [new Date().getFullYear() - Number(p.desde) + " anos", "de atuação"],
            ].map(([v, l], i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 17, color: T.verde }}>{v}</div>
                <div style={{ fontSize: 11, color: T.cinza }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <Secao titulo="Sobre">
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: T.tinta }}>{p.bio}</p>
          <div style={{ fontSize: 13, color: T.cinza, marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
            <MapPin size={14} /> Atende: <b style={{ color: T.tinta }}>{p.atende}</b>
          </div>
        </Secao>

        <Secao titulo="Serviços">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {p.servicos.map((s) => (
              <span key={s} style={{ ...glass.claro, borderRadius: 99, padding: "6px 12px", fontSize: 12.5, fontWeight: 600, color: T.tinta }}>{s}</span>
            ))}
          </div>
        </Secao>

        <Secao titulo="Avaliações">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Estrelas nota={p.nota} />
            <span style={{ fontSize: 13, color: T.cinza }}>{p.nota} · {p.avaliacoes} avaliações</span>
          </div>
          <div style={{ ...glass.claro, borderRadius: 14, padding: 12 }}>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: T.tinta }}>"{p.depoimento.texto}"</p>
            <div style={{ fontSize: 12, color: T.cinza, marginTop: 6 }}>— {p.depoimento.autor}, {p.depoimento.quando}</div>
          </div>
        </Secao>

        <button onClick={() => setAvisou(true)} style={{
          width: "100%", background: T.whats, color: "#fff", border: "none", borderRadius: 16,
          padding: "16px 0", fontSize: 16, fontWeight: 700, cursor: "pointer", margin: "6px 0 20px",
          fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 8, boxShadow: "0 8px 22px rgba(31,175,84,.35)",
        }}>
          <MessageCircle size={19} fill="#fff" strokeWidth={0} />
          {avisou ? "Abrindo WhatsApp… (demo)" : "Chamar no WhatsApp"}
        </button>
      </div>
    </div>
  );
}

function Secao({ titulo, children }) {
  return (
    <div style={{ margin: "18px 0" }}>
      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 15, color: T.tinta, marginBottom: 8 }}>{titulo}</div>
      {children}
    </div>
  );
}

/* ---------- TELA: ANUNCIAR (CADASTRO) ---------- */
function TelaCadastro() {
  const [form, setForm] = useState({ nome: "", categoria: "", cidade: "", whatsapp: "", bio: "" });
  const [enviado, setEnviado] = useState(false);
  const ok = form.nome && form.categoria && form.cidade && form.whatsapp;

  if (enviado) {
    return (
      <div style={{ padding: "60px 28px", textAlign: "center" }}>
        <div style={{
          ...glass.claro, width: 88, height: 88, borderRadius: 28, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 12px 30px rgba(16,27,22,.10)",
        }}>
          <PartyPopper size={42} color={T.verde} strokeWidth={1.8} />
        </div>
        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 24, color: T.tinta, margin: "16px 0 8px" }}>Cadastro enviado!</div>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: T.cinza, margin: 0 }}>
          Seu perfil entra no ar assim que for aprovado. Você vai receber uma mensagem no WhatsApp <b style={{ color: T.tinta }}>{form.whatsapp}</b> com os próximos passos.
        </p>
        <button onClick={() => { setEnviado(false); setForm({ nome: "", categoria: "", cidade: "", whatsapp: "", bio: "" }); }} style={{ marginTop: 24, background: "none", border: `1.5px solid ${T.verde}`, color: T.verde, borderRadius: 99, padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
          Cadastrar outro perfil
        </button>
      </div>
    );
  }

  const campo = {
    width: "100%", boxSizing: "border-box", ...glass.claro,
    borderRadius: 14, padding: "13px 14px", fontSize: 15,
    fontFamily: "Inter, sans-serif", color: T.tinta, outline: "none",
  };
  const label = { fontSize: 13, fontWeight: 700, color: T.tinta, margin: "14px 0 6px", display: "block" };

  return (
    <div style={{ padding: "22px 20px 24px" }}>
      <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 24, color: T.tinta }}>Anuncie seu serviço</div>
      <p style={{ fontSize: 14, color: T.cinza, margin: "6px 0 4px", lineHeight: 1.5 }}>
        Grátis para começar. Apareça para milhares de brasileiros na sua região.
      </p>

      <label style={label}>Seu nome ou nome do negócio</label>
      <input style={campo} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Márcia Cleaning" />

      <label style={label}>Categoria</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
        {CATEGORIAS.map((c) => {
          const ativa = form.categoria === c.id;
          return (
            <button key={c.id} onClick={() => setForm({ ...form, categoria: c.id })} style={{
              border: `1.5px solid ${ativa ? T.verde : "rgba(255,255,255,.7)"}`,
              ...(ativa ? { background: T.verde } : glass.claro),
              color: ativa ? "#fff" : T.tinta, borderRadius: 99, padding: "8px 13px", fontSize: 13,
              fontWeight: 600, cursor: "pointer", fontFamily: "Inter, sans-serif",
              display: "inline-flex", alignItems: "center", gap: 6,
            }}>
              <c.Icone size={14} strokeWidth={2.2} /> {c.nome}
            </button>
          );
        })}
      </div>

      <label style={label}>Cidade principal</label>
      <input style={campo} value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="Ex.: Orlando, FL" />

      <label style={label}>WhatsApp</label>
      <input style={campo} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+1 (407) 555-0123" inputMode="tel" />

      <label style={label}>Descreva seu serviço</label>
      <textarea style={{ ...campo, minHeight: 90, resize: "vertical" }} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="O que você faz, regiões que atende, diferenciais…" />

      <button disabled={!ok} onClick={() => setEnviado(true)} style={{
        width: "100%", background: ok ? T.verde : "rgba(16,27,22,.10)", color: ok ? "#fff" : T.cinza,
        border: "none", borderRadius: 16, padding: "16px 0", fontSize: 16, fontWeight: 700,
        cursor: ok ? "pointer" : "not-allowed", marginTop: 20, fontFamily: "Inter, sans-serif",
        boxShadow: ok ? "0 8px 22px rgba(20,99,75,.30)" : "none",
      }}>Enviar cadastro grátis</button>
      <p style={{ fontSize: 12, color: T.cinza, textAlign: "center", marginTop: 10 }}>
        Depois você pode ativar o plano Destaque: topo da busca, selo verificado e estatísticas.
      </p>
    </div>
  );
}

/* ---------- APP ---------- */
export default function App() {
  const [aba, setAba] = useState("inicio");
  const [perfil, setPerfil] = useState(null);
  const [busca, setBusca] = useState("");
  const [catAtiva, setCatAtiva] = useState(null);

  return (
    <div style={{
      fontFamily: "Inter, sans-serif", minHeight: "100vh", maxWidth: 480, margin: "0 auto",
      position: "relative",
      background: `
        radial-gradient(60% 40% at 15% 8%, rgba(20,99,75,.10), transparent 70%),
        radial-gradient(50% 35% at 90% 45%, rgba(255,201,66,.14), transparent 70%),
        radial-gradient(55% 40% at 20% 90%, rgba(20,99,75,.08), transparent 70%),
        ${T.fundo}`,
    }}>
      <style>{fontImport}</style>

      <div style={{ paddingBottom: 96 }}>
        {perfil ? (
          <TelaPerfil p={perfil} voltar={() => setPerfil(null)} />
        ) : aba === "inicio" ? (
          <TelaInicio busca={busca} setBusca={setBusca} catAtiva={catAtiva} setCatAtiva={setCatAtiva} abrirPerfil={setPerfil} />
        ) : (
          <TelaCadastro />
        )}
      </div>

      {/* Navegação inferior — barra de vidro flutuante */}
      <div style={{
        position: "fixed", bottom: 12, left: "50%", transform: "translateX(-50%)",
        width: "calc(100% - 32px)", maxWidth: 448,
        ...glass.claro,
        background: "rgba(255,255,255,0.72)",
        borderRadius: 24, display: "flex", padding: "8px 6px",
        boxShadow: "0 10px 30px rgba(16,27,22,.14)",
      }}>
        {[
          { id: "inicio", Icone: Home, nome: "Início" },
          { id: "anunciar", Icone: Megaphone, nome: "Anunciar" },
        ].map((t) => {
          const ativa = aba === t.id && !perfil;
          return (
            <button key={t.id} onClick={() => { setAba(t.id); setPerfil(null); }} style={{
              flex: 1, background: ativa ? "rgba(20,99,75,.10)" : "none",
              border: "none", cursor: "pointer", borderRadius: 18, padding: "8px 0",
              fontFamily: "Inter, sans-serif", color: ativa ? T.verde : T.cinza,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            }}>
              <t.Icone size={21} strokeWidth={ativa ? 2.4 : 1.9} />
              <div style={{ fontSize: 11.5, fontWeight: ativa ? 700 : 500 }}>{t.nome}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
