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

const trackedSections = [
  ...navigationLinks.map((link) => link.href),
  "#contato",
];

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const scrollAnimationRef = useRef<number | null>(null);

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

  useEffect(
    () => () => {
      if (scrollAnimationRef.current !== null) {
        window.cancelAnimationFrame(scrollAnimationRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    let animationFrame: number | null = null;

    const updateActiveLink = () => {
      const headerHeight =
        document.querySelector<HTMLElement>(".site-header")?.offsetHeight ?? 0;
      const activationLine = headerHeight + 40;
      let nextActiveHref = "";

      for (const href of trackedSections) {
        const section = document.querySelector<HTMLElement>(href);
        if (!section) continue;

        if (section.getBoundingClientRect().top <= activationLine) {
          nextActiveHref = href;
        } else {
          break;
        }
      }

      const reachedPageEnd =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;

      if (reachedPageEnd) nextActiveHref = "#contato";

      setActiveHref((currentHref) =>
        currentHref === nextActiveHref ? currentHref : nextActiveHref,
      );
    };

    const scheduleUpdate = () => {
      if (animationFrame !== null) return;

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null;
        updateActiveLink();
      });
    };

    updateActiveLink();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
    };
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
    setActiveHref(href);

    if (closeDrawer) setIsOpen(false);

    const scroll = () => {
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;

      if (scrollAnimationRef.current !== null) {
        window.cancelAnimationFrame(scrollAnimationRef.current);
      }

      const startPosition = window.scrollY;
      const scrollMargin = Number.parseFloat(
        window.getComputedStyle(target).scrollMarginTop,
      ) || 0;
      const targetPosition = Math.max(
        0,
        target.getBoundingClientRect().top + startPosition - scrollMargin,
      );
      const distance = targetPosition - startPosition;
      const duration = Math.min(
        1000,
        Math.max(600, Math.abs(distance) * 0.2),
      );
      const startTime = window.performance.now();

      const animateScroll = (currentTime: number) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easedProgress =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        window.scrollTo(0, startPosition + distance * easedProgress);

        if (progress < 1) {
          scrollAnimationRef.current =
            window.requestAnimationFrame(animateScroll);
        } else {
          scrollAnimationRef.current = null;
        }
      };

      scrollAnimationRef.current = window.requestAnimationFrame(animateScroll);
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
            aria-current={activeHref === link.href ? "location" : undefined}
            className={activeHref === link.href ? "is-active" : undefined}
            href={link.href}
            key={link.href}
            onClick={(event) => scrollToSection(event, link.href)}
          >
            {link.label}
          </a>
        ))}
        <a
          aria-current={activeHref === "#contato" ? "location" : undefined}
          href="#contato"
          className={`nav-cta${
            activeHref === "#contato" ? " is-active" : ""
          }`}
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
                      aria-current={
                        activeHref === link.href ? "location" : undefined
                      }
                      className={
                        activeHref === link.href ? "is-active" : undefined
                      }
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
                  aria-current={
                    activeHref === "#contato" ? "location" : undefined
                  }
                  className={`mobile-menu-cta${
                    activeHref === "#contato" ? " is-active" : ""
                  }`}
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
