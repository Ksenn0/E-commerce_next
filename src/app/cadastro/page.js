'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';

export default function CadastroPage() {
  const [step, setStep] = useState(1); // 1: email/senha, 2: perfil completo
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  // Etapa 1: Cadastro de email e senha
  const handleBasicSignup = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não conferem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/cadastro`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Se o signup exigir confirmação de email (padrão do Supabase)
    if (data.user && !data.user.confirmed_at) {
      alert('Cadastro realizado! Verifique seu email para confirmar a conta e continue o cadastro.');
    }

    setStep(2); // Vai para preenchimento do perfil
  };

  // Etapa 2: Salvar dados do perfil
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Pega o usuário atual (deve estar logado após signup)
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError('Sessão não encontrada. Faça login novamente.');
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        nome_completo: formData.nome_completo,
        telefone: formData.telefone,
        endereco: formData.endereco,
        numero: formData.numero,
        bairro: formData.bairro,
        complemento: formData.complemento,
        cidade: formData.cidade,
      });

    setLoading(false);

    if (insertError) {
      setError('Erro ao salvar perfil: ' + insertError.message);
      console.error(insertError);
      return;
    }

    setSuccess(true);
    alert('Perfil completo! Agora você pode fazer login e usar a loja.');
    window.location.href = '/login';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg">
        <h1 className="text-3xl font-bold text-dark mb-8 text-center">
          {step === 1 ? 'Cadastro na Loja' : 'Complete seu Perfil'}
        </h1>

        {success ? (
          <div className="text-center text-green-600 text-lg">
            Cadastro concluído com sucesso! <br />
            <a href="/login" className="text-accent-gold underline mt-4 inline-block">
              Clique aqui para fazer login
            </a>
          </div>
        ) : step === 1 ? (
          <form onSubmit={handleBasicSignup}>
            <div className="mb-5">
              <label className="block text-gray-soft mb-2 font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                placeholder="seuemail@exemplo.com"
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-soft mb-2 font-medium">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-soft mb-2 font-medium">Confirmar Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                placeholder="Digite novamente a senha"
                required
              />
            </div>

            {error && <p className="text-red-600 mb-6 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-gold text-cream py-3 rounded-lg font-medium hover:bg-accent-mauve transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Criando conta...' : 'Continuar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleProfileSubmit}>
            <div className="mb-5">
              <label className="block text-gray-soft mb-2 font-medium">Nome Completo</label>
              <input
                type="text"
                name="nome_completo"
                value={formData.nome_completo}
                onChange={handleChange}
                className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-soft mb-2 font-medium">Telefone (WhatsApp)</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                placeholder="(99) 99999-9999"
                required
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-soft mb-2 font-medium">Endereço</label>
              <input
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                placeholder="Rua Exemplo, 123"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-gray-soft mb-2 font-medium">Número</label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                  placeholder="123"
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
                  placeholder="Centro"
                  required
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-gray-soft mb-2 font-medium">Complemento (opcional)</label>
              <input
                type="text"
                name="complemento"
                value={formData.complemento}
                onChange={handleChange}
                className="w-full p-3 text-dark border border-gray-soft rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-gold"
                placeholder="Apto 101, Bloco B"
              />
            </div>

            <div className="mb-6">
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

            {error && <p className="text-red-600 mb-6 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-gold text-cream py-3 rounded-lg font-medium hover:bg-accent-mauve transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Salvando perfil...' : 'Finalizar Cadastro'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}