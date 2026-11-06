import type { Metadata } from "next";
import LegalPage from "../legal-page";

export const metadata: Metadata = {
  title: "Aviso de Privacidade | Casa Yamamoto Basevi",
  description: "Saiba como a Casa Yamamoto Basevi trata dados pessoais, utiliza cookies e atende às solicitações de privacidade.",
  alternates: { canonical: "/privacidade" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Aviso de Privacidade"
      introduction="Transparência e cuidado também fazem parte da sua estadia. Entenda quais informações utilizamos, para quê e como falar conosco sobre seus dados pessoais."
      sections={[
        {
          id: "responsavel",
          title: "Quem cuida dos seus dados",
          content: <p>A administração da Casa Yamamoto Basevi, casa de temporada localizada em Prado, Bahia, é responsável pelas decisões sobre o tratamento dos dados usados no atendimento e na gestão das reservas. Para dúvidas ou solicitações de privacidade, escreva para <a href="mailto:casayamamotobasevi@gmail.com">casayamamotobasevi@gmail.com</a>.</p>,
        },
        {
          id: "dados",
          title: "Quais informações são utilizadas",
          content: <>
            <ul>
              <li><strong>Atendimento e reservas:</strong> nome do responsável, e-mail, telefone quando informado, cidade, estado, datas, quantidade de hóspedes, origem da reserva, valores e informações necessárias à organização da estadia, fornecidos no contato com o anfitrião.</li>
              <li><strong>Navegação e segurança:</strong> endereço IP, data e horário de acesso e informações técnicas do navegador podem ser processados pela infraestrutura de hospedagem para entregar as páginas e prevenir abusos.</li>
              <li><strong>Áreas protegidas:</strong> informações de sessão e autenticação; no acesso administrativo com conta ChatGPT, nome e e-mail disponibilizados pelo provedor, quando presentes.</li>
            </ul>
            <p>A seleção de datas e da quantidade de hóspedes no formulário, por si só, não confirma nem envia uma reserva. Não informe dados sensíveis, documentos ou dados de cartão sem uma necessidade previamente esclarecida pelo anfitrião.</p>
          </>,
        },
        {
          id: "finalidades",
          title: "Finalidades e bases legais",
          content: <>
            <p>Utilizamos os dados necessários para responder a consultas solicitadas por você, preparar e administrar reservas, organizar a estadia e manter o site funcionando com segurança.</p>
            <p>Conforme a situação, o tratamento se apoia em procedimentos preliminares ao contrato solicitados pelo titular e na execução contratual, no cumprimento de obrigações legais ou no exercício regular de direitos. Medidas de segurança podem se apoiar em legítimo interesse, respeitados a necessidade e os seus direitos. Se alguma finalidade depender de consentimento, ele será solicitado de forma específica e poderá ser revogado.</p>
          </>,
        },
        {
          id: "cookies",
          title: "Cookies e armazenamento no navegador",
          content: <>
            <p>As áreas restritas utilizam cookies de sessão para reconhecer acessos autorizados. O acesso de hóspedes pode permanecer ativo por até sete dias. O ambiente de demonstração do anfitrião pode guardar dados no próprio navegador para preservar as alterações da demonstração.</p>
            <p>O site não utiliza ferramentas próprias de publicidade comportamental. A plataforma de hospedagem e serviços externos podem tratar dados técnicos conforme seus avisos. Você pode apagar ou bloquear cookies e dados locais nas configurações do navegador; isso pode encerrar sessões ou impedir o acesso às áreas protegidas.</p>
          </>,
        },
        {
          id: "compartilhamento",
          title: "Prestadores e serviços externos",
          content: <>
            <p>A hospedagem e a infraestrutura tecnológica utilizam serviços de OpenAI/ChatGPT Sites e Cloudflare. Informações necessárias podem ser tratadas por esses prestadores e por ferramentas usadas pelo anfitrião no atendimento, limitadas à finalidade de cada serviço, ou fornecidas a autoridades quando houver obrigação legal.</p>
            <p>Ao abrir links de WhatsApp, mapas, redes sociais, passeios ou parceiros, você passa a utilizar serviços sujeitos a avisos próprios. Esses links não enviam automaticamente aos parceiros os dados privados das reservas. A previsão do tempo é consultada para a localização da casa, sem exigir sua localização precisa.</p>
            <p>Prestadores de tecnologia podem processar dados em outros países. Quando houver transferência internacional de dados pessoais, devem ser observadas as garantias e os mecanismos previstos na legislação brasileira.</p>
          </>,
        },
        {
          id: "conservacao",
          title: "Conservação e proteção",
          content: <>
            <p>As informações são mantidas pelo período necessário ao atendimento e à reserva e, quando aplicável, ao cumprimento de obrigações legais e à proteção de direitos. Encerradas essas necessidades, os dados devem ser eliminados ou anonimizados, ressalvadas as hipóteses legais de conservação.</p>
            <p>O acesso aos registros administrativos é restrito. A agenda pública apresenta a disponibilidade, sem divulgar os dados de contato e os valores das reservas. Adotamos controles de acesso e recursos de segurança da infraestrutura; nenhum serviço na internet oferece proteção absoluta. Eventuais incidentes serão avaliados e comunicados aos titulares e à autoridade competente quando exigido.</p>
          </>,
        },
        {
          id: "direitos",
          title: "Seus direitos e como solicitar",
          content: <>
            <p>Nos termos da LGPD, você pode solicitar confirmação e acesso aos seus dados, correção, informações sobre compartilhamento, portabilidade conforme regulamentação e anonimização, bloqueio ou eliminação nas hipóteses legais. Pode também revogar consentimento, conhecer as consequências de não fornecê-lo e se opor a tratamento irregular.</p>
            <p>Envie sua solicitação, sem custo, para <a href="mailto:casayamamotobasevi@gmail.com?subject=Solicita%C3%A7%C3%A3o%20de%20privacidade">casayamamotobasevi@gmail.com</a>, indicando o direito que deseja exercer. Podemos solicitar apenas informações proporcionais para confirmar sua identidade e proteger seus dados. O atendimento observará os prazos e as condições legais, com esclarecimento caso exista impedimento. Você também pode recorrer à <a href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados" target="_blank" rel="noopener noreferrer">Autoridade Nacional de Proteção de Dados (ANPD)</a>.</p>
          </>,
        },
        {
          id: "menores-atualizacoes",
          title: "Crianças, adolescentes e atualizações",
          content: <>
            <p>As consultas e contratações devem ser conduzidas por um adulto responsável. Caso sejam necessários dados de crianças ou adolescentes para a estadia, o tratamento deve se limitar ao necessário, considerar seu melhor interesse e observar as exigências legais aplicáveis.</p>
            <p>Este aviso pode ser atualizado para refletir mudanças no serviço ou nas obrigações legais, com indicação da data da revisão. Consulte também os <a href="/termos">Termos de Uso</a>. Referência: <a href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm" target="_blank" rel="noopener noreferrer">Lei Geral de Proteção de Dados Pessoais — Lei nº 13.709/2018</a>.</p>
          </>,
        },
      ]}
    />
  );
}
