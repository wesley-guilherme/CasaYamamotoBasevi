import type { Metadata } from "next";
import LegalPage from "../legal-page";

export const metadata: Metadata = {
  title: "Termos de Uso | Casa Yamamoto Basevi",
  description: "Conheça as condições de uso do site, as orientações para consultas e reservas e as informações sobre conteúdos e serviços de terceiros.",
  alternates: { canonical: "/termos" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Termos de Uso"
      introduction="Aqui você encontra as condições para navegar pelo site, consultar a casa e planejar sua estadia com clareza e tranquilidade."
      sections={[
        {
          id: "sobre",
          title: "Sobre o site",
          content: <p>O site da Casa Yamamoto Basevi apresenta a casa de temporada em Prado, Bahia, seus ambientes, a disponibilidade informativa e sugestões de passeios, eventos e parceiros. A administração pode ser contatada pelo e-mail <a href="mailto:casayamamotobasevi@gmail.com">casayamamotobasevi@gmail.com</a>. Estes termos regulam o uso do site; as condições específicas da locação devem ser informadas e acordadas com o anfitrião antes da contratação.</p>,
        },
        {
          id: "uso-responsavel",
          title: "Uso responsável e áreas protegidas",
          content: <>
            <p>Utilize o site de forma lícita, respeitosa e compatível com sua finalidade. Ao solicitar atendimento, forneça informações corretas e apenas dados que você tenha autorização para compartilhar. A contratação deve ser realizada por pessoa maior de idade e legalmente capaz.</p>
            <p>Não é permitido tentar acessar registros de terceiros, contornar controles de acesso, divulgar senhas de áreas restritas, inserir conteúdo malicioso ou prejudicar o funcionamento do serviço. O acesso aos benefícios de hóspedes depende de autorização; os painéis administrativos se destinam às pessoas autorizadas pela administração.</p>
          </>,
        },
        {
          id: "reservas",
          title: "Consultas, valores e reservas",
          content: <>
            <p>Selecionar datas, consultar a agenda ou iniciar contato não garante disponibilidade e não conclui uma reserva. A reserva depende da confirmação expressa do anfitrião e do cumprimento das condições apresentadas antes da contratação.</p>
            <p>Valores, pagamentos, eventual caução, horários de entrada e saída, capacidade, animais, regras de convivência, alterações, cancelamentos e reembolsos devem ser esclarecidos no atendimento e constar da proposta ou do contrato aplicável. O site não processa pagamentos de reservas.</p>
            <p>Confira os dados do recebedor e as condições da reserva diretamente com o anfitrião antes de pagar. A agenda pode sofrer atualizações; eventuais divergências devem ser esclarecidas antes da confirmação, respeitados os direitos do consumidor e a vinculação das ofertas nos termos da lei.</p>
          </>,
        },
        {
          id: "planejamento",
          title: "Guia, clima, marés e eventos",
          content: <p>O guia turístico e as informações sobre clima, marés, distâncias, horários e eventos auxiliam o planejamento e podem mudar. Consulte as fontes oficiais, os organizadores e os prestadores antes de sair, contratar um passeio ou tomar decisões de segurança. Condições de navegação, banho e acesso a atrações dependem de fatores locais que não são controlados pela casa.</p>,
        },
        {
          id: "terceiros",
          title: "Parceiros e links externos",
          content: <>
            <p>Passeios, estabelecimentos e parceiros possuem atendimento e condições próprias. Confirme diretamente com cada prestador os preços, a disponibilidade, a validade dos benefícios e as regras aplicáveis antes de contratar. Uma indicação no guia, por si só, não constitui uma reserva nem uma contratação com a Casa Yamamoto Basevi.</p>
            <p>Links para mapas, redes sociais e outros serviços levam a ambientes de terceiros, sujeitos aos respectivos termos e avisos de privacidade. Isso não afasta responsabilidades que sejam atribuídas à casa pela legislação aplicável.</p>
          </>,
        },
        {
          id: "conteudos",
          title: "Marca, imagens e conteúdos",
          content: <p>A marca, as fotografias, os textos e os demais conteúdos pertencem à Casa Yamamoto Basevi ou a seus respectivos titulares, conforme o caso. A consulta e o compartilhamento de links para fins pessoais são permitidos. A reprodução comercial ou o uso da marca que sugira vínculo ou autorização dependem da permissão do titular, ressalvados os usos permitidos em lei.</p>,
        },
        {
          id: "privacidade-disponibilidade",
          title: "Privacidade e disponibilidade do serviço",
          content: <>
            <p>O tratamento de dados pessoais é descrito no <a href="/privacidade">Aviso de Privacidade</a>, que informa as finalidades, os direitos dos titulares e o canal de atendimento.</p>
            <p>O site pode apresentar interrupções por manutenção, falhas técnicas ou indisponibilidade de serviços externos. Se não conseguir consultar a agenda ou acessar uma funcionalidade, entre em contato por e-mail. A administração buscará corrigir erros identificados e prestar os esclarecimentos necessários.</p>
          </>,
        },
        {
          id: "atualizacoes-lei",
          title: "Atualizações, legislação e contato",
          content: <>
            <p>Estes termos podem ser revisados, com indicação da data de atualização. Alterações no site não modificam retroativamente condições já contratadas. Nenhuma disposição destes termos restringe direitos assegurados pela legislação brasileira, inclusive pelo Código de Defesa do Consumidor, quando aplicável.</p>
            <p>Dúvidas, correções e solicitações podem ser enviadas para <a href="mailto:casayamamotobasevi@gmail.com">casayamamotobasevi@gmail.com</a>. Eventuais controvérsias serão tratadas de acordo com a legislação brasileira e perante o foro legalmente competente, preservado o foro do consumidor quando assegurado por lei.</p>
          </>,
        },
      ]}
    />
  );
}
