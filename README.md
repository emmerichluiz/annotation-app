# Annotation App

Aplicativo web em React para anotações em arquivos, com suporte inicial a imagens e PDFs.

## Funcionalidades MVP

- Upload de imagem ou PDF
- Ferramentas de anotação: retângulo, seta e texto
- Mudar cor da marcação
- Excluir anotações individualmente
- Limpar todas as marcações
- Salvar automaticamente no `localStorage`
- Visualização em tela com overlay de anotações

## Tecnologias

- React
- TypeScript
- Vite

## Como rodar

1. Instale as dependências:

```bash
npm install
```

2. Inicie o app localmente:

```bash
npm run dev
```

3. Acesse o endereço mostrado no terminal, normalmente:

```bash
http://localhost:5173
```

## Como usar

1. Clique em "Carregar arquivo".
2. Selecione uma imagem ou um PDF.
3. Escolha a ferramenta de anotação.
4. Clique na área do documento para criar uma marcação.
5. Para texto, digite o comentário no prompt.
6. As marcações ficam salvas automaticamente no navegador.

## Observações

Este é um MVP funcional com foco em demonstração e evolução. Em versões futuras, pode incluir:

- suporte a múltiplas páginas de PDF
- imagens com zoom
- sincronização em backend
- colaboração em tempo real
- exportação de anotações
