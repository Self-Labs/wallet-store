#!/bin/bash

# Para o script se houver qualquer erro
set -e

# Garante que o comando rode na pasta onde o script está (raiz do repo)
cd "$(dirname "$0")"

echo "=========================================="
echo "--- Verificando atualizações Wallet Store em $(date) ---"

# --- CONFIGURAÇÃO ---
BRANCH="master"

# Atualiza referências do git sem baixar os arquivos ainda
git fetch origin $BRANCH

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/$BRANCH)

if [ "$LOCAL" != "$REMOTE" ]; then
  echo "🚀 Atualização detectada na $BRANCH ($REMOTE). Iniciando deploy..."

  # 1. Reseta o código local para ficar IDÊNTICO ao GitHub
  git reset --hard origin/$BRANCH
  git clean -fd

  echo "📦 Reconstruindo imagens (Baking Code) e subindo containers..."
  # --build: Garante que o Dockerfile seja lido novamente (instala dependências novas se houver)
  docker compose up -d --build --remove-orphans

  echo "⏳ Aguardando a API respirar (10s)..."
  sleep 10

  echo "🗄️ Rodando Migrations no Banco de Dados..."
  # Garante que novas tabelas criadas no Django sejam aplicadas no Postgres
  docker exec store_api python manage.py migrate

  echo "✅ Atualização aplicada com sucesso em $(date)"

else
  echo "💤 Nenhuma atualização encontrada. Tudo atualizado."
fi

echo "Processo finalizado."
echo "=========================================="