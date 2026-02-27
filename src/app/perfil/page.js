'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function PerfilPage() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    telefone: '',
    endereco: '',
    numero: '',
    bairro: '',
    complemento: '',
    cidade: 'Picos',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
        return;
      }

      setSession(session);

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
            if (data) {
              setFormData({
                nome_completo: data.nome_completo || '',
                telefone: data.telefone || '',
                endereco: data.endereco || '',
                numero: data.numero || '',
                bairro: data.bairro || '',
                complemento: data.complemento || '',
                cidade: data.cidade || 'Picos',
              });
            }
          }
          setLoading(false);
        });
    });
  }, [router, supabase]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!session?.user?.id) {
      setError('Sessão não encontrada. Faça login novamente.');
      return;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(formData)
      .eq('id', session.user.id);

    if (updateError) {
      setError('Erro ao atualizar perfil: ' + updateError.message);
      console.error(updateError);
    } else {
      setProfile(prev => ({ ...prev, ...formData }));
      setSuccess(true);
      setEditing(false);
      alert('Perfil atualizado com sucesso!');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-gray-soft">
        Carregando seu perfil...
      </div>
    );
  }

  if (!session) {
    return null; // redireciona no useEffect
  }

  return (
    <div className="min-h-screen bg-cream p-6 md:p-10">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-dark">Meu Perfil</h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors cursor-pointer"
          >
            Sair
          </button>
        </div>

        {success && (
          <p className="text-green-600 bg-green-50 p-3 rounded mb-6 text-center">
            Perfil atualizado com sucesso!
          </p>
        )}

        {error && (
          <p className="text-red-600 bg-red-50 p-3 rounded mb-6 text-center">{error}</p>
        )}

        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-soft mb-2 font-medium">Nome Completo</label>
              <input
                type="text"
                name="nome_completo"
                value={formData.nome_completo}
                onChange={handleChange}
                className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                required
              />
            </div>

            <div>
              <label className="block text-gray-soft mb-2 font-medium">Telefone (WhatsApp)</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                required
              />
            </div>

            <div>
              <label className="block text-gray-soft mb-2 font-medium">Endereço</label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-soft mb-2 font-medium">Número</label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-soft mb-2 font-medium">Bairro</label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-soft mb-2 font-medium">Complemento (opcional)</label>
              <input
                type="text"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
                className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
              />
            </div>

            <div>
              <label className="block text-gray-soft mb-2 font-medium">Cidade</label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                required
              />
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="submit"
                className="flex-1 bg-accent-gold text-cream py-3 rounded-lg font-medium hover:bg-accent-mauve transition-colors cursor-pointer"
              >
                Salvar Alterações
              </button>

              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 bg-gray-300 text-dark py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-dark mb-4">Informações Pessoais</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-soft font-medium">Nome Completo</p>
                  <p className="text-dark">{profile?.nome_completo || 'Não informado'}</p>
                </div>

                <div>
                  <p className="text-gray-soft font-medium">Telefone (WhatsApp)</p>
                  <p className="text-dark">{profile?.telefone || 'Não informado'}</p>
                </div>

                <div>
                  <p className="text-gray-soft font-medium">Endereço</p>
                  <p className="text-dark">{profile?.endereco || 'Não informado'}</p>
                </div>

                <div>
                  <p className="text-gray-soft font-medium">Número</p>
                  <p className="text-dark">{profile?.numero || 'Não informado'}</p>
                </div>

                <div>
                  <p className="text-gray-soft font-medium">Bairro</p>
                  <p className="text-dark">{profile?.bairro || 'Não informado'}</p>
                </div>

                <div>
                  <p className="text-gray-soft font-medium">Complemento</p>
                  <p className="text-dark">{profile?.complemento || 'Não informado'}</p>
                </div>

                <div>
                  <p className="text-gray-soft font-medium">Cidade</p>
                  <p className="text-dark">{profile?.cidade || 'Não informado'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setEditing(true)}
              className="w-full bg-accent-gold text-cream py-3 rounded-lg font-medium hover:bg-accent-mauve transition-colors cursor-pointer"
            >
              Editar Perfil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}