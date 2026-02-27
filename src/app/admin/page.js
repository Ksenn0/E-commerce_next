'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import Image from 'next/image';
import { formatPrice } from '@/utils/format';

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [formData, setFormData] = useState({
    nome: '',
    preco: '',
    volume: '',
    descricao: '',
    imagem: null,
    categoria: '',
    novaCategoria: '',
  });
  const [currentImageUrl, setCurrentImageUrl] = useState(null);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);

      if (session) {
        fetchProdutos();
        fetchCategorias();
      }
    });
  }, []);

  const fetchProdutos = async () => {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      setError('Erro ao carregar produtos: ' + error.message);
    } else {
      setProdutos(data || []);
    }
  };

  const fetchCategorias = async () => {
    const { data, error } = await supabase
      .from('categorias')
      .select('nome')
      .order('nome', { ascending: true });

    if (!error) {
      setCategorias(data?.map(c => c.nome) || []);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, imagem: e.target.files[0] || null }));
  };

  const handleAddCategoria = async () => {
    const nova = formData.novaCategoria.trim();
    if (!nova) return;

    const { error } = await supabase
      .from('categorias')
      .insert({ nome: nova });

    if (error) {
      setError('Erro ao adicionar categoria: ' + error.message);
    } else {
      setCategorias(prev => [...prev, nova].sort());
      setFormData(prev => ({ ...prev, categoria: nova, novaCategoria: '' }));
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    let imagem_url = currentImageUrl;

    if (formData.imagem) {
      const fileName = `${Date.now()}-${formData.imagem.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('imagens')
        .upload(fileName, formData.imagem);

      if (uploadError) {
        setError('Erro ao enviar imagem: ' + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('imagens')
        .getPublicUrl(fileName);

      imagem_url = urlData.publicUrl;
    }

    // Decide categoria final
    let categoriaFinal = formData.categoria;
    if (formData.novaCategoria.trim()) {
      categoriaFinal = formData.novaCategoria.trim();
      // Adiciona nova categoria automaticamente
      await supabase.from('categorias').insert({ nome: categoriaFinal });
      setCategorias(prev => [...prev, categoriaFinal].sort());
    }

    const produtoData = {
      nome: formData.nome,
      preco: parseFloat(formData.preco),
      volume: formData.volume,
      descricao: formData.descricao,
      imagem_url,
      categoria: categoriaFinal || null,
    };

    let result;

    if (editId) {
      result = await supabase
        .from('produtos')
        .update(produtoData)
        .eq('id', editId);
    } else {
      result = await supabase
        .from('produtos')
        .insert([produtoData]);
    }

    const { error: dbError } = result;

    if (dbError) {
      setError('Erro ao salvar produto: ' + dbError.message);
    } else {
      setFormData({
        nome: '',
        preco: '',
        volume: '',
        descricao: '',
        imagem: null,
        categoria: '',
        novaCategoria: '',
      });
      setCurrentImageUrl(null);
      setEditId(null);
      fetchProdutos();
      alert(editId ? 'Produto atualizado!' : 'Produto adicionado!');
    }
  };

  const handleEdit = (produto) => {
    setFormData({
      nome: produto.nome,
      preco: produto.preco.toString(),
      volume: produto.volume || '',
      descricao: produto.descricao || '',
      imagem: null,
      categoria: produto.categoria || '',
      novaCategoria: '',
    });
    setCurrentImageUrl(produto.imagem_url || null);
    setEditId(produto.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);

    if (error) {
      setError('Erro ao excluir: ' + error.message);
    } else {
      fetchProdutos();
      alert('Produto excluído!');
    }
  };

  if (loading) return <div className="text-center p-8">Carregando painel...</div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-dark mb-4">Acesso Restrito</h1>
          <p className="text-gray-soft mb-6">Faça login para acessar o painel administrativo.</p>
          <a href="/login" className="bg-accent-gold text-cream px-6 py-3 rounded cursor-pointer hover:bg-accent-mauve">
            Ir para Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-dark mb-8 text-center">Painel Administrativo</h1>

        {/* Formulário */}
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-2xl font-semibold text-dark mb-6">
            {editId ? 'Editar Produto' : 'Adicionar Novo Produto'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-soft mb-2 font-medium">Nome do Produto</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                required
              />
            </div>

            <div>
              <label className="block text-gray-soft mb-2 font-medium">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                name="preco"
                value={formData.preco}
                onChange={handleInputChange}
                className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                required
              />
            </div>

            <div>
              <label className="block text-gray-soft mb-2 font-medium">Volume (ex: 50ml)</label>
              <input
                type="text"
                name="volume"
                value={formData.volume}
                onChange={handleInputChange}
                className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-soft mb-2 font-medium">Descrição</label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold h-24"
              />
            </div>

            {/* Campo de categoria */}
            <div className="md:col-span-2">
              <label className="block text-gray-soft mb-2 font-medium">Categoria</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  name="categoria"
                  value={formData.categoria || ''}
                  onChange={handleInputChange}
                  className="flex-1 p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nova categoria"
                    value={formData.novaCategoria || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, novaCategoria: e.target.value }))}
                    className="flex-1 p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategoria}
                    className="bg-accent-gold text-cream px-4 py-3 rounded hover:bg-accent-mauve cursor-pointer font-medium"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-gray-soft mb-2 font-medium">Imagem do Produto</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 text-dark border border-gray-soft rounded-lg"
              />

              {editId && currentImageUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-soft mb-2">Imagem atual:</p>
                  <div className="relative w-40 h-40 mx-auto md:mx-0 rounded-lg overflow-hidden shadow-sm">
                    <Image
                      src={currentImageUrl}
                      alt="Imagem atual"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {error && <p className="md:col-span-2 text-red-600 text-center font-medium">{error}</p>}

            <div className="md:col-span-2 flex gap-4 mt-4">
              <button
                type="submit"
                className="flex-1 bg-accent-gold text-cream py-3 rounded-lg font-medium hover:bg-accent-mauve transition-colors cursor-pointer"
              >
                {editId ? 'Atualizar Produto' : 'Adicionar Produto'}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      nome: '',
                      preco: '',
                      volume: '',
                      descricao: '',
                      imagem: null,
                      categoria: '',
                      novaCategoria: '',
                    });
                    setCurrentImageUrl(null);
                    setEditId(null);
                  }}
                  className="flex-1 bg-gray-300 text-dark py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors cursor-pointer"
                >
                  Cancelar Edição
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de produtos */}
        <h2 className="text-3xl font-bold text-dark mb-8 text-center">Produtos Cadastrados</h2>

        {produtos.length === 0 ? (
          <p className="text-center text-gray-soft text-lg">Nenhum produto cadastrado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtos.map((produto) => (
              <div key={produto.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={produto.imagem_url || '/placeholder-perfume.jpg'}
                    alt={produto.nome}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-dark mb-1">{produto.nome}</h3>
                  <p className="text-accent-gold font-bold text-xl">
                    {formatPrice(produto.preco)}
                  </p>
                  <p className="text-sm text-gray-soft mt-1">{produto.volume}</p>
                  {produto.categoria && (
                    <span className="inline-block bg-accent-mauve text-white text-xs px-2 py-1 rounded-full mt-2">
                      {produto.categoria}
                    </span>
                  )}
                  <p className="text-sm text-gray-soft mt-3 line-clamp-3">{produto.descricao}</p>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => handleEdit(produto)}
                      className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(produto.id)}
                      className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-colors cursor-pointer font-medium"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}