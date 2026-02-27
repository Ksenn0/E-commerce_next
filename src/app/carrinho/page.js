'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/format';
import { createClient } from '@/lib/supabaseClient';

export default function Carrinho() {
  const { cartItems, removeFromCart, updateQuantity, total } = useCart();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);

      if (session?.user?.id) {
        // Puxa o perfil do usuário logado
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data, error }) => {
            if (error && error.code !== 'PGRST116') {
              console.error('Erro ao carregar perfil:', error);
              setError('Não foi possível carregar seu perfil.');
            } else {
              setProfile(data || null);
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleFinalizar = () => {
    if (!session) {
      alert('Você precisa estar logado para finalizar o pedido.');
      window.location.href = '/login';
      return;
    }

    if (!profile || !profile.nome_completo || !profile.telefone) {
      alert('Complete seu perfil (nome e telefone) antes de finalizar o pedido.');
      window.location.href = '/cadastro'; // ou '/perfil' se criar página de edição
      return;
    }

    // Monta a mensagem completa para WhatsApp
    let mensagem = `Olá! Quero fazer o seguinte pedido:\n\n`;
    mensagem += `[INFORMAÇÕES DO CLIENTE]\n`
    mensagem += `Nome: ${profile.nome_completo}\n`;
    mensagem += `Telefone: ${profile.telefone}\n`;
    mensagem += `Endereço: ${profile.endereco || ''}, ${profile.numero || ''} - ${profile.bairro || ''}, ${profile.cidade || 'Picos'}\n`;
    if (profile.complemento) mensagem += `Complemento: ${profile.complemento}\n`;
    mensagem += `\n[PRODUTOS]\nItens:\n`;

    cartItems.forEach((item) => {
      mensagem += `• ${item.quantidade}x ${item.nome} (${item.volume || ''}) - ${formatPrice(item.preco * item.quantidade)}\n`;
    });

    mensagem += `\nTotal: ${formatPrice(total)}\n`;
    mensagem += `Forma de pagamento: Pix / Dinheiro na entrega\n`;
    mensagem += `Observações: ________________\n\n`;
    mensagem += `Obrigado! Aguardo confirmação.`;

    const encodedMessage = encodeURIComponent(mensagem);
    const whatsappUrl = `https://wa.me/5589999030380?text=${encodedMessage}`; // ← troque pelo número real da loja

    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return <div className="bg-cream min-h-screen p-8 text-center">Carregando carrinho...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="bg-cream min-h-screen p-8 text-center">
        <h1 className="text-3xl font-bold text-dark mb-4">Seu Carrinho está Vazio</h1>
        <p className="text-gray-soft">Adicione produtos da página inicial!</p>
      </div>
    );
  }

  return (
    <div className="bg-cream min-h-screen p-8">
      <h1 className="text-3xl font-bold text-dark mb-8">Seu Carrinho</h1>

      <div className="grid gap-6">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center border border-gray-soft p-4 rounded-lg bg-white shadow"
          >
            <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-lg ">
              <Image
                src={item.imagem_url || '/Placeholder.png'}
                alt={item.nome || 'Produto no carrinho'}
                fill
                className="object-contain p-1"
                sizes="96px"
                priority={false}
              />
            </div>

            <div className="ml-4 grow">
              <h2 className="text-lg font-semibold text-dark">{item.nome}</h2>
              <p className="text-gray-soft">{item.volume}</p>
              <p className="text-accent-gold font-bold">{formatPrice(item.preco * item.quantidade)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantidade - 1)}
                className="bg-accent-mauve text-white px-2 py-1 rounded cursor-pointer"
              >
                -
              </button>
              <span className="text-dark">{item.quantidade}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantidade + 1)}
                className="bg-accent-mauve text-white px-2 py-1 rounded cursor-pointer"
              >
                +
              </button>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-600 ml-4 cursor-pointer"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-right">
        <p className="text-xl font-bold text-dark">Total: {formatPrice(total)}</p>

        {session ? (
          <button
            onClick={handleFinalizar}
            className="mt-4 bg-accent-gold text-cream px-6 py-3 rounded hover:bg-accent-mauve font-bold cursor-pointer w-full md:w-auto"
          >
            Finalizar Pedido (via WhatsApp)
          </button>
        ) : (
          <div className="mt-6 text-center">
            <p className="text-red-600 font-medium mb-4">
              Você precisa estar logado para finalizar o pedido
            </p>
            <a
              href="/login"
              className="inline-block bg-accent-gold text-cream px-8 py-3 rounded font-medium hover:bg-accent-mauve cursor-pointer"
            >
              Fazer Login
            </a>
          </div>
        )}
      </div>

      {error && <p className="text-red-600 text-center mt-4">{error}</p>}
    </div>
  );
}