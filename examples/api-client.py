#!/usr/bin/env python3
"""
Cliente Python para API de Assinatura Digital ICP-Brasil

Este arquivo demonstra como integrar com a API usando Python

Instalação das dependências:
pip install requests

Uso:
python examples/api-client.py
"""

import requests
import json
import os
import sys
import argparse
from datetime import datetime
from typing import Dict, List, Optional, Any


class ICPBrasilAPIClient:
    """Cliente Python para API de Assinatura Digital ICP-Brasil"""

    def __init__(self, base_url: str = 'http://localhost:3000/api'):
        self.base_url = base_url
        self.token: Optional[str] = None
        self.session = requests.Session()

        # Configurar headers padrão
        self.session.headers.update({
            'User-Agent': 'ICP-Brasil-API-Client/1.0 (Python)'
        })

    def _make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """Fazer requisição HTTP com tratamento de erros"""
        url = f"{self.base_url}{endpoint}"

        # Adicionar token de autorização se disponível
        if self.token and 'headers' not in kwargs:
            kwargs['headers'] = {}

        if self.token:
            kwargs['headers']['Authorization'] = f'Bearer {self.token}'

        print(f"🌐 {method.upper()} {url}")

        try:
            response = self.session.request(method, url, **kwargs)

            # Log da resposta
            if response.status_code < 400:
                print(f"✅ {response.status_code} {response.reason}")
            else:
                print(f"❌ {response.status_code} {response.reason}")

            response.raise_for_status()
            return response

        except requests.exceptions.RequestException as e:
            error_msg = f"Erro na requisição: {str(e)}"

            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_data = e.response.json()
                    error_msg = error_data.get('message', error_msg)
                except (ValueError, KeyError):
                    pass

            raise Exception(error_msg)

    def login(self, email: str, password: str) -> Dict[str, Any]:
        """Realizar login na API"""
        print('\n🔐 Realizando login...')

        response = self._make_request('POST', '/auth/login', json={
            'email': email,
            'password': password
        })

        data = response.json()
        self.token = data['access_token']

        print('✅ Login realizado com sucesso')
        print(f'👤 Usuário: {data["user"]["name"]}')

        return data

    def upload_document(self, file_path: str) -> Dict[str, Any]:
        """Fazer upload de um documento"""
        print('\n📤 Fazendo upload do documento...')

        if not os.path.exists(file_path):
            raise FileNotFoundError(f'Arquivo não encontrado: {file_path}')

        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = self._make_request('POST', '/documents/upload', files=files)

        data = response.json()

        print('✅ Upload realizado com sucesso')
        print(f'📄 Document ID: {data["documentId"]}')
        print(f'📊 Tamanho: {data["size"]} bytes')

        return data

    def sign_document(self, document_id: str, certificate_path: str,
                     password: str, hash_algorithm: str = 'SHA-256') -> Dict[str, Any]:
        """Assinar documento com certificado ICP-Brasil"""
        print('\n🔏 Assinando documento...')

        if not os.path.exists(certificate_path):
            raise FileNotFoundError(f'Certificado não encontrado: {certificate_path}')

        with open(certificate_path, 'rb') as f:
            files = {'certificate': f}
            data = {
                'certificatePassword': password,
                'hashAlgorithm': hash_algorithm
            }

            response = self._make_request(
                'POST',
                f'/documents/{document_id}/sign-icp',
                files=files,
                data=data
            )

        result = response.json()

        print('✅ Documento assinado com sucesso')
        print(f'🆔 Signature ID: {result["signatureId"]}')
        print(f'👤 Signatário: {result["certificateInfo"]["subject"]}')
        print(f'🏢 Emissor: {result["certificateInfo"]["issuer"]}')

        return result

    def verify_document(self, document_id: str) -> Dict[str, Any]:
        """Verificar assinaturas de um documento"""
        print('\n🔍 Verificando assinaturas...')

        response = self._make_request('GET', f'/documents/{document_id}/verify')
        data = response.json()

        print('✅ Verificação concluída')
        print(f'📊 Total de assinaturas: {data["totalSignatures"]}')

        for i, signature in enumerate(data['signatures'], 1):
            print(f'\n🔐 Assinatura {i}:')
            print(f'  👤 Signatário: {signature["certificateInfo"]["subject"]}')
            print(f'  ✅ Válida: {"Sim" if signature["isValid"] else "Não"}')

            # Converter data para formato brasileiro
            signed_at = datetime.fromisoformat(signature['signedAt'].replace('Z', '+00:00'))
            print(f'  📅 Data: {signed_at.strftime("%d/%m/%Y %H:%M:%S")}')

            if 'validationDetails' in signature:
                details = signature['validationDetails']
                print(f'  🔗 Cadeia válida: {details["chainValid"]}')
                print(f'  ❌ Revogado: {not details["notRevoked"]}')
                print(f'  ⏰ Tempo válido: {details["timeValid"]}')

        return data

    def download_signed_document(self, document_id: str, output_path: str) -> str:
        """Baixar documento assinado"""
        print('\n📥 Baixando documento assinado...')

        response = self._make_request('GET', f'/documents/{document_id}/download/signed')

        # Salvar arquivo
        with open(output_path, 'wb') as f:
            f.write(response.content)

        file_size = os.path.getsize(output_path)

        print('✅ Download concluído')
        print(f'📁 Arquivo: {output_path}')
        print(f'📊 Tamanho: {file_size} bytes')

        return output_path

    def get_my_documents(self) -> Dict[str, Any]:
        """Listar documentos do usuário"""
        print('\n📋 Listando meus documentos...')

        response = self._make_request('GET', '/users/my-documents')
        data = response.json()

        print(f'✅ Documentos encontrados: {len(data["documents"])}')

        for i, doc in enumerate(data['documents'], 1):
            print(f'\n📄 Documento {i}:')
            print(f'  🆔 ID: {doc["id"]}')
            print(f'  📝 Nome: {doc["filename"]}')

            # Converter data para formato brasileiro
            uploaded_at = datetime.fromisoformat(doc['uploadedAt'].replace('Z', '+00:00'))
            print(f'  📅 Upload: {uploaded_at.strftime("%d/%m/%Y %H:%M:%S")}')

            print(f'  🔐 Assinaturas: {doc["signaturesCount"]}')
            print(f'  ✅ Assinado: {"Sim" if doc["isFullySigned"] else "Não"}')

        return data

    def logout(self) -> None:
        """Realizar logout"""
        print('\n🚪 Realizando logout...')

        self._make_request('POST', '/auth/logout')

        self.token = None
        print('✅ Logout realizado com sucesso')


def exemplo_completo():
    """Exemplo completo de uso da API"""
    api = ICPBrasilAPIClient()

    try:
        print('🚀 Iniciando exemplo completo da API ICP-Brasil')
        print('================================================')

        # 1. Login
        api.login('admin@test.com', 'admin123')

        # 2. Listar documentos existentes
        api.get_my_documents()

        # 3. Upload de documento
        document_path = os.path.join(os.path.dirname(__file__), 'test-document.pdf')
        upload = api.upload_document(document_path)

        # 4. Verificar documento (antes da assinatura)
        api.verify_document(upload['documentId'])

        # 5. Assinar documento (se certificado estiver disponível)
        certificate_path = os.path.join(os.path.dirname(__file__), 'test-certificate.p12')
        if os.path.exists(certificate_path):
            signature = api.sign_document(
                upload['documentId'],
                certificate_path,
                'test123'
            )

            # 6. Verificar após assinatura
            api.verify_document(upload['documentId'])

            # 7. Download do documento assinado
            output_path = f'documento_assinado_{upload["documentId"]}.p7s'
            api.download_signed_document(upload['documentId'], output_path)
        else:
            print('\n⚠️  Certificado de teste não encontrado, pulando assinatura')
            print(f'   Esperado em: {certificate_path}')

        # 8. Logout
        api.logout()

        print('\n🎉 Exemplo concluído com sucesso!')

    except Exception as e:
        print(f'\n❌ Erro durante a execução: {str(e)}')
        sys.exit(1)


def exemplo_simples():
    """Exemplo simples de login e listagem"""
    api = ICPBrasilAPIClient()

    try:
        print('🔓 Exemplo simples - Login e listagem de documentos')
        print('===================================================')

        # Login
        api.login('admin@test.com', 'admin123')

        # Listar documentos
        api.get_my_documents()

        # Logout
        api.logout()

        print('\n✅ Exemplo simples concluído!')

    except Exception as e:
        print(f'\n❌ Erro: {str(e)}')
        sys.exit(1)


def exemplo_upload():
    """Exemplo de upload de documento"""
    api = ICPBrasilAPIClient()

    try:
        print('📤 Exemplo de upload de documento')
        print('=================================')

        # Login
        api.login('admin@test.com', 'admin123')

        # Upload
        document_path = os.path.join(os.path.dirname(__file__), 'test-document.pdf')
        upload = api.upload_document(document_path)

        # Verificar
        api.verify_document(upload['documentId'])

        # Logout
        api.logout()

        print('\n✅ Exemplo de upload concluído!')
        print(f'📄 Document ID criado: {upload["documentId"]}')

    except Exception as e:
        print(f'\n❌ Erro: {str(e)}')
        sys.exit(1)


def main():
    """Função principal"""
    parser = argparse.ArgumentParser(
        description='Cliente Python para API de Assinatura Digital ICP-Brasil'
    )
    parser.add_argument(
        '--exemplo', '-e',
        choices=['completo', 'simples', 'upload'],
        default='completo',
        help='Tipo de exemplo a executar'
    )
    parser.add_argument(
        '--url', '-u',
        default='http://localhost:3000/api',
        help='URL base da API'
    )

    args = parser.parse_args()

    # Configurar URL se fornecida
    if hasattr(args, 'url'):
        global base_url
        base_url = args.url

    # Executar exemplo selecionado
    if args.exemplo == 'simples':
        exemplo_simples()
    elif args.exemplo == 'upload':
        exemplo_upload()
    else:
        exemplo_completo()


if __name__ == '__main__':
    main()