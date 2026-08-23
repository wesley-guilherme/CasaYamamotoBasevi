"use client";

import { type MouseEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Links compartilhados entre a navegação desktop e o menu móvel.
const navigationLinks = [
  { href: "#casa", label: "A casa", detail: "Ambientes e comodidades" },
  {
    href: "#experiencias",
    label: "Conheça Prado",
    detail: "Praias e experiências",
  },
  {
    href: "#planeje",
    label: "Clima e marés",
    detail: "Informações para o seu dia",
  },
  {
    href: "#parceiros",
    label: "Parceiros",
    detail: "Benefícios para hóspedes",
  },
  {
    href: "#como-chegar",
    label: "Como chegar",
    detail: "Localização e orientações",
  },
];

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Enquanto o menu estiver aberto, impede a rolagem do conteúdo ao fundo,
  // direciona o foco para o menu e mantém o teclado dentro dele.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusableElements = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href]:not([tabindex="-1"])',
        ) ?? [],
      );

    window.requestAnimationFrame(() => focusableElements()[0]?.focus());

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        window.requestAnimationFrame(() => triggerRef.current?.focus());
        return;
      }

      if (event.key !== "Tab") return;

      const elements = focusableElements();
      if (elements.length === 0) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Fecha o menu caso a tela seja ampliada para o modo desktop.
  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 901px)");
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsOpen(false);
    };

    desktopQuery.addEventListener("change", closeOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeOnDesktop);
  }, []);

  function closeMenu(restoreFocus = false) {
    setIsOpen(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }

  function scrollToSection(
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
    closeDrawer = false,
  ) {
    event.preventDefault();

    if (closeDrawer) setIsOpen(false);

    const scroll = () => {
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;

      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.pushState(null, "", href);
    };

    if (closeDrawer) {
      window.requestAnimationFrame(() => window.requestAnimationFrame(scroll));
    } else {
      scroll();
    }
  }

  return (
    <>
      {/* Navegação tradicional, exibida somente em telas maiores. */}
      <nav className="desktop-nav" aria-label="Navegação principal">
        {navigationLinks.slice(0, 4).map((link) => (
          <a
            href={link.href}
            key={link.href}
            onClick={(event) => scrollToSection(event, link.href)}
          >
            {link.label}
          </a>
        ))}
        <a
          href="#contato"
          className="nav-cta"
          onClick={(event) => scrollToSection(event, "#contato")}
        >
          Consultar datas
        </a>
      </nav>

      {/* Botão hamburger com estado informado a leitores de tela. */}
      <button
        ref={triggerRef}
        className="mobile-menu-trigger"
        type="button"
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="hamburger-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="mobile-menu-label">Menu</span>
      </button>

      {/* O portal coloca o painel diretamente no `body`, ocupando a tela toda. */}
      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="mobile-menu-layer"
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Menu de navegação"
            >
              <button
                className="mobile-menu-backdrop"
                type="button"
                tabIndex={-1}
                aria-label="Fechar menu"
                onClick={() => closeMenu(true)}
              />
              <div className="mobile-menu-drawer" ref={drawerRef}>
                <div className="mobile-menu-heading">
                  <div>
                    <span className="mobile-menu-kicker">Casa Yamamoto</span>
                    <strong>Explore sua estadia</strong>
                  </div>
                  <button
                    className="mobile-menu-close"
                    type="button"
                    aria-label="Fechar menu"
                    onClick={() => closeMenu(true)}
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                <nav className="mobile-drawer-nav" aria-label="Navegação móvel">
                  {navigationLinks.map((link) => (
                    <a
                      href={link.href}
                      key={link.href}
                      onClick={(event) =>
                        scrollToSection(event, link.href, true)
                      }
                    >
                      <span>
                        <strong>{link.label}</strong>
                        <small>{link.detail}</small>
                      </span>
                      <span className="mobile-nav-arrow" aria-hidden="true">
                        →
                      </span>
                    </a>
                  ))}
                </nav>

                <a
                  className="mobile-menu-cta"
                  href="#contato"
                  onClick={(event) =>
                    scrollToSection(event, "#contato", true)
                  }
                >
                  Consultar disponibilidade
                </a>
                <small className="mobile-menu-note">
                  Atendimento direto com o proprietário
                </small>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
