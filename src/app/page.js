'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { createClient } from '@/lib/supabaseClient';
import { formatPrice } from '@/utils/format';

export default function Home() {
  const { addToCart } = useCart();
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(''); // '' = todos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      // Carrega produtos
      const { data: prods, error: prodError } = await supabase
        .from('produtos')
        .select('*')
        .order('nome', { ascending: true });

      if (prodError) {
        setError(prodError.message);
        setLoading(false);
        return;
      }

      setProdutos(prods || []);

      // Extrai categorias únicas (ignora null/undefined)
      const uniqueCats = [...new Set(prods.map(p => p.categoria).filter(Boolean))];
      setCategorias(uniqueCats);

      setLoading(false);
    }

    fetchData();
  }, []);

  // Filtra produtos com base na categoria selecionada
  const produtosFiltrados = categoriaSelecionada
    ? produtos.filter(p => p.categoria === categoriaSelecionada)
    : produtos;

  if (loading) return <div className="text-center p-8 text-gray-soft">Carregando perfumes...</div>;
  if (error) return <div className="text-red-600 text-center p-8">Erro: {error}</div>;

  return (
    <div className="bg-cream min-h-screen p-4">
      <h1 className="text-4xl font-bold text-dark text-center mb-8">Produtos Disponíveis</h1>

      {/* Filtro de categorias */}
      {categorias.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => setCategoriaSelecionada('')}
            className={`px-5 py-2 rounded-full font-medium transition-colors cursor-pointer ${
              categoriaSelecionada === ''
                ? 'bg-accent-gold text-cream'
                : 'bg-gray-200 text-dark hover:bg-gray-300'
            }`}
          >
            Todos
          </button>

          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaSelecionada(cat)}
              className={`px-5 py-2 rounded-full font-medium transition-colors cursor-pointer ${
                categoriaSelecionada === cat
                  ? 'bg-accent-gold text-cream'
                  : 'bg-gray-200 text-dark hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {produtosFiltrados.length === 0 ? (
        <p className="text-center text-gray-soft text-lg">
          Nenhum produto encontrado nesta categoria.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {produtosFiltrados.map((produto) => (
            <div
              key={produto.id}
              className="border border-gray-soft rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow flex flex-col cursor-pointer"
            >
              <div className="relative w-full aspect-4/3 overflow-hidden">
                <Image
                  src={produto.imagem_url || '/placeholder-perfume.jpg'}
                  alt={produto.nome}
                  fill
                  className="object-contain p-4"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-4 flex flex-col grow">
                <h2 className="text-xl font-semibold text-dark">{produto.nome}</h2>
                <p className="text-gray-soft">{produto.volume}</p>
                <p className="text-accent-gold font-bold text-lg mt-2">
                  {formatPrice(produto.preco)}
                </p>
                {produto.categoria && (
                  <span className="text-xs bg-accent-mauve text-white px-2 py-1 rounded-full inline-block mt-2 w-fit">
                    {produto.categoria}
                  </span>
                )}
                <p className="text-gray-soft text-sm mt-2 grow">{produto.descricao}</p>
                <button
                  onClick={() => addToCart(produto)}
                  className="mt-4 bg-accent-gold text-cream px-4 py-2 rounded hover:bg-accent-mauve w-full font-medium transition-colors cursor-pointer"
                >
                  Adicionar ao Carrinho
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}