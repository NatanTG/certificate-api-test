# Documentos PDF Assinados

Esta pasta contém os PDFs gerados e assinados digitalmente pelo sistema ICP-Brasil.

## Formato dos Arquivos

Os arquivos são salvos com o seguinte padrão de nomenclatura:
```
{NOME_CERTIFICADO}_{TIMESTAMP}.pdf
```

Onde:
- `NOME_CERTIFICADO`: Nome do Common Name (CN) do certificado, sanitizado
- `TIMESTAMP`: Data e hora da assinatura no formato ISO (caracteres especiais substituídos por `-`)

## Características dos PDFs

- **Formato**: PAdES-compliant (PDF Advanced Electronic Signatures)
- **Compatibilidade**: ICP-Brasil
- **Validação**: Compatível com VALIDAR (validar.iti.gov.br)
- **Algoritmos**: SHA-256 com RSA ou ECDSA

## Importante

- Os arquivos `.pdf` são ignorados pelo git (configurado no `.gitignore`)
- Cada assinatura gera um novo arquivo PDF
- Os PDFs contêm assinatura digital embarcada e podem ser validados independentemente

## Validação

Para validar os PDFs gerados, acesse:
https://validar.iti.gov.br/