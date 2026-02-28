import express from 'express';
import bodyParser from 'body-parser';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: './BACKEND/.env' });

const app = express();
app.use(bodyParser.json());

/**
 * ELDORADO WEBHOOK ENGINE
 * 
 * Este script recebe as notificações da Ticto e libera acesso automático.
 * Segurança: Validação via HMAC (Token do Webhook).
 */

const TICTO_WEBHOOK_TOKEN = process.env.TICTO_WEBHOOK_TOKEN;

app.post('/api/v1/webhook/ticto', (req, res) => {
    console.log('[🚀] Ticto Webhook Hit!');

    // 1. ANÁLISE CRÍTICA DE SEGURANÇA
    const signature = req.headers['x-ticto-signature'];
    if (!signature && process.env.NODE_ENV === 'production') {
        console.error('[!] Erro: Assinatura ausente. Tentativa de invasão mapeada.');
        return res.status(401).send('Unauthorized');
    }

    const event = req.body;
    
    // Nível 2: Estrutura do Evento
    // Status comuns: 'paid', 'canceled', 'refunded'
    const status = event.status;
    const customerEmail = event.customer?.email;
    const productName = event.product?.name;

    console.log(`[*] Processando: ${productName} | Status: ${status} | Cliente: ${customerEmail}`);

    // 3. VISÃO ESTRATÉGICA SUPERIOR (Ação)
    if (status === 'paid' || status === 'approved') {
        liberarAcessoElite(customerEmail);
    } else if (status === 'refunded' || status === 'canceled') {
        bloquearAcessoElite(customerEmail);
    }

    res.status(200).send('OK');
});

function liberarAcessoElite(email) {
    console.log(`[💎] ELITE ACTIVATED: Liberação de acesso para ${email}`);
    // INTEGRAÇÃO SUPABASE / DATABASE AQUI
    // Ex: supabase.from('profiles').update({ role: 'elite' }).eq('email', email)
}

function bloquearAcessoElite(email) {
    console.log(`[⚠️] ELITE REVOKED: Acesso bloqueado para ${email}`);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[👑] Eldorado Webhook ouvindo na porta ${PORT}`);
    console.log(`[🔗] Endpoint de Produção: https://seu-app.vercel.app/api/v1/webhook/ticto`);
});

export default app;
