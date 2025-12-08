#!/bin/bash

# --- CONFIGURAÇÃO ---
BACKUP_DIR="/srv/store/backups"
CONTAINER_NAME="store-db"
DB_USER="django"
DB_NAME="walletdb" # O nome do banco que você quer salvar
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
FILENAME="$BACKUP_DIR/store_backup_$DATE.sql.gz"

# Cria a pasta de backups se não existir
mkdir -p $BACKUP_DIR

echo "--- Iniciando Backup: $DATE ---"

# 1. Executa o pg_dump dentro do container e joga a saída comprimida para o host
# O 'docker exec' roda o comando lá dentro, mas o '>' redireciona para um arquivo no Orange Pi
if docker exec -t $CONTAINER_NAME pg_dump -U $DB_USER $DB_NAME | gzip > "$FILENAME"; then
  echo "✅ Backup criado com sucesso: $FILENAME"
else
  echo "❌ Falha ao criar backup!"
  # Remove o arquivo vazio/corrompido se falhar
  rm -f "$FILENAME"
  exit 1
fi

# 2. Limpeza: Remove backups com mais de 7 dias
echo "🧹 Limpando backups antigos (+7 dias)..."
find $BACKUP_DIR -name "store_backup_*.sql.gz" -mtime +7 -delete

# Mostra espaço em disco usado
du -sh $BACKUP_DIR

echo "--- Fim do processo ---"