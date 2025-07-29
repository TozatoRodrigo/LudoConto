# 🔧 Configuração do Stripe para Ludo Conto

## 📋 Passos para Configurar o Stripe

### 1. Criar Conta no Stripe
- Acesse: https://dashboard.stripe.com/register
- Crie sua conta e ative o modo de produção quando estiver pronto

### 2. Criar Produto e Preço
1. No Dashboard do Stripe, vá em **Products**
2. Clique em **Add Product**
3. Configure:
   - **Name**: Ludo Conto Premium
   - **Description**: Ilustrações ilimitadas para histórias infantis
   - **Pricing Model**: Recurring
   - **Price**: R$ 9,99
   - **Billing Period**: Monthly
4. Copie o **Price ID** (começa com `price_`)

### 3. Configurar Webhook
1. Vá em **Developers > Webhooks**
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://us-central1-ludoconto.cloudfunctions.net/stripeWebhook`
   - **Events to send**:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
4. Copie o **Webhook Secret** (começa com `whsec_`)

### 4. Obter Chaves da API
1. Vá em **Developers > API keys**
2. Copie:
   - **Publishable key** (começa com `pk_`)
   - **Secret key** (começa com `sk_`)

### 5. Configurar Variáveis de Ambiente
Atualize o arquivo `functions/.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_aqui
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui
STRIPE_PRICE_ID=price_seu_price_id_aqui
```

### 6. Atualizar Price ID no Código
No arquivo `functions/index.js`, linha ~XXX, substitua:
```javascript
price: "price_1QVqGnGqzJoJhJhJhJhJhJhJ", // Substitua pelo seu Price ID
```

Por:
```javascript
price: "SEU_PRICE_ID_AQUI",
```

### 7. Deploy das Functions
```bash
npx firebase-tools deploy --only functions
```

### 8. Testar Pagamentos
1. Use cartões de teste do Stripe:
   - **Sucesso**: 4242 4242 4242 4242
   - **Falha**: 4000 0000 0000 0002
2. Qualquer data futura e CVC válido

## 🔒 Segurança
- Nunca exponha suas chaves secretas no frontend
- Use sempre HTTPS em produção
- Configure webhooks com assinatura verificada

## 📞 Suporte
- Documentação: https://stripe.com/docs
- Dashboard: https://dashboard.stripe.com