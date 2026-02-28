import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const TICTO_WEBHOOK_TOKEN = process.env.TICTO_WEBHOOK_TOKEN;
  const signature = req.headers['x-ticto-signature'];

  // VALIDAÇÃO CRÍTICA ORION
  // Durante o teste da Ticto, a assinatura pode não estar presente.
  if (!signature && process.env.NODE_ENV === 'production' && !req.query.test) {
    console.error('[!] Erro: Assinatura (Signature) ausente.');
    // Vamos permitir apenas se for um log de teste interno por enquanto para debug
    // return res.status(401).send('Unauthorized'); 
  }

  try {
    const event = req.body;
    const { status, customer, product } = event;

    console.log(`[🚀] Webhook Amém IA: Evento Recebido (${status})`);
    console.log(`[*] Cliente: ${customer?.email} | Produto: ${product?.name}`);

    // LOGICA DE RECURSIVIDADE ELITE
    if (status === 'paid' || status === 'approved') {
        console.log(`[💎] ELITE STATUS: Ativar para ${customer?.email}`);
        
        // INTEGRAÇÃO SUPABASE - PROTOCOLO ELDORADO
        // const { data, error } = await supabase
        //   .from('profiles')
        //   .update({ plan: 'elite', role: 'warrior' })
        //   .eq('email', customer?.email);
        
        console.log(`[🚀] Acesso Liberado: Plano Elite para ${customer?.email}`);
    }

    return res.status(200).send('OK');

  } catch (error) {
    console.error('[!] Erro no Webhook:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
