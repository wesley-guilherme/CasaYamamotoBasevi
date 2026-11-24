// Rolagem animada e controle de foco para chegar ao calendário de reserva.
// Mantém o cancelamento da animação atual para evitar rolagens simultâneas.
let cancelActiveScroll: (() => void) | undefined;

// Anima a rolagem até o calendário e permite interromper o movimento com interação manual.
export function scrollToBooking(target: HTMLElement) {
  cancelActiveScroll?.();

  const start = window.scrollY;
  const margin = Number.parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
  const destination = () => Math.max(0, target.getBoundingClientRect().top + window.scrollY - margin);
  const distance = destination() - start;
  const duration = Math.min(1600, Math.max(1000, Math.abs(distance) * 0.25));
  const startedAt = window.performance.now();
  let frame = 0;

  // Cancela a animação pendente e remove os eventos usados para interrompê-la.
  function cancel() {
    window.cancelAnimationFrame(frame);
    for (const event of ["wheel", "touchstart", "keydown", "pointerdown", "popstate", "pagehide"]) {
      window.removeEventListener(event, cancel);
    }
    if (cancelActiveScroll === cancel) cancelActiveScroll = undefined;
  }

  // Finaliza a rolagem, alinha o destino e atualiza o foco e a âncora de navegação.
  function finish() {
    cancel();
    target.focus({ preventScroll: true });
    if (window.location.hash !== "#escolher-datas") {
      window.history.pushState(window.history.state, "", "#escolher-datas");
    }
  }

  // Calcula o progresso da animação e agenda o próximo quadro até alcançar o destino.
  function animate(now: number) {
    if (!target.isConnected) { cancel(); return; }
    const progress = Math.min(1, Math.max(0, (now - startedAt) / duration));
    const eased = progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    // Cada quadro é imediato: o navegador não reinicia uma animação própria.
    window.scrollTo({ top: progress === 1 ? destination() : start + distance * eased, behavior: "instant" });
    if (progress < 1) frame = window.requestAnimationFrame(animate);
    else finish();
  }

  if (Math.abs(distance) < 1) { finish(); return; }
  cancelActiveScroll = cancel;
  for (const event of ["wheel", "touchstart", "keydown", "pointerdown", "popstate", "pagehide"]) {
    window.addEventListener(event, cancel, { passive: true });
  }
  // A animação continua mesmo quando o botão flutuante sai da tela e desmonta.
  frame = window.requestAnimationFrame(animate);
}
