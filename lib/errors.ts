export class ApiValidationError extends Error {
  public fieldErrors: Record<string, string[]>;

  constructor(fieldErrors: Record<string, string[]>, message: string = "Por favor, corrija os erros nos campos destacados.") {
    super(message);
    this.name = "ApiValidationError";
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Utilitário para checar respostas HTTP e extrair erros de validação da API (DRF 400 Bad Request).
 * Lança um ApiValidationError com os campos correspondentes ou um Error comum se for outra falha.
 * 
 * @param response Resposta nativa do fetch()
 * @param fallbackMessage Mensagem padrão de erro genérico
 */
export async function handleApiResponse(response: Response, fallbackMessage: string = "Ocorreu um erro inesperado.") {
  if (response.ok) {
    return response;
  }

  let errorData: any = {};
  try {
    errorData = await response.json();
  } catch {
    // A resposta não era um JSON válido
    throw new Error(fallbackMessage);
  }

  // Se o erro é 400 (Bad Request) e o corpo é um objeto com listas de erros (padrão DRF)
  if (response.status === 400 && typeof errorData === 'object') {
    // Se o backend jogar explicitamente um erro global no JSON
    if (errorData.detail) {
      throw new Error(errorData.detail);
    }
    if (errorData.error) {
      throw new Error(errorData.error);
    }

    // Se possui a chave non_field_errors do DRF
    if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
      throw new Error(errorData.non_field_errors.join(', '));
    }

    // Se chegou até aqui, é um dicionário de erros de campos
    throw new ApiValidationError(errorData);
  }

  // Falhas 500, 401, 403 ou mensagens genéricas em texto plano
  if (errorData.detail) {
    throw new Error(errorData.detail);
  }
  
  throw new Error(fallbackMessage);
}
