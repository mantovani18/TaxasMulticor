Simulador de Taxas — Multicor Tintas

Visão geral

Pequena página estática (HTML/CSS/JS) que ajuda a simular as taxas cobradas pela maquininha de cartão e mostra como fica o valor líquido por parcela.

Como usar

1. Abra o arquivo `index.html` no seu navegador (duplo clique ou abrir com).  
2. Informe o valor da venda, selecione o tipo de transação (débito, crédito à vista ou crédito parcelado).  
3. Caso use crédito parcelado, ajuste o número de parcelas.  
4. Abra o painel "Configurar taxas" para ajustar as porcentagens conforme o contrato da sua maquininha.  
5. Clique em "Calcular" para atualizar a simulação.

Campos importantes

- Valor da venda: valor bruto cobrado do cliente.  
- Tipo de transação: seleciona a regra de taxa.  
- Débito (%): taxa aplicada para vendas em débito.  
- Crédito à vista (%): taxa aplicada para vendas em crédito à vista.  
- Crédito parcelado: taxa base + adicional por parcela: a taxa efetiva aplicada é calculada por:  
  taxa_efetiva = taxa_base + (parcelas - 1) * taxa_por_parcela

Observações

- As taxas usadas por padrão são apenas exemplos (2.5% débito, 3.5% crédito à vista, 4.5% base para parcelado + 0.5% por parcela extra). Substitua pelos valores reais do contrato da Multicor Tintas.  
- A simulação separa por parcela o valor bruto, a parte referente à taxa e o líquido esperado por parcela.

Personalizações possíveis (próximos passos)

- Adicionar calendário com datas previstas de recebimento por parcela.  
- Permitir simular múltiplas vendas e agrupar resultados mensais.  
- Exportar o resultado para CSV.

Licença

Arquivo de exemplo criado para uso interno da Multicor Tintas.
